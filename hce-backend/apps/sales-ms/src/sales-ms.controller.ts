import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SalesMsService } from './sales-ms.service';

@Controller()
export class SalesMsController {
  constructor(private readonly salesService: SalesMsService) {}

  @MessagePattern('create_sale')
  async handleCreateSale(@Payload() data: any) {
    return await this.salesService.processSale(data);
  }
}
