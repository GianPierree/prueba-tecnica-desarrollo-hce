/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PurchasesMsModule } from './purchases-ms.module';

async function bootstrap() {
  const broker = process.env.KAFKA_BROKER ?? 'localhost:9092';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PurchasesMsModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: { brokers: [broker] },
        consumer: { groupId: 'purchases-ms-consumer' },
      },
    },
  );

  await app.listen();
  console.log(`📦 Microservicio de Compras escuchando [${broker}]`);
}
bootstrap();
