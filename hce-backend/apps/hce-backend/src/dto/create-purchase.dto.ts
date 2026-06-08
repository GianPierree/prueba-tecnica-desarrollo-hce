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

export class PurchaseDetailDto {
  @ApiProperty({ example: 1, description: 'ID del producto a comprar' })
  @IsInt()
  @IsNotEmpty()
  Id_producto: number;

  @ApiProperty({ example: 50, description: 'Cantidad comprada (mínimo 1)' })
  @IsInt()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  Cantidad: number;

  @ApiProperty({ example: 10.0, description: 'Precio unitario de compra' })
  @IsNumber()
  @Min(0.1, { message: 'El precio debe ser válido' })
  Precio: number;
}

export class CreatePurchaseDto {
  @ApiProperty({
    type: [PurchaseDetailDto],
    description: 'Lista de productos a comprar',
    example: [
      { Id_producto: 1, Cantidad: 50, Precio: 10.0 },
      { Id_producto: 2, Cantidad: 30, Precio: 8.5 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseDetailDto)
  @IsNotEmpty({ message: 'Debe enviar al menos un detalle de compra' })
  detalles: PurchaseDetailDto[];
}
