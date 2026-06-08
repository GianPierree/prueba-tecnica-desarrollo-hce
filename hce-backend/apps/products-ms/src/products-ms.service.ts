/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { Products } from '@app/database';
import { AuditLog } from '../../hce-backend/src/common/decorators/audit-log.decorator';

interface CreateProductPayload {
  Nombre_producto: string;
  NroLote: string;
  Costo: number;
  PrecioVenta: number;
}

interface UpdateProductPayload {
  id: number;
  Nombre_producto?: string;
  NroLote?: string;
  Costo?: number;
  PrecioVenta?: number;
}

@Injectable()
export class ProductsMsService {
  private readonly logger = new Logger(ProductsMsService.name);

  constructor(
    @InjectRepository(Products)
    private productRepo: Repository<Products>,
  ) {}

  @AuditLog('Crear Producto')
  async createProduct(data: CreateProductPayload) {
    try {
      const producto = this.productRepo.create({
        Nombre_producto: data.Nombre_producto,
        NroLote: data.NroLote,
        Costo: data.Costo,
        PrecioVenta: data.PrecioVenta,
        StockActual: 0,
      });

      const saved = await this.productRepo.save(producto);
      this.logger.log(`Producto creado: ${saved.Nombre_producto} (ID: ${saved.Id_producto})`);

      return {
        success: true,
        message: 'Producto registrado exitosamente',
        data: saved,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error al crear producto', msg);
      return { success: false, error: msg };
    }
  }

  @AuditLog('Actualizar Producto')
  async updateProduct(data: UpdateProductPayload) {
    try {
      const { id, ...updates } = data;

      const producto = await this.productRepo.findOne({
        where: { Id_producto: id },
      });

      if (!producto) {
        throw new RpcException(`Producto con ID ${id} no encontrado`);
      }

      Object.assign(producto, updates);
      const saved = await this.productRepo.save(producto);

      this.logger.log(`Producto ${id} actualizado`);
      return {
        success: true,
        message: 'Producto actualizado exitosamente',
        data: saved,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      this.logger.error('Error al actualizar producto', msg);
      return { success: false, error: msg };
    }
  }

  @AuditLog('Listar Productos')
  async listProducts() {
    try {
      const productos = await this.productRepo.find({
        order: { Id_producto: 'ASC' },
      });

      return { success: true, data: productos };
    } catch (error: unknown) {
      return { success: false, error: 'No se pudo obtener los productos' };
    }
  }
}
