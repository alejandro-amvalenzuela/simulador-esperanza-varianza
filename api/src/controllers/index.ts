import { Request, Response } from "express";
import { PrismaClient, OrigenDato } from "@prisma/client";
import {
  calcularEsperanzaTeorica,
  calcularVarianzaTeorica,
  calcularDesviacionTeorica,
  tablaDistribucionBinomial
} from "../stats/binomial.js";
import { ejecutarSimulacion } from "../stats/simulation.js";
import {
  calcularTransformacionLineal,
  calcularSumaFabrica,
  calcularSumaSemanaRestaurante
} from "../stats/properties.js";
import { calcularDistribucionEmpirica } from "../stats/empirical.js";
import {
  ParametrosTeoriaSchema,
  SimularSchema,
  RegistroHistoricoSchema,
  RegistroHistoricoFiltrosSchema
} from "../schemas/index.js";
import { parse } from "csv-parse/sync";

const prisma = new PrismaClient();

// GET /api/casos
export async function listarCasos(req: Request, res: Response) {
  try {
    const casos = await prisma.caso.findMany({
      orderBy: { id: "asc" }
    });
    return res.json({ success: true, data: casos });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al obtener casos" });
  }
}

// GET /api/casos/:slug
export async function obtenerCaso(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const caso = await prisma.caso.findUnique({
      where: { slug }
    });

    if (!caso) {
      return res.status(404).json({ success: false, error: "Caso no encontrado" });
    }

    return res.json({ success: true, data: caso });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al obtener caso" });
  }
}

