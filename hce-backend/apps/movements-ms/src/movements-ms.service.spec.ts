/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MovementsMsService } from './movements-ms.service';
import { MovementsCab, MovementsDet, Products } from '@app/database';

const mockQueryRunner = {
  connect: jest.fn(),
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  rollbackTransaction: jest.fn(),
  release: jest.fn(),
  manager: { save: jest.fn() },
};

const mockDataSource = {
  createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  query: jest.fn(),
};

const mockMovCabRepo = { create: jest.fn() };
const mockMovDetRepo = { create: jest.fn(), find: jest.fn() };
const mockProductRepo = {};

describe('MovementsMsService', () => {
  let service: MovementsMsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovementsMsService,
        { provide: getRepositoryToken(MovementsCab), useValue: mockMovCabRepo },
        { provide: getRepositoryToken(MovementsDet), useValue: mockMovDetRepo },
        { provide: getRepositoryToken(Products),     useValue: mockProductRepo },
        { provide: 'DataSource', useValue: mockDataSource },
      ],
    })
      .overrideProvider('DataSource')
      .useValue(mockDataSource)
      .compile();

    service = module.get<MovementsMsService>(MovementsMsService);
    jest.clearAllMocks();
  });

  describe('registerMovement', () => {
    it('should register movement and return success', async () => {
      const cab = { Id_MovimientoCab: 10 };
      mockMovCabRepo.create.mockReturnValue(cab);
      mockMovDetRepo.create.mockReturnValue({});
      mockQueryRunner.manager.save.mockResolvedValue(cab);

      const payload = {
        Id_TipoMovimiento: 1,
        Id_DocumentoOrigen: 1,
        detalles: [{ Id_producto: 1, Cantidad: 10 }],
      };

      const result = await service.registerMovement(payload);

      expect(result.success).toBe(true);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should rollback and return success=false on error', async () => {
      mockMovCabRepo.create.mockImplementation(() => { throw new Error('fail'); });

      const payload = { Id_TipoMovimiento: 1, Id_DocumentoOrigen: 1, detalles: [] };
      const result = await service.registerMovement(payload);

      expect(result.success).toBe(false);
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });

  describe('getStockByProduct', () => {
    it('should return calculated stock from movements', async () => {
      mockDataSource.query.mockResolvedValue([{ stock: 45 }]);

      const result = await service.getStockByProduct(1);

      expect(result.success).toBe(true);
      expect(result.stock).toBe(45);
    });

    it('should return stock 0 on error', async () => {
      mockDataSource.query.mockRejectedValue(new Error('DB error'));

      const result = await service.getStockByProduct(99);

      expect(result.success).toBe(false);
      expect(result.stock).toBe(0);
    });
  });

  describe('getKardexView', () => {
    it('should return products with calculated stock', async () => {
      const rows = [
        { Id_producto: 1, Nombre_producto: 'A', Costo: 10, PrecioVenta: 13.5, StockActual: 30 },
      ];
      mockDataSource.query.mockResolvedValue(rows);

      const result = await service.getKardexView();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(rows);
    });
  });
});
