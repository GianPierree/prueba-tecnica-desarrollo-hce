/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule, PurchasesCab, PurchasesDet, Products } from '@app/database';
import { PurchasesMsController } from './purchases-ms.controller';
import { PurchasesMsService } from './purchases-ms.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([PurchasesCab, PurchasesDet, Products]),
    ClientsModule.register([
      {
        name: 'MOVEMENTS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'purchases-to-movements', brokers: ['localhost:9092'] },
          consumer: { groupId: 'purchases-to-movements-consumer' },
        },
      },
    ]),
  ],
  controllers: [PurchasesMsController],
  providers: [PurchasesMsService],
})
export class PurchasesMsModule {}