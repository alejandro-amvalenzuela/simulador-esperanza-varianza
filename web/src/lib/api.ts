const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface RegistroHistorico {
  id: number;
  casoId: number;
  fecha: string;
  linea?: string;
  intentos: number;
  exitos: number;
  origen: "real" | "sintetico";
  nota?: string;
}

export interface ResultadoSimulacion {
  resultado: {
    caso: string;
    n: number;
    p: number;
    numCorridas: number;
    semilla: number;
    esperanzaTeorica: number;
    varianzaTeorica: number;
    desviacionTeorica: number;
    mediaMuestral: number;
    varianzaMuestral: number;
    desviacionMuestral: number;
    errorAbsolutoMedia: number;
    errorRelativoMedia: number;
    minimo: number;
    maximo: number;
    frecuenciasAbsolutas: Record<number, number>;
    frecuenciasRelativas: Record<number, number>;
    mediasAcumuladas: { corrida: number; mediaAcumulada: number; esperanzaTeorica: number }[];
  };
  interpretacion: string;
}

export interface RespuestaTeoria {
  caso: string;
  n: number;
  p: number;
  esperanza: number;
  varianza: number;
  desviacion: number;
  coeficienteVariacion: number;
  tabla: { k: number; probabilidad: number; acumulada: number; formula: string }[];
  transformacionEconomica?: {
    formulaEsperanza: string;
    formulaVarianza: string;
  };
  sumaPropiedad?: {
    formulaEsperanza: string;
    formulaVarianza: string;
  };
}

export interface RespuestaEmpirica {
  caso: string;
  totalMuestras: number;
  sumaIntentos: number;
  sumaExitos: number;
  tasaGlobal: number;
  mediaMuestral: number;
  varianzaMuestral: number;
  desviacionMuestral: number;
  tablaFrecuencias: { x: number; frecuenciaAbsoluta: number; probabilidadEmpirica: number }[];
}

export async function fetchCasos() {
  const res = await fetch(`${API_URL}/casos`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener casos");
  return res.json();
}

export async function fetchCaso(slug: string) {
  const res = await fetch(`${API_URL}/casos/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener el caso");
  return res.json();
}

export async function fetchTeoria(slug: string, n?: number, p?: number) {
  const params = new URLSearchParams();
  if (n !== undefined) params.append("n", n.toString());
  if (p !== undefined) params.append("p", p.toString());
  const res = await fetch(`${API_URL}/casos/${slug}/teoria?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener teoría del caso");
  return res.json();
}

export async function simularExperimento(slug: string, payload: { n: number; p: number; numCorridas: number; semilla: number }) {
  const res = await fetch(`${API_URL}/casos/${slug}/simular`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al ejecutar la simulación");
  }
  return res.json();
}

// Aliases para máxima compatibilidad
export async function simularCaso(payload: { caso: string; n: number; p: number; numCorridas: number; semilla: number }) {
  return simularExperimento(payload.caso, {
    n: payload.n,
    p: payload.p,
    numCorridas: payload.numCorridas,
    semilla: payload.semilla
  });
}

export async function fetchSimulaciones(slug: string) {
  const res = await fetch(`${API_URL}/casos/${slug}/simulaciones`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener historial de simulaciones");
  return res.json();
}

export async function eliminarSimulacion(id: number) {
  const res = await fetch(`${API_URL}/simulaciones/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar simulación");
  return res.json();
}

export async function fetchRegistros(slug: string, params: { page?: number; limit?: number; origen?: string; orden?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append("page", params.page.toString());
  if (params.limit) query.append("limit", params.limit.toString());
  if (params.origen) query.append("origen", params.origen);
  if (params.orden) query.append("orden", params.orden);

  const res = await fetch(`${API_URL}/casos/${slug}/registros?${query.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener registros históricos");
  return res.json();
}

export async function fetchHistoricos(params: { caso: string; page?: number; limit?: number; origen?: string; orden?: string }) {
  return fetchRegistros(params.caso, {
    page: params.page,
    limit: params.limit,
    origen: params.origen,
    orden: params.orden
  });
}

export async function crearRegistro(slug: string, data: any) {
  const res = await fetch(`${API_URL}/casos/${slug}/registros`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al crear registro");
  }
  return res.json();
}

export async function crearHistorico(params: { caso: string; linea?: string; intentos: number; exitos: number; nota?: string; origen?: string }) {
  return crearRegistro(params.caso, params);
}

export async function actualizarRegistro(slug: string, id: number, data: any) {
  const res = await fetch(`${API_URL}/casos/${slug}/registros/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar registro");
  }
  return res.json();
}

export async function actualizarHistorico(id: number, data: any) {
  // En caso que no se pase slug, endpoint generico
  const res = await fetch(`${API_URL}/registros/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al actualizar registro");
  }
  return res.json();
}

export async function eliminarRegistro(slug: string, id: number) {
  const res = await fetch(`${API_URL}/casos/${slug}/registros/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar registro");
  return res.json();
}

export async function eliminarHistorico(id: number) {
  const res = await fetch(`${API_URL}/registros/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar registro");
  return res.json();
}

export async function fetchEmpirica(slug: string) {
  const res = await fetch(`${API_URL}/casos/${slug}/empirica`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener distribución empírica");
  return res.json();
}

export async function importarCSV(slug: string, csvContent: string) {
  const res = await fetch(`${API_URL}/casos/${slug}/registros/importar-csv`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csvContent })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Error al importar CSV");
  }
  return res.json();
}

export async function subirCSVHistorico(slug: string, file: File) {
  const text = await file.text();
  return importarCSV(slug, text);
}

export function obtenerUrlExportarCSV(slug: string) {
  return `${API_URL}/casos/${slug}/registros/exportar-csv`;
}

export async function fetchComparativo() {
  const res = await fetch(`${API_URL}/comparativo`, { cache: "no-store" });
  if (!res.ok) throw new Error("Error al obtener comparativo");
  return res.json();
}
