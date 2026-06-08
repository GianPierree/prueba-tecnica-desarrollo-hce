import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@app/database';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const userExists = await this.userRepository.findOne({
      where: { Correo: registerDto.email },
    });
    if (userExists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = this.userRepository.create({
      NombreCompleto: registerDto.nombreCompleto,
      Correo: registerDto.email,
      Clave: hashedPassword,
    });

    await this.userRepository.save(newUser);
    return { message: 'Usuario creado exitosamente' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { Correo: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.Clave);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.Id_usuario, email: user.Correo };

    return {
      access_token: await this.jwtService.signAsync(payload),
      expires_in: '30m',
    };
  }
}
