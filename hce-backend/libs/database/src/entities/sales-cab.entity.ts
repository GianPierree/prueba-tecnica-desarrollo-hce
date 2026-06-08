import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('SalesCab')
export class SalesCab {
  @PrimaryGeneratedColumn()
  Id_VentaCab: number;

  @CreateDateColumn()
  fecRegistro: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  SubTotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  Igv: number;

  @Column('decimal', { precision: 10, scale: 2 })
  Total: number;
}
