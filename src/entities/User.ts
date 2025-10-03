import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Cita } from "./Cita";

/**
 * Usuario: id, email (único), passwordHash, rol (admin|usuario)
 */
@Entity()
export class User {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    nombre!: string;

  @Column({ unique: true })
    email!: string;

  @Column()
    passwordHash!: string;

  @Column({ type: "enum", enum: ["admin", "usuario"], default: "usuario" })
    rol!: "admin" | "usuario";

  @OneToMany(() => Cita, (cita: Cita) => cita.usuario)
    citas!: Cita[];
}
