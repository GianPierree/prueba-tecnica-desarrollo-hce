import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { Products } from './entities/product.entity';
import { MovementsCab } from './entities/movements-cab.entity';
import { MovementsDet } from './entities/movements-det.entity';
import { PurchasesCab } from './entities/purchases-cab.entity';
import { PurchasesDet } from './entities/purchases-det.entity';
import { SalesCab } from './entities/sales-cab.entity';
import { SalesDet } from './entities/sales-det.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '1433'), 10),
        username: config.get<string>('DB_USERNAME', 'sa'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_DATABASE', 'master'),
        entities: [
          Products,
          MovementsCab,
          MovementsDet,
          PurchasesCab,
          PurchasesDet,
          SalesCab,
          SalesDet,
          User,
        ],
        synchronize: true,
        options: { encrypt: false },
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
