import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SaleDetailDto {
  @ApiProperty({ example: 1, description: 'ID del producto a vender' })
  @IsInt()
  @IsNotEmpty()
  Id_producto: number;

  @ApiProperty({
    example: 5,
    description: 'Cantidad a vender (no puede superar el stock)',
  })
  @IsInt()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  Cantidad: number;

  @ApiProperty({ example: 13.5, description: 'Precio de venta unitario' })
  @IsNumber()
  @Min(0.1, { message: 'El precio de venta debe ser válido' })
  Precio: number;
}

export class CreateSaleDto {
  @ApiProperty({
    type: [SaleDetailDto],
    description: 'Lista de productos a vender',
    example: [
      {
        Id_producto: 1,
        Cantidad: 5,
        Precio: 13.5,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleDetailDto)
  @IsNotEmpty({ message: 'Debe enviar al menos un detalle de venta' })
  detalles: SaleDetailDto[];
}
