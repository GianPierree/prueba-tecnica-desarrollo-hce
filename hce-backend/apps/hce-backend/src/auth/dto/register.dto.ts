/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Gian Pierree Muñoz', description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  nombreCompleto: string;

  @ApiProperty({ example: 'admin@hce.com', description: 'Correo electrónico' })
  @IsEmail({}, { message: 'El formato del correo es inválido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @ApiProperty({ example: 'admin123', description: 'Contraseña' })
  @IsString()
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
