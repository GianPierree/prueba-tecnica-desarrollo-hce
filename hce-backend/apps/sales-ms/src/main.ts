/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SalesMsModule } from './sales-ms.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SalesMsModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: { brokers: ['localhost:9092'] },
        consumer: { groupId: 'sales-ms-consumer' },
      },
    },
  );

  await app.listen();
  console.log('🚀 Microservicio de Ventas escuchando vía Kafka');
}
bootstrap();
