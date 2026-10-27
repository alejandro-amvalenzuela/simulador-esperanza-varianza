import { Router } from "express";
import {
  listarCasos,
  obtenerCaso,
  obtenerTeoria,
  simular,
  listarSimulaciones,
  eliminarSimulacion,
  listarRegistrosHistoricos,
  crearRegistroHistorico,
  actualizarRegistroHistorico,
  eliminarRegistroHistorico,
  obtenerEmpirica,
  importarCSV,
  exportarCSV,
  obtenerComparativo
} from "../controllers/index.js";

export const router = Router();

// Casos
router.get("/casos", listarCasos);
router.get("/casos/:slug", obtenerCaso);
router.get("/casos/:slug/teoria", obtenerTeoria);

// Simulación
router.post("/casos/:slug/simular", simular);
router.get("/casos/:slug/simulaciones", listarSimulaciones);
router.delete("/simulaciones/:id", eliminarSimulacion);

// Registros Históricos y CSV
router.get("/casos/:slug/registros", listarRegistrosHistoricos);
router.post("/casos/:slug/registros", crearRegistroHistorico);
router.put("/casos/:slug/registros/:id", actualizarRegistroHistorico);
router.delete("/casos/:slug/registros/:id", eliminarRegistroHistorico);
router.post("/casos/:slug/registros/importar-csv", importarCSV);
router.get("/casos/:slug/registros/exportar-csv", exportarCSV);

// Distribución empírica
router.get("/casos/:slug/empirica", obtenerEmpirica);

// Comparativo global
router.get("/comparativo", obtenerComparativo);
