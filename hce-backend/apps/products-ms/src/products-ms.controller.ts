/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductsMsService } from './products-ms.service';

@Controller()
export class ProductsMsController {
  constructor(private readonly productsMsService: ProductsMsService) {}

  @MessagePattern('create_product')
  async handleCreateProduct(@Payload() data: unknown) {
    return await this.productsMsService.createProduct(data as any);
  }

  @MessagePattern('update_product')
  async handleUpdateProduct(@Payload() data: unknown) {
    return await this.productsMsService.updateProduct(data as any);
  }

  @MessagePattern('list_products')
  async handleListProducts() {
    return await this.productsMsService.listProducts();
  }
}
