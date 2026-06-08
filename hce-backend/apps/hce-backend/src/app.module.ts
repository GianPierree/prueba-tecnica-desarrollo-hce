/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { DatabaseModule } from '@app/database';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ClientsModule.register([
      {
        name: 'PURCHASES_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'purchases-gateway', brokers: ['localhost:9092'] },
          consumer: { groupId: 'purchases-gateway-consumer' },
        },
      },
      {
        name: 'SALES_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'sales-gateway', brokers: ['localhost:9092'] },
          consumer: { groupId: 'sales-gateway-consumer' },
        },
      },
      {
        name: 'MOVEMENTS_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'movements-gateway', brokers: ['localhost:9092'] },
          consumer: { groupId: 'movements-gateway-consumer' },
        },
      },
    ]),
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}