/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { MovementsCab, MovementsDet, Products } from '@app/database';
import { RegisterMovementPayload } from './interfaces/movements-ms.interface';

@Injectable()
export class MovementsMsService {
  private readonly logger = new Logger(MovementsMsService.name);

  constructor(
    @InjectRepository(MovementsCab) private movCabRepo: Repository<MovementsCab>,
    @InjectRepository(MovementsDet) private movDetRepo: Repository<MovementsDet>,
    @InjectRepository(Products)     private productRepo: Repository<Products>,
    private dataSource: DataSource,
  ) {}

  async registerMovement(data: RegisterMovementPayload) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cabecera = this.movCabRepo.create({
        Id_TipoMovimiento: data.Id_TipoMovimiento,
        Id_DocumentoOrigen: data.Id_DocumentoOrigen,
      });
      const savedCab = await queryRunner.manager.save(cabecera);

      for (const det of data.detalles) {
        const detalle = this.movDetRepo.create({
          Id_movimientocab: savedCab.Id_MovimientoCab,
          Id_Producto: det.Id_producto,
          Cantidad: det.Cantidad,
        });
        await queryRunner.manager.save(detalle);
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        `Movimiento registrado: Tipo ${data.Id_TipoMovimiento} | Origen: ${data.Id_DocumentoOrigen}`,
      );
      return { success: true, message: 'Kardex actualizado correctamente' };
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error al registrar movimiento en Kardex', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      await queryRunner.release();
    }
  }

  async getStockByProduct(productId: number): Promise<{ success: boolean; stock: number }> {
    try {
      const rows = await this.dataSource.query<{ stock: number }[]>(`
        SELECT ISNULL(SUM(
          CASE mc.Id_TipoMovimiento
            WHEN 1 THEN md.Cantidad
            WHEN 2 THEN -md.Cantidad
            ELSE 0
          END
        ), 0) AS stock
        FROM MovementsDet md
        INNER JOIN MovementsCab mc ON md.Id_movimientocab = mc.Id_MovimientoCab
        WHERE md.Id_Producto = @0
      `, [productId]);

      const stock = Number(rows[0]?.stock ?? 0);
      return { success: true, stock };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, stock: 0 };
    }
  }

  async getKardexView() {
    try {
      const stockQuery = await this.dataSource.query(`
        SELECT
          p.Id_producto,
          p.Nombre_producto,
          p.Costo,
          p.PrecioVenta,
          ISNULL(SUM(
            CASE mc.Id_TipoMovimiento
              WHEN 1 THEN md.Cantidad
              WHEN 2 THEN -md.Cantidad
              ELSE 0
            END
          ), 0) AS StockActual
        FROM Products p
        LEFT JOIN MovementsDet md ON p.Id_producto = md.Id_Producto
        LEFT JOIN MovementsCab mc ON md.Id_movimientocab = mc.Id_MovimientoCab
        GROUP BY p.Id_producto, p.Nombre_producto, p.Costo, p.PrecioVenta
        ORDER BY p.Id_producto
      `);
      return { success: true, data: stockQuery };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, error: msg };
    }
  }

  async getProductMovements(productId: number) {
    try {
      const movimientos = await this.movDetRepo.find({
        where: { Id_Producto: productId },
        relations: { MovimientoCab: true },
      });

      const historial = movimientos.map((mov) => ({
        FechaRegistro: mov.MovimientoCab?.Fec_registro ?? new Date(),
        TipoMovimiento:
          mov.MovimientoCab?.Id_TipoMovimiento === 1 ? 'Entrada' : 'Salida',
        Cantidad: mov.Cantidad,
      }));

      return { success: true, data: historial };
    } catch {
      return { success: false, error: 'No se pudo obtener el historial' };
    }
  }
}
