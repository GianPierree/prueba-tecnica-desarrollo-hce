import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('PurchasesCab')
export class PurchasesCab {
  @PrimaryGeneratedColumn()
  Id_CompraCab: number;

  @CreateDateColumn()
  FecRegistro: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  SubTotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  Igv: number;

  @Column('decimal', { precision: 10, scale: 2 })
  Total: number;
}
