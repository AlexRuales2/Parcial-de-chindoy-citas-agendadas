import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import dotenv from "dotenv";
dotenv.config();

const userRepo = () => AppDataSource.getRepository(User);

/** Registro de usuario */
export const register = async (req: Request, res: Response) => {
  const { nombre, email, password, rol } = req.body;
  if (!nombre || !email || !password) return res.status(400).json({ message: "nombre, email y password requeridos" });

  const repo = userRepo();
  const existing = await repo.findOneBy({ email });
  if (existing) return res.status(400).json({ message: "Email ya registrado" });

  const hash = await bcrypt.hash(password, 10);
  const user = repo.create({ nombre, email, passwordHash: hash, rol: rol || "usuario" });
  await repo.save(user);
  res.status(201).json({ id: user.id, email: user.email });
};

/** Login -> devuelve JWT */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const repo = userRepo();
  const user = await repo.findOneBy({ email });
  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

  const token = jwt.sign({ userId: user.id, rol: user.rol }, process.env.JWT_SECRET || "secret", { expiresIn: "8h" });
  res.json({ token });
};
