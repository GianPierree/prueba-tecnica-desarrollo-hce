import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  Id_usuario: number;

  @Column({ length: 200 })
  NombreCompleto: string;

  @Column({ length: 150, unique: true })
  Correo: string;

  @Column()
  Clave: string;

  @CreateDateColumn()
  Fec_registro: Date;
}