// GET /api/casos/:slug/teoria?n=&p=
export async function obtenerTeoria(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const caso = await prisma.caso.findUnique({ where: { slug } });
    if (!caso) {
      return res.status(404).json({ success: false, error: "Caso no encontrado" });
    }

    const n = req.query.n ? Number(req.query.n) : caso.n;
    const p = req.query.p ? Number(req.query.p) : caso.p;

    const validacion = ParametrosTeoriaSchema.safeParse({ n, p });
    if (!validacion.success) {
      return res.status(400).json({ success: false, error: validacion.error.errors[0].message });
    }

    const esperanza = calcularEsperanzaTeorica(n, p);
    const varianza = calcularVarianzaTeorica(n, p);
    const desviacion = calcularDesviacionTeorica(n, p);
    const tabla = tablaDistribucionBinomial(n, p);

    // Cálculos económicos específicos
    let transformacionEconomica = null;
    let sumaPropiedad = null;

    if (slug === "fabrica") {
      const varVal = Number(varianza.toFixed(4));
      const espVal = Number(esperanza.toFixed(3));
      const espTotal = 3500 * espVal + 12000;
      const varTotal = 3500 * 3500 * varVal;
      transformacionEconomica = {
        nombre: "Costo total de inspección y reproceso: C = 3500*X + 12000",
        a: 3500,
        b: 12000,
        esperanza: espTotal,
        varianza: varTotal,
        desviacion: 3500 * desviacion,
        formulaEsperanza: `E(C) = 3500 · E(X) + 12000 = 3500 · ${espVal} + 12000 = $${espTotal.toLocaleString("es-CL")}`,
        formulaVarianza: `Var(C) = (3500)² · Var(X) = 12.250.000 · ${varVal} = ${varTotal.toLocaleString("es-CL")}`
      };
      sumaPropiedad = calcularSumaFabrica(n, p, 20, 0.08);
    } else if (slug === "ventas") {
      const espVal = Number(esperanza.toFixed(3));
      const varVal = Number(varianza.toFixed(4));
      const gBruta = 2000 * espVal;
      const gNeta = gBruta - 5000;
      const varTotal = 4000000 * varVal;
      transformacionEconomica = {
        nombre: "Ganancia bruta: Y = 2000*X y Ganancia neta: N = 2000*X - 5000",
        gananciaBruta: {
          esperanza: gBruta,
          varianza: varTotal,
          formulaEsperanza: `E(Y) = 2000 · E(X) = 2000 · ${espVal} = $${gBruta.toLocaleString("es-CL")}`
        },
        gananciaNeta: {
          esperanza: gNeta,
          varianza: varTotal,
          formulaEsperanza: `E(N) = 2000 · E(X) - 5000 = $${gBruta.toLocaleString("es-CL")} - 5000 = $${gNeta.toLocaleString("es-CL")}`
        }
      };
    } else if (slug === "restaurante") {
      const espVal = Number(esperanza.toFixed(3));
      const varVal = Number(varianza.toFixed(4));
      const espTotal = 4500 * espVal;
      const varTotal = 4500 * 4500 * varVal;
      transformacionEconomica = {
        nombre: "Pérdida económica por no retiro: L = 4500*X",
        a: 4500,
        b: 0,
        esperanza: espTotal,
        varianza: varTotal,
        desviacion: 4500 * desviacion,
        formulaEsperanza: `E(L) = 4500 · E(X) = 4500 · ${espVal} = $${espTotal.toLocaleString("es-CL")}`,
        formulaVarianza: `Var(L) = (4500)² · Var(X) = 20.250.000 · ${varVal} = ${varTotal.toLocaleString("es-CL")}`
      };
      sumaPropiedad = calcularSumaSemanaRestaurante(n, p, 7);
    }

    return res.json({
      success: true,
      data: {
        n,
        p,
        esperanza,
        varianza,
        desviacion,
        tabla,
        transformacionEconomica,
        sumaPropiedad,
        coeficienteVariacion: (desviacion / esperanza) * 100
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al calcular teoría" });
  }
}

// POST /api/casos/:slug/simular
export async function simular(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const caso = await prisma.caso.findUnique({ where: { slug } });
    if (!caso) {
      return res.status(404).json({ success: false, error: "Caso no encontrado" });
    }

    const validacion = SimularSchema.safeParse(req.body);
    if (!validacion.success) {
      return res.status(400).json({ success: false, error: validacion.error.errors[0].message });
    }

    const { n, p, numCorridas, semilla } = validacion.data;

    const resultado = ejecutarSimulacion(n, p, numCorridas, semilla);

    // Guardar en la base de datos
    const simulacionGuardada = await prisma.simulacion.create({
      data: {
        casoId: caso.id,
        n,
        p,
        numCorridas,
        semilla,
        media: resultado.mediaMuestral,
        varianzaMuestral: resultado.varianzaMuestral,
        desviacion: resultado.desviacionMuestral,
        esperanzaTeorica: resultado.esperanzaTeorica,
        varianzaTeorica: resultado.varianzaTeorica,
        errorAbsMedia: resultado.errorAbsolutoMedia,
        errorRelMedia: resultado.errorRelativoMedia,
        muestras: resultado.muestras.slice(0, 1000) // Guardamos hasta 1000 muestras para historial liviano
      }
    });

    // Cálculos de transformaciones simuladas
    let transformacionSimulada = null;
    let sumaSimulada = null;

    if (slug === "fabrica") {
      transformacionSimulada = calcularTransformacionLineal(
        3500,
        12000,
        resultado.esperanzaTeorica,
        resultado.varianzaTeorica,
        resultado.muestras
      );
      // Para simular suma de dos líneas, generamos línea B con semilla + 1
      const simB = ejecutarSimulacion(20, 0.08, numCorridas, semilla + 1);
      sumaSimulada = calcularSumaFabrica(n, p, 20, 0.08, resultado.muestras, simB.muestras);
    } else if (slug === "ventas") {
      transformacionSimulada = {
        bruta: calcularTransformacionLineal(2000, 0, resultado.esperanzaTeorica, resultado.varianzaTeorica, resultado.muestras),
        neta: calcularTransformacionLineal(2000, -5000, resultado.esperanzaTeorica, resultado.varianzaTeorica, resultado.muestras)
      };
    } else if (slug === "restaurante") {
      transformacionSimulada = calcularTransformacionLineal(
        4500,
        0,
        resultado.esperanzaTeorica,
        resultado.varianzaTeorica,
        resultado.muestras
      );
      sumaSimulada = calcularSumaSemanaRestaurante(n, p, 7);
    }

    // Interpretación automática
    const interpretacion = `En una muestra de ${numCorridas.toLocaleString("es-CL")} corridas del proceso (n = ${n}, p = ${p}), la media observada fue de ${resultado.mediaMuestral.toFixed(2)} unidades con una desviación muestral de ${resultado.desviacionMuestral.toFixed(2)}. Esto significa que en promedio esperamos alrededor de ${resultado.esperanzaTeorica.toFixed(2)} ocurrencias, situándose el comportamiento habitual típico en el intervalo [${Math.max(0, resultado.esperanzaTeorica - resultado.desviacionTeorica).toFixed(1)} - ${(resultado.esperanzaTeorica + resultado.desviacionTeorica).toFixed(1)}]. El error relativo frente al modelo teórico fue de ${resultado.errorRelativoMedia.toFixed(2)}%, confirmando la convergencia empírica.`;

    return res.json({
      success: true,
      data: {
        id: simulacionGuardada.id,
        resultado,
        transformacionSimulada,
        sumaSimulada,
        interpretacion
      }
    });
  } catch (error: any) {
    console.error("Error al simular:", error);
    return res.status(500).json({ success: false, error: "Error en la simulación" });
  }
}

// GET /api/casos/:slug/simulaciones
export async function listarSimulaciones(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const caso = await prisma.caso.findUnique({ where: { slug } });
    if (!caso) return res.status(404).json({ success: false, error: "Caso no encontrado" });

    const simulaciones = await prisma.simulacion.findMany({
      where: { casoId: caso.id },
      orderBy: { creadaEn: "desc" },
      take: 20
    });

    return res.json({ success: true, data: simulaciones });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al listar simulaciones" });
  }
}

