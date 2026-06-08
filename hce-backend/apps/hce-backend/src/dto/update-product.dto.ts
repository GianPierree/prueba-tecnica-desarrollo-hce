import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Paracetamol 1000mg' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  Nombre_producto?: string;

  @ApiPropertyOptional({ example: 'LOTE-2024-002' })
  @IsOptional()
  @IsString()
  NroLote?: string;

  @ApiPropertyOptional({ example: 18.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  Costo?: number;

  @ApiPropertyOptional({ example: 24.3 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  PrecioVenta?: number;
}
