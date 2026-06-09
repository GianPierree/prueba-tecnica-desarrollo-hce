/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { BusinessFacade } from './business.facade';
import { AUDIT_LOGGER_TOKEN } from '../interfaces/audit-logger.interface';

const mockKafkaClient = {
  send: jest.fn().mockReturnValue(of({ success: true })),
  subscribeToResponseOf: jest.fn(),
  connect: jest.fn().mockResolvedValue(undefined),
};

const mockAuditLogger = { log: jest.fn(), error: jest.fn() };

describe('BusinessFacade', () => {
  let facade: BusinessFacade;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessFacade,
        { provide: 'PURCHASES_SERVICE',  useValue: { ...mockKafkaClient } },
        { provide: 'SALES_SERVICE',      useValue: { ...mockKafkaClient } },
        { provide: 'MOVEMENTS_SERVICE',  useValue: { ...mockKafkaClient } },
        { provide: 'PRODUCTS_SERVICE',   useValue: { ...mockKafkaClient } },
        { provide: AUDIT_LOGGER_TOKEN,   useValue: mockAuditLogger },
      ],
    }).compile();

    facade = module.get<BusinessFacade>(BusinessFacade);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(facade).toBeDefined();
  });

  it('createPurchase should send create_purchase topic', async () => {
    const dto = { detalles: [{ Id_producto: 1, Cantidad: 10, Precio: 5.0 }] };
    const purchasesClient = facade['purchasesClient'];
    jest.spyOn(purchasesClient, 'send').mockReturnValue(of({ success: true }));

    const result = await facade.createPurchase(dto);

    expect(purchasesClient.send).toHaveBeenCalledWith('create_purchase', dto);
    expect(result).toEqual({ success: true });
  });

  it('createSale should send create_sale topic', async () => {
    const dto = { detalles: [{ Id_producto: 1, Cantidad: 2, Precio: 13.5 }] };
    const salesClient = facade['salesClient'];
    jest.spyOn(salesClient, 'send').mockReturnValue(of({ success: true }));

    const result = await facade.createSale(dto);

    expect(salesClient.send).toHaveBeenCalledWith('create_sale', dto);
    expect(result).toEqual({ success: true });
  });

  it('listProducts should send list_products topic', async () => {
    const productsClient = facade['productsClient'];
    jest.spyOn(productsClient, 'send').mockReturnValue(
      of({ success: true, data: [] }),
    );

    const result = await facade.listProducts();

    expect(productsClient.send).toHaveBeenCalledWith('list_products', {});
    expect(result).toEqual({ success: true, data: [] });
  });

  it('getKardex should send get_kardex topic', async () => {
    const movementsClient = facade['movementsClient'];
    jest.spyOn(movementsClient, 'send').mockReturnValue(
      of({ success: true, data: [] }),
    );

    await facade.getKardex();

    expect(movementsClient.send).toHaveBeenCalledWith('get_kardex', {});
  });

  it('getProductMovements should send get_product_movements with productId', async () => {
    const movementsClient = facade['movementsClient'];
    jest.spyOn(movementsClient, 'send').mockReturnValue(
      of({ success: true, data: [] }),
    );

    await facade.getProductMovements(5);

    expect(movementsClient.send).toHaveBeenCalledWith(
      'get_product_movements',
      { productId: 5 },
    );
  });
});
