/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { BusinessFacade } from '../src/common/facades/business.facade';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';

const mockFacade = {
  createPurchase: jest.fn().mockResolvedValue({ success: true, Id_CompraCab: 1 }),
  listPurchases:  jest.fn().mockResolvedValue({ success: true, data: [] }),
  createSale:     jest.fn().mockResolvedValue({ success: true, Id_VentaCab: 1 }),
  listSales:      jest.fn().mockResolvedValue({ success: true, data: [] }),
  createProduct:  jest.fn().mockResolvedValue({ success: true, data: { Id_producto: 1 } }),
  updateProduct:  jest.fn().mockResolvedValue({ success: true, data: {} }),
  listProducts:   jest.fn().mockResolvedValue({ success: true, data: [] }),
  getKardex:      jest.fn().mockResolvedValue({ success: true, data: [] }),
  getProductMovements: jest.fn().mockResolvedValue({ success: true, data: [] }),
};

const mockAuthService = {
  login:    jest.fn().mockResolvedValue({ access_token: 'test-token', expires_in: '30m' }),
  register: jest.fn().mockResolvedValue({ message: 'Usuario creado exitosamente' }),
};

const mockJwtService = {
  verifyAsync: jest.fn().mockResolvedValue({ sub: 1, email: 'test@test.com' }),
};

describe('HCE API Gateway (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BusinessFacade).useValue(mockFacade)
      .overrideProvider(AuthService).useValue(mockAuthService)
      .overrideProvider(JwtService).useValue(mockJwtService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('should return access_token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'test@test.com', password: '123456' })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('expires_in', '30m');
    });
  });

  describe('GET /api/products (protected)', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/products')
        .expect(401);
    });

    it('should return products list with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual({ success: true, data: [] });
    });
  });

  describe('POST /api/purchases (protected)', () => {
    it('should register a purchase', async () => {
      const dto = {
        detalles: [{ Id_producto: 1, Cantidad: 10, Precio: 5.0 }],
      };

      const response = await request(app.getHttpServer())
        .post('/api/purchases')
        .set('Authorization', 'Bearer test-token')
        .send(dto)
        .expect(201);

      expect(response.body).toEqual({ success: true, Id_CompraCab: 1 });
    });

    it('should return 400 on invalid body', async () => {
      await request(app.getHttpServer())
        .post('/api/purchases')
        .set('Authorization', 'Bearer test-token')
        .send({ detalles: [] })
        .expect(400);
    });
  });

  describe('GET /api/kardex (protected)', () => {
    it('should return kardex data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/kardex')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual({ success: true, data: [] });
    });
  });

  describe('GET /api/kardex/movements/:id (protected)', () => {
    it('should return movements for product', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/kardex/movements/1')
        .set('Authorization', 'Bearer test-token')
        .expect(200);

      expect(response.body).toEqual({ success: true, data: [] });
    });
  });
});
