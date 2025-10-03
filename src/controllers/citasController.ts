import { Request, Response } from "express";
import { CitasService } from "../services/citasService";
import { AppDataSource } from "../data-source";
import { Cita } from "../entities/Cita"; // asegúrate de tener esta entidad creada

const service = new CitasService();

/** Crear cita (usuario autenticado) */
export const crearCitaHandler = async (req: Request, res: Response) => {
  try {
    const usuario = (req as any).user;
    const { medicoId, fecha, horaInicio, horaFin, motivo } = req.body;
    const cita = await service.crearCita({
      medicoId,
      fecha,
      horaInicio,
      horaFin,
      motivo,
      usuarioId: usuario.id,
    });
    return res.status(201).json(cita);
  } catch (err: any) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Error interno" });
  }
};

/** Cancelar cita */
export const cancelarCitaHandler = async (req: Request, res: Response) => {
  try {
    const usuario = (req as any).user;
    const id = req.params.id;
    const isAdmin = usuario.rol === "admin";
    const cita = await service.cancelarCita(id, usuario.id, isAdmin);
    return res.json(cita);
  } catch (err: any) {
    return res
      .status(err.status || 500)
      .json({ message: err.message || "Error interno" });
  }
};

/** Obtener citas propias (usuario) o todas (admin) */
export const listarCitasHandler = async (req: Request, res: Response) => {
  const repo = AppDataSource.getRepository(Cita);
  const usuario = (req as any).user;
  if (usuario.rol === "admin") {
    const all = await repo.find();
    return res.json(all);
  }
  const mine = await repo.find({ where: { usuarioId: usuario.id } });
  return res.json(mine);
};

/** Actualizar estado de una cita (ej. CONFIRMADA) */
export const actualizarEstadoCita = async (req: Request, res: Response) => {
  try {
    const citaId = Number(req.params.id);
    const { estado } = req.body;
    if (!estado)
      return res.status(400).json({ message: "estado es requerido" });

    const repo = AppDataSource.getRepository(Cita);
    const cita = await repo.findOne({ where: { id: citaId } });
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    const usuario = (req as any).user;
    if (!usuario) return res.status(401).json({ message: "No autenticado" });

    const isAdmin = usuario.rol === "admin";
    const isOwner = cita.usuarioId === usuario.id;
    if (!isAdmin && !isOwner) {
      return res
        .status(403)
        .json({ message: "No autorizado para cambiar el estado" });
    }

    const estadosPermitidos = ["PENDIENTE", "CONFIRMADA", "CANCELADA"];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({
        message: `Estado inválido. Permitidos: ${estadosPermitidos.join(", ")}`,
      });
    }

    // regla opcional: no pasar de CANCELADA a CONFIRMADA
    if (cita.estado === "CANCELADA" && estado === "CONFIRMADA") {
      return res
        .status(400)
        .json({ message: "No se puede confirmar una cita ya cancelada" });
    }

    cita.estado = estado;
    await repo.save(cita);

    return res.json(cita);
  } catch (err: any) {
    console.error("Error actualizarEstadoCita:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};
