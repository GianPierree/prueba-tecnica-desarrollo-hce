/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from './auth/auth.guard';
import { BusinessFacade } from './common/facades/business.facade';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { CreateSaleDto } from './dto/create-sale.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiTags('Compras')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('purchases')
export class PurchasesController {
  constructor(private readonly facade: BusinessFacade) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una compra con detalle de productos' })
  @ApiResponse({ status: 201, description: 'Compra registrada y Kardex actualizado (Entrada).' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  createPurchase(@Body() dto: CreatePurchaseDto) {
    return this.facade.createPurchase(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las compras registradas' })
  @ApiResponse({ status: 200, description: 'Lista de compras con su detalle.' })
  listPurchases() {
    return this.facade.listPurchases();
  }
}

@ApiTags('Ventas')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('sales')
export class SalesController {
  constructor(private readonly facade: BusinessFacade) {}

  @Post()
  @ApiOperation({ summary: 'Registrar una venta con detalle de productos' })
  @ApiResponse({ status: 201, description: 'Venta registrada y Kardex actualizado (Salida).' })
  @ApiResponse({ status: 400, description: 'Stock insuficiente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  createSale(@Body() dto: CreateSaleDto) {
    return this.facade.createSale(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las ventas registradas' })
  @ApiResponse({ status: 200, description: 'Lista de ventas con su detalle.' })
  listSales() {
    return this.facade.listSales();
  }
}

@ApiTags('Productos')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly facade: BusinessFacade) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo producto' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.facade.createProduct(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un producto existente' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Producto actualizado.' })
  @ApiResponse({ status: 404, description: 'Producto no encontrado.' })
  updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
  ) {
    return this.facade.updateProduct(id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los productos' })
  @ApiResponse({ status: 200, description: 'Lista de productos con stock y precios.' })
  listProducts() {
    return this.facade.listProducts();
  }
}

@ApiTags('Kardex')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('kardex')
export class KardexController {
  constructor(private readonly facade: BusinessFacade) {}

  @Get()
  @ApiOperation({ summary: 'Listar Kardex: stock actual, costo y precio por producto' })
  @ApiResponse({ status: 200, description: 'Vista de Kardex con todos los productos.' })
  getKardex() {
    return this.facade.getKardex();
  }

  @Get('movements/:productId')
  @ApiOperation({ summary: 'Historial de movimientos de un producto (modal de detalle)' })
  @ApiParam({ name: 'productId', type: 'number', description: 'ID del producto' })
  @ApiResponse({ status: 200, description: 'Historial de compras y ventas del producto.' })
  getProductMovements(@Param('productId', ParseIntPipe) productId: number) {
    return this.facade.getProductMovements(productId);
  }
}
