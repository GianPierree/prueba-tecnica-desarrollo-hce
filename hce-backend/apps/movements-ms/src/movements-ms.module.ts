/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule, MovementsCab, MovementsDet, Products } from '@app/database';
import { MovementsMsController } from './movements-ms.controller';
import { MovementsMsService } from './movements-ms.service';

@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([MovementsCab, MovementsDet, Products]),
  ],
  controllers: [MovementsMsController],
  providers: [MovementsMsService],
})
export class MovementsMsModule {}