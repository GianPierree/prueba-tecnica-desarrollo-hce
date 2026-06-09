/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule, PurchasesCab, PurchasesDet, Products } from '@app/database';
import { PurchasesMsController } from './purchases-ms.controller';
import { PurchasesMsService } from './purchases-ms.service';
import { NestAuditLogger } from '../../hce-backend/src/common/logger/nest-audit-logger.service';
import { AUDIT_LOGGER_TOKEN } from '../../hce-backend/src/common/interfaces/audit-logger.interface';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([PurchasesCab, PurchasesDet, Products]),
    ClientsModule.registerAsync([
      {
        name: 'MOVEMENTS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'purchases-to-movements',
              brokers: [config.get<string>('KAFKA_BROKER', 'localhost:9092')],
            },
            consumer: { groupId: 'purchases-to-movements-consumer' },
          },
        }),
      },
    ]),
  ],
  controllers: [PurchasesMsController],
  providers: [
    PurchasesMsService,
    { provide: AUDIT_LOGGER_TOKEN, useClass: NestAuditLogger },
  ],
})
export class PurchasesMsModule {}
