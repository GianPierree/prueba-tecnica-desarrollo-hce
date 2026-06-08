/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.enableCors({
    origin: config.get<string>('FRONTEND_URL', 'http://localhost:3000'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.setGlobalPrefix('api');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('HCE - Sistema de Compras y Ventas')
    .setDescription(
      'API REST para gestión de productos, compras, ventas y movimientos (Kardex)',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Ingresa tu JWT token',
        in: 'header',
      },
      'access-token',
    )
    .addTag('Autenticación', 'Registro e inicio de sesión')
    .addTag('Productos', 'CRUD de productos')
    .addTag('Compras', 'Registro y listado de compras')
    .addTag('Ventas', 'Registro y listado de ventas')
    .addTag('Kardex', 'Movimientos de inventario')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(3001);
  console.log(`🚀 API Gateway corriendo en: http://localhost:3001/api`);
  console.log(`📚 Swagger docs en:          http://localhost:3001/api/docs`);
}
bootstrap();
