import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Medico } from "../entities/Medico";

const repo = () => AppDataSource.getRepository(Medico);

/** Crear medico (admin) */
export const crearMedico = async (req: Request, res: Response) => {
  const { nombre, especialidad } = req.body;
  const m = repo().create({ nombre, especialidad });
  await repo().save(m);
  res.status(201).json(m);
};

/** Activar / Inactivar medico */
export const actualizarEstado = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { estado } = req.body; // 'ACTIVO' | 'INACTIVO'
  const medico = await repo().findOneBy({ id });
  if (!medico) return res.status(404).json({ message: "Médico no encontrado" });
  medico.estado = estado;
  await repo().save(medico);
  res.json(medico);
};

export const listarMedicos = async (req: Request, res: Response) => {
  const list = await repo().find();
  res.json(list);
};
