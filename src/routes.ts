import { Router } from "express";
import { register, login } from "./controllers/authController";
import { crearMedico, listarMedicos, actualizarEstado } from "./controllers/medicosController";
import { crearCitaHandler, cancelarCitaHandler, listarCitasHandler, actualizarEstadoCita } from "./controllers/citasController";
import { requireAuth } from "./middleware/auth";
import { requireAdmin } from "./middleware/roles";

const r = Router();

// Auth
r.post("/auth/register", register);
r.post("/auth/login", login);

// Medicos (admin)
r.get("/medicos", requireAuth, listarMedicos);
r.post("/medicos", requireAuth, requireAdmin, crearMedico);
r.patch("/medicos/:id/estado", requireAuth, requireAdmin, actualizarEstado);

// Citas
r.post("/citas", requireAuth, crearCitaHandler); // usuario crea su cita
r.get("/citas", requireAuth, listarCitasHandler);
r.patch("/citas/:id/cancel", requireAuth, cancelarCitaHandler);
r.patch("/citas/:id", requireAuth, actualizarEstadoCita);


export default r;
