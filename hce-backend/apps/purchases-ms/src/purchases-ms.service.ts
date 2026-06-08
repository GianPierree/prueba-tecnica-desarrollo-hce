/* eslint-disable prettier/prettier */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RpcException, ClientKafka } from '@nestjs/microservices';
import { PurchasesCab, PurchasesDet, Products } from '@app/database';
import { CreatePurchasePayload, ProcessedPurchaseDetail } from './interfaces/purchases-ms.interface';

@Injectable()
export class PurchasesMsService {
  private readonly logger = new Logger(PurchasesMsService.name);

  constructor(
    @InjectRepository(PurchasesCab) private purchaseCabRepo: Repository<PurchasesCab>,
    @InjectRepository(PurchasesDet) private purchaseDetRepo: Repository<PurchasesDet>,
    @InjectRepository(Products) private productRepo: Repository<Products>,
    private dataSource: DataSource,
    @Inject('MOVEMENTS_SERVICE') private movementsClient: ClientKafka,
  ) {}

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
          where: { Id_producto: det.Id_producto } 
        });

        if (!producto) {
          throw new RpcException(`El producto con ID ${det.Id_producto} no existe`);
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

      const cabecera = this.purchaseCabRepo.create({
        SubTotal: subTotalCab,
        Igv: igvCab,
        Total: totalCab,
      });
      const savedCab = await queryRunner.manager.save(cabecera);

      for (const d of detallesProcesados) {
        const detalle = this.purchaseDetRepo.create({
          Id_CompraCab: savedCab.Id_CompraCab, 
          Id_producto: d.Id_producto,
          Cantidad: d.Cantidad,
          Precio: d.Precio,
          Sub_Total: d.Sub_Total,
          Igv: d.Igv,
          Total: d.Total,
        });
        await queryRunner.manager.save(detalle);

        d.ProductoEntidad.StockActual += d.Cantidad;
        await queryRunner.manager.save(d.ProductoEntidad);
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Compra ${savedCab.Id_CompraCab} registrada. Stock sumado con éxito.`);

      const movementPayload = {
        Id_TipoMovimiento: 1,
        Id_DocumentoOrigen: savedCab.Id_CompraCab,
        detalles: data.detalles.map(d => ({
          Id_producto: d.Id_producto,
          Cantidad: d.Cantidad,
        })),
      };
      
      this.movementsClient.emit('register_movement', movementPayload);

      return {
        success: true,
        message: 'Compra registrada exitosamente y Kardex actualizado',
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
}