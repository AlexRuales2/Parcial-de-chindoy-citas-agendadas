// src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./entities/User";
import { Medico } from "./entities/Medico";
import { Cita } from "./entities/Cita";

dotenv.config();

/**
 * DataSource para MySQL (TypeORM)
 * - synchronize: true solo en desarrollo
 * - timezone: "Z" se recomienda para trabajar en UTC
 */
export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "citasdb",
  entities: [User, Medico, Cita],
  synchronize: true,
  timezone: "Z",
  charset: "utf8mb4",
});
