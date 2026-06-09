/* eslint-disable prettier/prettier */
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuditLog } from '../decorators/audit-log.decorator';
import { AUDIT_LOGGER_TOKEN } from '../interfaces/audit-logger.interface';
import type { IAuditLogger } from '../interfaces/audit-logger.interface';
import { CreatePurchaseDto } from '../../dto/create-purchase.dto';
import { CreateSaleDto } from '../../dto/create-sale.dto';
import { CreateProductDto } from '../../dto/create-product.dto';
import { UpdateProductDto } from '../../dto/update-product.dto';

@Injectable()
export class BusinessFacade implements OnModuleInit {
  private readonly logger = new Logger(BusinessFacade.name);

  constructor(
    @Inject('PURCHASES_SERVICE')  private readonly purchasesClient: ClientKafka,
    @Inject('SALES_SERVICE')      private readonly salesClient: ClientKafka,
    @Inject('MOVEMENTS_SERVICE')  private readonly movementsClient: ClientKafka,
    @Inject('PRODUCTS_SERVICE')   private readonly productsClient: ClientKafka,
    @Inject(AUDIT_LOGGER_TOKEN)   readonly auditLogger: IAuditLogger,
  ) {}

  async onModuleInit() {
    this.purchasesClient.subscribeToResponseOf('create_purchase');
    this.purchasesClient.subscribeToResponseOf('list_purchases');

    this.salesClient.subscribeToResponseOf('create_sale');
    this.salesClient.subscribeToResponseOf('list_sales');

    this.movementsClient.subscribeToResponseOf('get_kardex');
    this.movementsClient.subscribeToResponseOf('get_product_movements');

    this.productsClient.subscribeToResponseOf('create_product');
    this.productsClient.subscribeToResponseOf('update_product');
    this.productsClient.subscribeToResponseOf('list_products');

    await Promise.all([
      this.purchasesClient.connect(),
      this.salesClient.connect(),
      this.movementsClient.connect(),
      this.productsClient.connect(),
    ]);

    this.logger.log('BusinessFacade: todos los clientes Kafka conectados');
  }

  @AuditLog('Registrar Compra')
  async createPurchase(dto: CreatePurchaseDto): Promise<unknown> {
    return firstValueFrom(this.purchasesClient.send('create_purchase', dto));
  }

  @AuditLog('Listar Compras')
  async listPurchases(): Promise<unknown> {
    return firstValueFrom(this.purchasesClient.send('list_purchases', {}));
  }

  @AuditLog('Registrar Venta')
  async createSale(dto: CreateSaleDto): Promise<unknown> {
    return firstValueFrom(this.salesClient.send('create_sale', dto));
  }

  @AuditLog('Listar Ventas')
  async listSales(): Promise<unknown> {
    return firstValueFrom(this.salesClient.send('list_sales', {}));
  }

  @AuditLog('Obtener Kardex')
  async getKardex(): Promise<unknown> {
    return firstValueFrom(this.movementsClient.send('get_kardex', {}));
  }

  @AuditLog('Movimientos por Producto')
  async getProductMovements(productId: number): Promise<unknown> {
    return firstValueFrom(
      this.movementsClient.send('get_product_movements', { productId }),
    );
  }

  @AuditLog('Registrar Producto')
  async createProduct(dto: CreateProductDto): Promise<unknown> {
    return firstValueFrom(this.productsClient.send('create_product', dto));
  }

  @AuditLog('Actualizar Producto')
  async updateProduct(id: number, dto: UpdateProductDto): Promise<unknown> {
    return firstValueFrom(
      this.productsClient.send('update_product', { id, ...dto }),
    );
  }

  @AuditLog('Listar Productos')
  async listProducts(): Promise<unknown> {
    return firstValueFrom(this.productsClient.send('list_products', {}));
  }
}
