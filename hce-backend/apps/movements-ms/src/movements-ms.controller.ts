import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MovementsMsService } from './movements-ms.service';
import type { RegisterMovementPayload } from './interfaces/movements-ms.interface';

@Controller()
export class MovementsMsController {
  constructor(private readonly movementsMsService: MovementsMsService) {}

  @MessagePattern('register_movement')
  async handleRegisterMovement(@Payload() data: RegisterMovementPayload) {
    return await this.movementsMsService.registerMovement(data);
  }

  @MessagePattern('get_kardex')
  async handleGetKardex() {
    return await this.movementsMsService.getKardexView();
  }

  @MessagePattern('get_product_movements')
  async handleGetProductMovements(@Payload() data: { productId: number }) {
    return await this.movementsMsService.getProductMovements(data.productId);
  }

  @MessagePattern('get_stock_by_product')
  async handleGetStockByProduct(@Payload() data: { productId: number }) {
    return await this.movementsMsService.getStockByProduct(data.productId);
  }
}
