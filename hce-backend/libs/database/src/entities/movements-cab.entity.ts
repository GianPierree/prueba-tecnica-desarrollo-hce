import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('MovementsCab')
export class MovementsCab {
  @PrimaryGeneratedColumn()
  Id_MovimientoCab: number;

  @CreateDateColumn()
  Fec_registro: Date;

  @Column('int')
  Id_TipoMovimiento: number;

  @Column('int')
  Id_DocumentoOrigen: number;
}
