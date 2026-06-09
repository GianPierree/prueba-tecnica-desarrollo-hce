/* eslint-disable prettier/prettier */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RpcException, ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PurchasesCab, PurchasesDet, Products } from '@app/database';
import type { CreatePurchasePayload, ProcessedPurchaseDetail } from './interfaces/purchases-ms.interface';
import { AuditLog } from '../../hce-backend/src/common/decorators/audit-log.decorator';
import { AUDIT_LOGGER_TOKEN } from '../../hce-backend/src/common/interfaces/audit-logger.interface';
import type { IAuditLogger } from '../../hce-backend/src/common/interfaces/audit-logger.interface';

@Injectable()
export class PurchasesMsService {
  private readonly logger = new Logger(PurchasesMsService.name);

  constructor(
    @InjectRepository(PurchasesCab) private purchaseCabRepo: Repository<PurchasesCab>,
    @InjectRepository(PurchasesDet) private purchaseDetRepo: Repository<PurchasesDet>,
    @InjectRepository(Products)     private productRepo: Repository<Products>,
    private dataSource: DataSource,
    @Inject('MOVEMENTS_SERVICE')    private movementsClient: ClientKafka,
    @Inject(AUDIT_LOGGER_TOKEN)     readonly auditLogger: IAuditLogger,
  ) {}

  @AuditLog('Procesar Compra')
  async processPurchase(data: CreatePurchasePayload) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subTotalCab = 0;
      let igvCab = 0;
      let totalCab = 0;

      const detallesProcesados: ProcessedPurchaseDetail[] = [];

      for (const det of data.detalles) {
        const producto = await queryRunner.manager.findOne(Products, {
          where: { Id_producto: det.Id_producto },
        });
        if (!producto) {
          throw new RpcException(`El producto con ID ${det.Id_producto} no existe`);
        }

        const subTotal = det.Cantidad * det.Precio;
        const igv     = subTotal * 0.18;
        const total   = subTotal + igv;

        subTotalCab += subTotal;
        igvCab      += igv;
        totalCab    += total;

        detallesProcesados.push({
          Id_producto: det.Id_producto,
          Cantidad: det.Cantidad,
          Precio: det.Precio,
          Sub_Total: subTotal,
          Igv: igv,
          Total: total,
          ProductoEntidad: producto,
        });
      }

      const cabecera = this.purchaseCabRepo.create({
        SubTotal: subTotalCab,
        Igv: igvCab,
        Total: totalCab,
      });
      const savedCab = await queryRunner.manager.save(cabecera);

      for (const d of detallesProcesados) {
        const detalle = this.purchaseDetRepo.create({
          Id_CompraCab: savedCab.Id_CompraCab,
          Id_producto:  d.Id_producto,
          Cantidad:     d.Cantidad,
          Precio:       d.Precio,
          Sub_Total:    d.Sub_Total,
          Igv:          d.Igv,
          Total:        d.Total,
        });
        await queryRunner.manager.save(detalle);

        d.ProductoEntidad.Costo       = d.Precio;
        d.ProductoEntidad.PrecioVenta = parseFloat((d.Precio * 1.35).toFixed(2));
        await queryRunner.manager.save(d.ProductoEntidad);
      }

      await queryRunner.commitTransaction();

      const movementPayload = {
        Id_TipoMovimiento: 1, // Entrada
        Id_DocumentoOrigen: savedCab.Id_CompraCab,
        detalles: data.detalles.map((d) => ({
          Id_producto: d.Id_producto,
          Cantidad: d.Cantidad,
        })),
      };

      try {
        await firstValueFrom(
          this.movementsClient.send('register_movement', movementPayload),
        );
        this.logger.log(`Movimiento de entrada registrado para compra ${savedCab.Id_CompraCab}`);
      } catch (movErr: unknown) {
        const msg = movErr instanceof Error ? movErr.message : 'desconocido';
        this.logger.error(
          `Compra ${savedCab.Id_CompraCab} guardada pero fallo en Kardex: ${msg}. ` +
          `Requiere reconciliación manual.`,
        );
      }

      this.logger.log(`Compra ${savedCab.Id_CompraCab} registrada. Precios actualizados.`);

      return {
        success: true,
        message: 'Compra registrada exitosamente. Costo y PrecioVenta actualizados.',
        Id_CompraCab: savedCab.Id_CompraCab,
      };
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error al registrar compra', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      await queryRunner.release();
    }
  }

  @AuditLog('Listar Compras')
  async listPurchases() {
    try {
      const compras = await this.purchaseCabRepo.find({
        order: { FecRegistro: 'DESC' },
      });

      const result = await Promise.all(
        compras.map(async (cab) => {
          const detalles = await this.purchaseDetRepo.find({
            where: { Id_CompraCab: cab.Id_CompraCab },
          });
          return { ...cab, detalles };
        }),
      );

      return { success: true, data: result };
    } catch {
      return { success: false, error: 'No se pudo obtener las compras' };
    }
  }
}
