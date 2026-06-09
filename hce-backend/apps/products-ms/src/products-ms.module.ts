/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule, Products } from '@app/database';
import { ProductsMsController } from './products-ms.controller';
import { ProductsMsService } from './products-ms.service';
import { AUDIT_LOGGER_TOKEN } from 'apps/hce-backend/src/common/interfaces/audit-logger.interface';
import { NestAuditLogger } from 'apps/hce-backend/src/common/logger/nest-audit-logger.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Products]),
  ],
  controllers: [ProductsMsController],
  providers: [
    ProductsMsService,
    { provide: AUDIT_LOGGER_TOKEN, useClass: NestAuditLogger }
  ],
})
export class ProductsMsModule {}
