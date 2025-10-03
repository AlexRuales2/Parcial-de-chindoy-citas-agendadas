import express from "express";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source"; // <-- ruta correcta
import routes from "./routes";

dotenv.config();
const app = express();
app.use(express.json());

AppDataSource.initialize()
  .then(() => {
    console.log("✅ Conexión a la base de datos establecida correctamente.");
    app.use("/api", routes);
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`🚀 Servidor corriendo en http://localhost:${port}`));
  })
  .catch(err => {
    console.error("❌ Error inicializando DB:", err);
    process.exit(1);
  });
