/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@app/database';
import { AuthModule } from './auth/auth.module';
import {
  PurchasesController,
  SalesController,
  ProductsController,
  KardexController,
} from './app.controller';
import { BusinessFacade } from './common/facades/business.facade';
import { NestAuditLogger } from './common/logger/nest-audit-logger.service';
import { AUDIT_LOGGER_TOKEN } from './common/interfaces/audit-logger.interface';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    ClientsModule.registerAsync([
      {
        name: 'PURCHASES_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'purchases-gateway',
              brokers: [config.get<string>('KAFKA_BROKER', 'localhost:9092')],
            },
            consumer: { groupId: 'purchases-gateway-consumer' },
          },
        }),
      },
      {
        name: 'SALES_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'sales-gateway',
              brokers: [config.get<string>('KAFKA_BROKER', 'localhost:9092')],
            },
            consumer: { groupId: 'sales-gateway-consumer' },
          },
        }),
      },
      {
        name: 'MOVEMENTS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'movements-gateway',
              brokers: [config.get<string>('KAFKA_BROKER', 'localhost:9092')],
            },
            consumer: { groupId: 'movements-gateway-consumer' },
          },
        }),
      },
      {
        name: 'PRODUCTS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'products-gateway',
              brokers: [config.get<string>('KAFKA_BROKER', 'localhost:9092')],
            },
            consumer: { groupId: 'products-gateway-consumer' },
          },
        }),
      },
    ]),
  ],
  controllers: [
    PurchasesController,
    SalesController,
    ProductsController,
    KardexController,
  ],
  providers: [
    BusinessFacade,
    {
      provide: AUDIT_LOGGER_TOKEN,
      useClass: NestAuditLogger,
    },
  ],
})
export class AppModule {}