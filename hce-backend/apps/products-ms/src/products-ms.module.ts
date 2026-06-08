/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule, Products } from '@app/database';
import { ProductsMsController } from './products-ms.controller';
import { ProductsMsService } from './products-ms.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Products]),
  ],
  controllers: [ProductsMsController],
  providers: [ProductsMsService],
})
export class ProductsMsModule {}
