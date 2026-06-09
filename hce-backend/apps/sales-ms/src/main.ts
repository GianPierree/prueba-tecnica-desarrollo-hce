/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { SalesMsModule } from './sales-ms.module';

async function bootstrap() {
  const broker = process.env.KAFKA_BROKER ?? 'localhost:9092';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    SalesMsModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: { brokers: [broker] },
        consumer: { groupId: 'sales-ms-consumer' },
      },
    },
  );

  await app.listen();
  console.log(`🚀 Microservicio de Ventas escuchando [${broker}]`);
}
bootstrap();
