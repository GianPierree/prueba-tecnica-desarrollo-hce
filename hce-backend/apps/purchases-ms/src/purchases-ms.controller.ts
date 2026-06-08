import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PurchasesMsService } from './purchases-ms.service';
import type { CreatePurchasePayload } from './interfaces/purchases-ms.interface';

@Controller()
export class PurchasesMsController {
  constructor(private readonly purchasesMsService: PurchasesMsService) {}

  @MessagePattern('create_purchase')
  async handleCreatePurchase(@Payload() data: CreatePurchasePayload) {
    return await this.purchasesMsService.processPurchase(data);
  }
}
