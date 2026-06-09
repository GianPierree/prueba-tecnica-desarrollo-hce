/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MovementsMsModule } from './movements-ms.module';

async function bootstrap() {
  const broker = process.env.KAFKA_BROKER ?? 'localhost:9092';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MovementsMsModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: { brokers: [broker] },
        consumer: { groupId: 'movements-ms-consumer' },
      },
    },
  );

  await app.listen();
  console.log(`📊 Microservicio de Movimientos (Kardex) escuchando [${broker}]`);
}
bootstrap();
