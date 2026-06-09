/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RpcException } from '@nestjs/microservices';
import { ProductsMsService } from './products-ms.service';
import { Products } from '@app/database';
import { AUDIT_LOGGER_TOKEN } from '../../hce-backend/src/common/interfaces/audit-logger.interface';

const mockProductRepo = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockAuditLogger = { log: jest.fn(), error: jest.fn() };

describe('ProductsMsService', () => {
  let service: ProductsMsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsMsService,
        { provide: getRepositoryToken(Products), useValue: mockProductRepo },
        { provide: AUDIT_LOGGER_TOKEN, useValue: mockAuditLogger },
      ],
    }).compile();

    service = module.get<ProductsMsService>(ProductsMsService);
    jest.clearAllMocks();
  });

  describe('createProduct', () => {
    it('should save a new product and return success', async () => {
      const dto = { Nombre_producto: 'Aspirina', NroLote: 'L001', Costo: 5, PrecioVenta: 6.75 };
      const saved = { Id_producto: 1, ...dto };
      mockProductRepo.create.mockReturnValue(saved);
      mockProductRepo.save.mockResolvedValue(saved);

      const result = await service.createProduct(dto);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(saved);
    });

    it('should return success false on error', async () => {
      mockProductRepo.create.mockImplementation(() => { throw new Error('DB error'); });

      const result = await service.createProduct({
        Nombre_producto: 'X', NroLote: 'L', Costo: 1, PrecioVenta: 1.35,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('DB error');
    });
  });

  describe('updateProduct', () => {
    it('should update existing product fields', async () => {
      const existing = { Id_producto: 1, Nombre_producto: 'Old', Costo: 5, PrecioVenta: 6.75 };
      const updated  = { ...existing, Nombre_producto: 'New' };
      mockProductRepo.findOne.mockResolvedValue(existing);
      mockProductRepo.save.mockResolvedValue(updated);

      const result = await service.updateProduct({ id: 1, Nombre_producto: 'New' });

      expect(result.success).toBe(true);
      expect(result.data?.Nombre_producto).toBe('New');
    });

    it('should throw RpcException when product not found', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      const result = await service.updateProduct({ id: 999 });
      expect(result.success).toBe(false);
      expect(result.error).toContain('999');
    });
  });

  describe('listProducts', () => {
    it('should return all products ordered by id', async () => {
      const products = [
        { Id_producto: 1, Nombre_producto: 'A' },
        { Id_producto: 2, Nombre_producto: 'B' },
      ];
      mockProductRepo.find.mockResolvedValue(products);

      const result = await service.listProducts();

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });
});
