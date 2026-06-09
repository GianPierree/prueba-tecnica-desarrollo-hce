/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '@app/database';
import * as bcrypt from 'bcrypt';

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  signAsync: jest.fn().mockResolvedValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user successfully', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue({ NombreCompleto: 'Test', Correo: 'test@test.com' });
      mockUserRepo.save.mockResolvedValue({ Id_usuario: 1 });

      const result = await service.register({
        nombreCompleto: 'Test',
        email: 'test@test.com',
        password: 'password123',
      });

      expect(result).toEqual({ message: 'Usuario creado exitosamente' });
      expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ Id_usuario: 1 });

      await expect(
        service.register({
          nombreCompleto: 'Test',
          email: 'existing@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should return access_token on valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      mockUserRepo.findOne.mockResolvedValue({
        Id_usuario: 1,
        Correo: 'test@test.com',
        Clave: hashedPassword,
      });

      const result = await service.login({ email: 'test@test.com', password: 'password123' });

      expect(result).toHaveProperty('access_token', 'mock-token');
      expect(result).toHaveProperty('expires_in', '30m');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('correct', 10);
      mockUserRepo.findOne.mockResolvedValue({ Correo: 'test@test.com', Clave: hashedPassword });

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
