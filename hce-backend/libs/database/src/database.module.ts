import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: 'Password123!_HCE',
      database: 'master',
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
      options: {
        encrypt: false,
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
