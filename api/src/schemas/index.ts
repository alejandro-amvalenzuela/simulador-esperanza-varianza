import { z } from "zod";

export const ParametrosTeoriaSchema = z.object({
  n: z.coerce.number().int().positive("n debe ser un entero positivo mayor a 0"),
  p: z.coerce.number().min(0, "p debe ser mayor o igual a 0").max(1, "p debe ser menor o igual a 1")
});

export const SimularSchema = z.object({
  n: z.number().int().positive("n debe ser un entero positivo"),
  p: z.number().min(0, "p debe ser mayor o igual a 0").max(1, "p debe ser menor o igual a 1"),
  numCorridas: z.number().int().refine((val) => [10, 100, 1000, 10000].includes(val), {
    message: "numCorridas debe ser 10, 100, 1000 o 10000"
  }),
  semilla: z.number().int().optional().default(42)
});

export const RegistroHistoricoSchema = z.object({
  fecha: z.string().or(z.date()),
  linea: z.string().optional().nullable(),
  intentos: z.number().int().positive("intentos debe ser mayor a 0"),
  exitos: z.number().int().min(0, "éxitos no puede ser negativo"),
  origen: z.enum(["real", "sintetico"]).default("real"),
  nota: z.string().optional().nullable()
});

export const RegistroHistoricoFiltrosSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(200).optional().default(20),
  origen: z.enum(["real", "sintetico", "todos"]).optional().default("todos"),
  orden: z.enum(["asc", "desc"]).optional().default("desc")
});
