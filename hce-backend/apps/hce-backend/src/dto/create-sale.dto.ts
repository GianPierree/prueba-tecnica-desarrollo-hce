import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaleDetailDto {
  @IsInt()
  @IsNotEmpty()
  Id_producto: number;

  @IsInt()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  Cantidad: number;

  @IsNumber()
  @Min(0.1, { message: 'El precio de venta debe ser válido' })
  Precio: number;
}

export class CreateSaleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaleDetailDto)
  @IsNotEmpty({ message: 'Debe enviar al menos un detalle de venta' })
  detalles: SaleDetailDto[];
}
