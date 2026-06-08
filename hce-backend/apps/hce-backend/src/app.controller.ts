/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { AuthGuard } from './auth/auth.guard';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Operaciones Transaccionales')
@ApiBearerAuth()
@Controller()
export class AppController implements OnModuleInit {
  constructor(
    @Inject('PURCHASES_SERVICE') private readonly purchasesClient: ClientKafka,
    @Inject('SALES_SERVICE') private readonly salesClient: ClientKafka,
    @Inject('MOVEMENTS_SERVICE') private readonly movementsClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.purchasesClient.subscribeToResponseOf('create_purchase');
    this.salesClient.subscribeToResponseOf('create_sale');
    this.movementsClient.subscribeToResponseOf('get_kardex');

    await this.purchasesClient.connect();
    await this.salesClient.connect();
    await this.movementsClient.connect();
  }

  @UseGuards(AuthGuard)
  @Post('purchases')
  @ApiOperation({ summary: 'Registrar una nueva compra (Entrada al Kardex)' })
  @ApiResponse({ status: 201, description: 'Compra registrada con éxito y stock actualizado.' })
  createPurchase(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesClient.send('create_purchase', createPurchaseDto);
  }

  @UseGuards(AuthGuard)
  @Post('sales')
  @ApiOperation({ summary: 'Registrar una nueva venta (Salida del Kardex)' })
  @ApiResponse({ status: 201, description: 'Venta registrada con éxito y stock descontado.' })
  @ApiResponse({ status: 400, description: 'Error por falta de stock.' })
  createSale(@Body() createSaleDto: CreateSaleDto) {
    return this.salesClient.send('create_sale', createSaleDto);
  }

  @UseGuards(AuthGuard)
  @Get('kardex')
  @ApiOperation({ summary: 'Obtener la vista principal del Kardex Histórico' })
  getKardex() {
    return this.movementsClient.send('get_kardex', {});
  }
}
