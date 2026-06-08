/* eslint-disable prettier/prettier */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RpcException, ClientKafka } from '@nestjs/microservices';
import { SalesCab, SalesDet, Products } from '@app/database';
import { CreateSalePayload, ProcessedDetail } from './interfaces/sales-ms.interface';

@Injectable()
export class SalesMsService {
  private readonly logger = new Logger(SalesMsService.name);

  constructor(
    @InjectRepository(SalesCab) private ventaCabRepo: Repository<SalesCab>,
    @InjectRepository(SalesDet) private ventaDetRepo: Repository<SalesDet>,
    @InjectRepository(Products) private productRepo: Repository<Products>,
    @Inject('MOVEMENTS_SERVICE') private movementsClient: ClientKafka,
    private dataSource: DataSource,
  ) {}

  async processSale(data: CreateSalePayload) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subTotalCab = 0;
      let igvCab = 0;
      let totalCab = 0;
      
      const detallesProcesados: ProcessedDetail[] = [];

      for (const det of data.detalles) {
        const producto = await queryRunner.manager.findOne(Products, { 
          where: { Id_producto: det.Id_producto } 
        });

        if (!producto) {
          throw new RpcException(`El producto con ID ${det.Id_producto} no existe`);
        }

        if (det.Cantidad > producto.StockActual) {
          throw new RpcException(`La cantidad solicitada (${det.Cantidad}) para el producto ${producto.Nombre_producto} no debe ser mayor al stock actual (${producto.StockActual})`);
        }

        const subTotal = det.Cantidad * det.Precio;
        const igv = subTotal * 0.18;
        const total = subTotal + igv;

        subTotalCab += subTotal;
        igvCab += igv;
        totalCab += total;

        detallesProcesados.push({
          Id_producto: det.Id_producto,
          Cantidad: det.Cantidad,
          Precio: det.Precio,
          Sub_Total: subTotal,
          Igv: igv,
          Total: total,
          ProductoEntidad: producto 
        });
      }

      const cabecera = this.ventaCabRepo.create({
        SubTotal: subTotalCab,
        Igv: igvCab,
        Total: totalCab,
      });
      const savedCab = await queryRunner.manager.save(cabecera);

      for (const d of detallesProcesados) {
        const detalle = this.ventaDetRepo.create({
          Id_VentaCab: savedCab.Id_VentaCab,
          Id_producto: d.Id_producto,
          Cantidad: d.Cantidad,
          Precio: d.Precio,
          Sub_Total: d.Sub_Total,
          Igv: d.Igv,
          Total: d.Total,
        });
        await queryRunner.manager.save(detalle);

        d.ProductoEntidad.StockActual -= d.Cantidad;
        await queryRunner.manager.save(d.ProductoEntidad);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Venta ${savedCab.Id_VentaCab} registrada. Stock actualizado.`);

      const movementPayload = {
        Id_TipoMovimiento: 2,
        Id_DocumentoOrigen: savedCab.Id_VentaCab,
        detalles: data.detalles.map(d => ({
          Id_producto: d.Id_producto,
          Cantidad: d.Cantidad,
        })),
      };
      
      this.movementsClient.emit('register_movement', movementPayload);

      return {
        success: true,
        message: 'Venta registrada exitosamente',
        Id_VentaCab: savedCab.Id_VentaCab,
      };
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

      this.logger.error('Error al registrar venta', errorMessage);
      return { success: false, error: errorMessage }; 
    } finally {
      await queryRunner.release();
    }
  }
}
