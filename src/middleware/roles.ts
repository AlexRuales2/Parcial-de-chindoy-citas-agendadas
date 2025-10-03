import { Request, Response, NextFunction } from "express";

/** Solo admin */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.rol !== "admin") return res.status(403).json({ message: "Se requiere rol admin" });
  next();
};
