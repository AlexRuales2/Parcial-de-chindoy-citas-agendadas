import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Cita } from "./Cita";

/**
 * Medico: id, nombre, especialidad, estado (ACTIVO|INACTIVO)
 */
@Entity()
export class Medico {
  @PrimaryGeneratedColumn()
    id!: number;

  @Column()
    nombre!: string;

  @Column()
    especialidad!: string;

  @Column({ type: "enum", enum: ["ACTIVO", "INACTIVO"], default: "ACTIVO" })
    estado!: "ACTIVO" | "INACTIVO";

  @OneToMany(() => Cita, cita => cita.medico)
    citas!: Cita[];
}
