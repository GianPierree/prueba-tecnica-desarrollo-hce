import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PurchaseDetailDto {
  @IsInt()
  @IsNotEmpty()
  Id_producto: number;

  @IsInt()
  @Min(1, { message: 'La cantidad debe ser mayor a 0' })
  Cantidad: number;

  @IsNumber()
  @Min(0.1, { message: 'El precio debe ser válido' })
  Precio: number;
}

export class CreatePurchaseDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseDetailDto)
  @IsNotEmpty({ message: 'Debe enviar al menos un detalle de compra' })
  detalles: PurchaseDetailDto[];
}
