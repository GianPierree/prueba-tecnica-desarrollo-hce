import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { PurchasesMsModule } from './purchases-ms.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PurchasesMsModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: ['localhost:9092'],
        },
        consumer: {
          groupId: 'purchases-ms-consumer',
        },
      },
    },
  );

  await app.listen();
  console.log('📦 Microservicio de Compras');
}
bootstrap();
