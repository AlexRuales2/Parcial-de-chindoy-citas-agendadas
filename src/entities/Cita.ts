import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Medico } from "./Medico";
import { User } from "./User";

/**
 * Cita: id, medicoId(FK), fecha(YYYY-MM-DD), horaInicio(HH:mm), horaFin(HH:mm), motivo, estado, usuarioId(FK)
 * Nota: almacenamos fecha y horas por separado para respetar la especificación, pero en las validaciones unimos para comparar.
 */
@Entity()
export class Cita {
  @PrimaryGeneratedColumn()
    id!: number;

  @ManyToOne(() => Medico, medico => medico.citas, { eager: true })
    @JoinColumn({ name: "medicoId" })
    medico!: Medico;

  @Column()
    medicoId!: string;

  @Column({ type: "date" })
    fecha!: string; // YYYY-MM-DD

  @Column({ type: "time" })
    horaInicio!: string; // HH:mm

  @Column({ type: "time" })
    horaFin!: string; // HH:mm

  @Column("text")
    motivo!: string;

  @Column({ type: "enum", enum: ["PENDIENTE", "CONFIRMADA", "CANCELADA"], default: "PENDIENTE" })
    estado!: "PENDIENTE" | "CONFIRMADA" | "CANCELADA";

  @ManyToOne(() => User, user => user.citas, { eager: true })
    @JoinColumn({ name: "usuarioId" })
    usuario!: User;

  @Column()
    usuarioId!: string;
}
