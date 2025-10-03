import { AppDataSource } from "../data-source";
import { Cita } from "../entities/Cita";
import { Medico } from "../entities/Medico";

/** Convierte "HH:mm" a minutos desde medianoche */
const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export class CitasService {
  private citaRepo = () => AppDataSource.getRepository(Cita);
  private medicoRepo = () => AppDataSource.getRepository(Medico);

  /** Crea una cita con todas las validaciones de negocio */
  async crearCita({ medicoId, fecha, horaInicio, horaFin, motivo, usuarioId }: {
    medicoId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string,
    motivo: string,
    usuarioId: string
  }) {
    // validaciones básicas
    if (!medicoId || !fecha || !horaInicio || !horaFin || !motivo) {
      throw { status: 400, message: "Campos requeridos faltantes" };
    }

    // comprobar minutos
    const startMin = timeToMinutes(horaInicio);
    const endMin = timeToMinutes(horaFin);
    if (!(endMin > startMin)) throw { status: 400, message: "horaFin debe ser mayor que horaInicio" };
    if ((endMin - startMin) < 30) throw { status: 400, message: "La duración mínima es 30 minutos" };

    // medico existe y ACTIVO
    const medico = await this.medicoRepo().findOneBy({ id: Number(medicoId) });
    if (!medico) throw { status: 404, message: "Médico no encontrado" };
    if (medico.estado !== "ACTIVO") throw { status: 400, message: "Solo se permiten citas con médicos ACTIVO" };

    // evitar solapamiento: buscar citas del mismo medico y misma fecha que no estén CANCELADAS
    const existing = await this.citaRepo().find({
      where: { medicoId, fecha, estado: "PENDIENTE" } // consideramos pendientes; si CONFIRMADA también debe bloquear
    });

    // comprobar solapamiento con todas las que no esten CANCELADA (usa start/end en minutos)
    const existingAll = await this.citaRepo().createQueryBuilder("cita")
      .where("cita.medicoId = :medicoId", { medicoId })
      .andWhere("cita.fecha = :fecha", { fecha })
      .andWhere("cita.estado != :cancelado", { cancelado: "CANCELADA" })
      .getMany();

    for (const e of existingAll) {
      const eStart = timeToMinutes(e.horaInicio);
      const eEnd = timeToMinutes(e.horaFin);
      // overlap if newStart < eEnd && newEnd > eStart
      if (startMin < eEnd && endMin > eStart) {
        throw { status: 409, message: "Solapamiento con otra cita del médico en ese horario" };
      }
    }

    // crear y guardar
    const cita = this.citaRepo().create({
      medicoId,
      fecha,
      horaInicio,
      horaFin,
      motivo,
      usuarioId,
      estado: "PENDIENTE"
    });
    await this.citaRepo().save(cita);
    return cita;
  }

  /** Cancelar cita: aplicar política de cancelación (hasta 1h antes) */
  async cancelarCita(citaId: string, usuarioId: string, isAdmin = false) {
    const repo = this.citaRepo();
    const cita = await repo.findOneBy({ id: Number(citaId) });
    if (!cita) throw { status: 404, message: "Cita no encontrada" };

    // ownership: solo admin o dueño puede cancelar
    if (!isAdmin && cita.usuarioId !== usuarioId) throw { status: 403, message: "No autorizado" };

    if (cita.estado === "CANCELADA") throw { status: 400, message: "Cita ya cancelada" };

    // calcular minutos para la fecha/hora de inicio de la cita y la diferencia con 'ahora'
    const [yyyy, mm, dd] = cita.fecha.split("-").map(Number);
    const [h, min] = cita.horaInicio.split(":").map(Number);
    const citaStart = new Date(yyyy, mm - 1, dd, h, min); // local time
    const now = new Date();

    const diffMs = citaStart.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      // menos de 1 hora para inicio -> no se permite cancelar según política
      throw { status: 409, message: "No se puede cancelar menos de 1 hora antes del inicio" };
    }

    cita.estado = "CANCELADA";
    await repo.save(cita);
    return cita;
  }
}
