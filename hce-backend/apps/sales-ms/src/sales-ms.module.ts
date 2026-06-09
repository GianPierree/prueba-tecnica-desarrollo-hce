import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseModule, SalesCab, SalesDet, Products } from '@app/database';
import { SalesMsController } from './sales-ms.controller';
import { SalesMsService } from './sales-ms.service';
import { NestAuditLogger } from '../../hce-backend/src/common/logger/nest-audit-logger.service';
import { AUDIT_LOGGER_TOKEN } from '../../hce-backend/src/common/interfaces/audit-logger.interface';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    TypeOrmModule.forFeature([SalesCab, SalesDet, Products]),
    ClientsModule.registerAsync([
      {
        name: 'MOVEMENTS_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'sales-to-movements',
              brokers: [config.get<string>('KAFKA_BROKER', 'localhost:9092')],
            },
            consumer: { groupId: 'sales-to-movements-consumer' },
          },
        }),
      },
    ]),
  ],
  controllers: [SalesMsController],
  providers: [
    SalesMsService,
    { provide: AUDIT_LOGGER_TOKEN, useClass: NestAuditLogger },
  ],
})
export class SalesMsModule {}