// DELETE /api/simulaciones/:id
export async function eliminarSimulacion(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await prisma.simulacion.delete({ where: { id } });
    return res.json({ success: true, message: "Simulación eliminada correctamente" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al eliminar simulación" });
  }
}

// GET /api/casos/:slug/registros
export async function listarRegistrosHistoricos(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const caso = await prisma.caso.findUnique({ where: { slug } });
    if (!caso) return res.status(404).json({ success: false, error: "Caso no encontrado" });

    const filtros = RegistroHistoricoFiltrosSchema.parse(req.query);
    const where: any = { casoId: caso.id };
    if (filtros.origen !== "todos") {
      where.origen = filtros.origen;
    }

    const total = await prisma.registroHistorico.count({ where });
    const registros = await prisma.registroHistorico.findMany({
      where,
      orderBy: { fecha: filtros.orden },
      skip: (filtros.page - 1) * filtros.limit,
      take: filtros.limit
    });

    return res.json({
      success: true,
      data: {
        registros,
        total,
        page: filtros.page,
        totalPages: Math.ceil(total / filtros.limit)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al listar registros históricos" });
  }
}

// POST /api/casos/:slug/registros
export async function crearRegistroHistorico(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const caso = await prisma.caso.findUnique({ where: { slug } });
    if (!caso) return res.status(404).json({ success: false, error: "Caso no encontrado" });

    const validacion = RegistroHistoricoSchema.safeParse(req.body);
    if (!validacion.success) {
      return res.status(400).json({ success: false, error: validacion.error.errors[0].message });
    }

    const reg = await prisma.registroHistorico.create({
      data: {
        casoId: caso.id,
        fecha: new Date(validacion.data.fecha),
        linea: validacion.data.linea,
        intentos: validacion.data.intentos,
        exitos: validacion.data.exitos,
        origen: validacion.data.origen as OrigenDato,
        nota: validacion.data.nota
      }
    });

    return res.status(201).json({ success: true, data: reg });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al crear registro" });
  }
}

// PUT /api/casos/:slug/registros/:id
export async function actualizarRegistroHistorico(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const validacion = RegistroHistoricoSchema.partial().safeParse(req.body);
    if (!validacion.success) {
      return res.status(400).json({ success: false, error: validacion.error.errors[0].message });
    }

    const data: any = { ...validacion.data };
    if (data.fecha) data.fecha = new Date(data.fecha);

    const actualizado = await prisma.registroHistorico.update({
      where: { id },
      data
    });

    return res.json({ success: true, data: actualizado });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al actualizar registro" });
  }
}

// DELETE /api/casos/:slug/registros/:id
export async function eliminarRegistroHistorico(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    await prisma.registroHistorico.delete({ where: { id } });
    return res.json({ success: true, message: "Registro eliminado" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al eliminar registro" });
  }
}

// GET /api/casos/:slug/empirica
export async function obtenerEmpirica(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const caso = await prisma.caso.findUnique({ where: { slug } });
    if (!caso) return res.status(404).json({ success: false, error: "Caso no encontrado" });

    const registros = await prisma.registroHistorico.findMany({
      where: { casoId: caso.id },
      select: { exitos: true, intentos: true }
    });

    const resultado = calcularDistribucionEmpirica(registros);

    return res.json({
      success: true,
      data: {
        ...resultado,
        pSupuesto: caso.p,
        diferenciaP: Math.abs(resultado.pEstimada - caso.p)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al calcular análisis empírico" });
  }
}

// POST /api/casos/:slug/registros/importar-csv
export async function importarCSV(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const caso = await prisma.caso.findUnique({ where: { slug } });
    if (!caso) return res.status(404).json({ success: false, error: "Caso no encontrado" });

    const { csvContent } = req.body;
    if (!csvContent || typeof csvContent !== "string") {
      return res.status(400).json({ success: false, error: "Contenido CSV inválido" });
    }

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    const nuevosRegistros = [];
    for (const row of records) {
      nuevosRegistros.push({
        casoId: caso.id,
        fecha: row.fecha ? new Date(row.fecha) : new Date(),
        linea: row.linea || "Importado",
        intentos: Number(row.intentos) || caso.n,
        exitos: Number(row.exitos) || 0,
        origen: (row.origen === "sintetico" ? OrigenDato.sintetico : OrigenDato.real) as OrigenDato,
        nota: row.nota || "Importado vía CSV"
      });
    }

    if (nuevosRegistros.length > 0) {
      await prisma.registroHistorico.createMany({ data: nuevosRegistros });
    }

    return res.json({
      success: true,
      importados: nuevosRegistros.length,
      message: `${nuevosRegistros.length} registros importados exitosamente`
    });
  } catch (error: any) {
    console.error("Error al importar CSV:", error);
    return res.status(500).json({ success: false, error: "Error al procesar archivo CSV" });
  }
}

// GET /api/casos/:slug/registros/exportar-csv
export async function exportarCSV(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const caso = await prisma.caso.findUnique({ where: { slug } });
    if (!caso) return res.status(404).json({ success: false, error: "Caso no encontrado" });

    const registros = await prisma.registroHistorico.findMany({
      where: { casoId: caso.id },
      orderBy: { fecha: "asc" }
    });

    let csv = "id,fecha,linea,intentos,exitos,origen,nota\n";
    for (const r of registros) {
      const fecha = r.fecha.toISOString().split("T")[0];
      const nota = (r.nota || "").replace(/"/g, '""');
      csv += `${r.id},${fecha},"${r.linea || ""}",${r.intentos},${r.exitos},${r.origen},"${nota}"\n`;
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="registros_${slug}.csv"`);
    return res.send(csv);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al exportar CSV" });
  }
}

// GET /api/comparativo
export async function obtenerComparativo(req: Request, res: Response) {
  try {
    const casos = await prisma.caso.findMany({ orderBy: { id: "asc" } });

    const datosComparativos = casos.map((caso) => {
      const eX = calcularEsperanzaTeorica(caso.n, caso.p);
      const varX = calcularVarianzaTeorica(caso.n, caso.p);
      const devX = calcularDesviacionTeorica(caso.n, caso.p);
      const cv = (devX / eX) * 100;

      return {
        id: caso.id,
        slug: caso.slug,
        nombre: caso.nombre,
        n: caso.n,
        p: caso.p,
        esperanza: eX,
        varianza: varX,
        desviacion: devX,
        coeficienteVariacion: cv,
        valorUnitario: caso.valorUnitario,
        costoFijo: caso.costoFijo
      };
    });

    return res.json({ success: true, data: datosComparativos });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Error al obtener comparativo" });
  }
}
