/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Paracetamol 500mg', description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del producto es obligatorio' })
  @MinLength(2)
  Nombre_producto: string;

  @ApiProperty({ example: 'LOTE-2024-001', description: 'Número de lote' })
  @IsString()
  @IsNotEmpty({ message: 'El número de lote es obligatorio' })
  NroLote: string;

  @ApiProperty({ example: 15.5, description: 'Costo de compra del producto' })
  @IsNumber()
  @Min(0.01, { message: 'El costo debe ser mayor a 0' })
  Costo: number;

  @ApiProperty({ example: 20.93, description: 'Precio de venta (se recalcula automáticamente al comprar: Costo × 1.35)' })
  @IsNumber()
  @Min(0.01, { message: 'El precio de venta debe ser mayor a 0' })
  PrecioVenta: number;
}
