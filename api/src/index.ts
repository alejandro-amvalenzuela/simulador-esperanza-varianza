import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router } from "./routes/index.js";

dotenv.config();

export const app = express();
const port = process.env.PORT || 4000;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

// Configuración de CORS estricto para el frontend (puertos 3000 y 3001)
app.use(
  cors({
    origin: [
      frontendUrl,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rutas principales bajo /api
app.use("/api", router);

// Middleware de manejo de errores en español
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error no controlado:", err);
  res.status(500).json({
    success: false,
    error: "Ha ocurrido un error interno en el servidor",
    detalle: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`✓ API REST del Simulador corriendo en http://localhost:${port}`);
  });
}
