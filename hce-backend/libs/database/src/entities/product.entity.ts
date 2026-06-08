import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('Products')
export class Products {
  @PrimaryGeneratedColumn()
  Id_producto: number;

  @Column({ length: 150 })
  Nombre_producto: string;

  @Column({ length: 50 })
  NroLote: string;

  @CreateDateColumn()
  Fec_registro: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  Costo: number;

  @Column('decimal', { precision: 10, scale: 2 })
  PrecioVenta: number;

  @Column('int', { default: 0 })
  StockActual: number;
}
