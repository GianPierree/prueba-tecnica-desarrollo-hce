import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('PurchasesDet')
export class PurchasesDet {
  @PrimaryGeneratedColumn()
  Id_CompraDet: number;

  @Column()
  Id_CompraCab: number;

  @Column()
  Id_producto: number;

  @Column('int')
  Cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  Precio: number;

  @Column('decimal', { precision: 10, scale: 2 })
  Sub_Total: number;

  @Column('decimal', { precision: 10, scale: 2 })
  Igv: number;

  @Column('decimal', { precision: 10, scale: 2 })
  Total: number;
}
