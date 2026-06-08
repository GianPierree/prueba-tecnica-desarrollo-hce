/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule, SalesCab, SalesDet, Products } from '@app/database';
import { SalesMsController } from './sales-ms.controller';
import { SalesMsService } from './sales-ms.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([SalesCab, SalesDet, Products]),
    ClientsModule.register([
      {
        name: 'MOVEMENTS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'sales-to-movements', brokers: ['localhost:9092'] },
          consumer: { groupId: 'sales-to-movements-consumer' },
        },
      },
    ]),
  ],
  controllers: [SalesMsController],
  providers: [SalesMsService],
})
export class SalesMsModule {}