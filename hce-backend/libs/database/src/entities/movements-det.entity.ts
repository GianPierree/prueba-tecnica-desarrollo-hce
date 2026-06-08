import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { MovementsCab } from '..';

@Entity('MovementsDet')
export class MovementsDet {
  @PrimaryGeneratedColumn()
  Id_MovimientoDet: number;

  @Column()
  Id_movimientocab: number;

  @Column()
  Id_Producto: number;

  @Column('int')
  Cantidad: number;

  @ManyToOne(() => MovementsCab)
  @JoinColumn({ name: 'Id_movimientocab' })
  MovimientoCab: MovementsCab;
}
