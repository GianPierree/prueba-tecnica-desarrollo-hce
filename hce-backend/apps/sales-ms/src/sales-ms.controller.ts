import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { SalesMsService } from './sales-ms.service';
import type { CreateSalePayload } from './interfaces/sales-ms.interface';

@Controller()
export class SalesMsController {
  constructor(private readonly salesService: SalesMsService) {}

  @MessagePattern('create_sale')
  async handleCreateSale(@Payload() data: CreateSalePayload) {
    return await this.salesService.processSale(data);
  }

  @MessagePattern('list_sales')
  async handleListSales() {
    return await this.salesService.listSales();
  }
}
