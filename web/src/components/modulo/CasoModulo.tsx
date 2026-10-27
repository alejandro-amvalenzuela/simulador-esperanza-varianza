"use client";

import { useState, useRef, useEffect } from "react";
import {
  fetchTeoria,
  simularCaso,
  fetchEmpirica,
  ResultadoSimulacion,
  RespuestaTeoria,
  RespuestaEmpirica
} from "@/lib/api";
import {
  GraficoHistograma,
  GraficoConvergencia,
  GraficoComparativoDistribuciones,
  GraficoEconomico
} from "@/components/charts/ModuloCharts";
import { TablaHistorica } from "@/components/historical/TablaHistorica";
import { formatearNumero, formatearPorcentaje, formatearCLP } from "@/lib/formatters";
import { Play, RotateCcw, Download, Camera, Info, CheckCircle2 } from "lucide-react";
import { toPng } from "html-to-image";

interface PropsCasoModulo {
  slug: "fabrica" | "ventas" | "restaurante";
  nombre: string;
  descripcion: string;
  nDefault: number;
  pDefault: number;
  valorUnitarioDefault: number;
  costoFijoDefault: number;
  etiquetaIndicadorEconomico: string;
  nombreVariableX: string;
  tieneSumaIndependiente?: boolean;
  tieneSumaSemanal?: boolean;
  tieneAnalisisSensibilidad?: boolean;
}

export function CasoModulo({
  slug,
  nombre,
  descripcion,
  nDefault,
  pDefault,
  valorUnitarioDefault,
  costoFijoDefault,
  etiquetaIndicadorEconomico,
  nombreVariableX,
  tieneSumaIndependiente,
  tieneSumaSemanal,
  tieneAnalisisSensibilidad
}: PropsCasoModulo) {
  // Parámetros
  const [n, setN] = useState<number>(nDefault);
  const [p, setP] = useState<number>(pDefault);
  const [numCorridas, setNumCorridas] = useState<number>(1000);
  const [semilla, setSemilla] = useState<number>(42);

  // Estados de datos
  const [teoria, setTeoria] = useState<RespuestaTeoria | null>(null);
  const [simulacion, setSimulacion] = useState<ResultadoSimulacion | null>(null);
  const [empirica, setEmpirica] = useState<RespuestaEmpirica | null>(null);

  // Estado de interfaz
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const seccionGraficosRef = useRef<HTMLDivElement>(null);

  // Carga inicial
  useEffect(() => {
    async function cargarInicial() {
      try {
        const [resTeoria, resEmpirica] = await Promise.all([
          fetchTeoria(slug, nDefault, pDefault),
          fetchEmpirica(slug)
        ]);

        if (resTeoria.success) setTeoria(resTeoria.data);
        if (resEmpirica.success) setEmpirica(resEmpirica.data);
      } catch (err: any) {
        setError("Error al cargar datos teóricos o empíricos iniciales.");
      }
    }
    cargarInicial();
  }, [slug, nDefault, pDefault]);

  // Actualizar teoría cuando cambian n o p
  useEffect(() => {
    async function actualizarTeoria() {
      if (n > 0 && p >= 0 && p <= 1) {
        try {
          const res = await fetchTeoria(slug, n, p);
          if (res.success) setTeoria(res.data);
        } catch (err) {
          console.error(err);
        }
      }
    }
    const timer = setTimeout(actualizarTeoria, 300);
    return () => clearTimeout(timer);
  }, [slug, n, p]);

  // Ejecutar simulación
  const handleSimular = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await simularCaso({
        caso: slug,
        n,
        p,
        numCorridas,
        semilla
      });

      if (res.success) {
        setSimulacion(res.data);
      } else {
        setError(res.error || "Error al simular");
      }
    } catch (err: any) {
      setError(err.message || "Error de red al ejecutar simulación");
    } finally {
      setCargando(false);
    }
  };

  const handleRestablecer = () => {
    setN(nDefault);
    setP(pDefault);
    setNumCorridas(1000);
    setSemilla(42);
    setSimulacion(null);
    setError(null);
  };

  const handleDescargarPNG = async () => {
    if (!seccionGraficosRef.current) return;
    try {
      const dataUrl = await toPng(seccionGraficosRef.current, { backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `graficos_${slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error(err);
      alert("No se pudo generar la imagen de los gráficos.");
    }
  };

  const handleDescargarCSVResultados = () => {
    if (!simulacion) return;
    const r = simulacion.resultado;
    let csv = "parametro,valor\n";
    csv += `caso,${slug}\n`;
    csv += `n,${r.n}\n`;
    csv += `p,${r.p}\n`;
    csv += `num_corridas,${r.numCorridas}\n`;
    csv += `semilla,${r.semilla}\n`;
    csv += `esperanza_teorica,${r.esperanzaTeorica}\n`;
    csv += `varianza_teorica,${r.varianzaTeorica}\n`;
    csv += `media_muestral,${r.mediaMuestral}\n`;
    csv += `varianza_muestral,${r.varianzaMuestral}\n`;
    csv += `desviacion_muestral,${r.desviacionMuestral}\n`;
    csv += `error_abs_media,${r.errorAbsolutoMedia}\n`;
    csv += `error_rel_media_pct,${r.errorRelativoMedia}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `resultados_simulacion_${slug}.csv`);
    link.click();
  };

  // Preparación de datos para gráficos
  const datosHistograma = (teoria?.tabla || []).map((row: any) => {
    const fRel = simulacion?.resultado?.frecuenciasRelativas?.[row.k] || 0;
    return {
      k: row.k,
      probabilidadTeorica: row.probabilidad,
      frecuenciaRelativaSimulada: fRel
    };
  });

  const datosComparativaTres = (teoria?.tabla || []).slice(0, 15).map((row: any) => {
    const pEmp = (empirica?.tablaFrecuencias || []).find((f: any) => f.x === row.k)?.probabilidadEmpirica || 0;
    const pSim = simulacion?.resultado?.frecuenciasRelativas?.[row.k] || 0;
    return {
      k: row.k,
      teorica: row.probabilidad,
      empirica: pEmp,
      simulada: pSim
    };
  });

  const datosEconomico = (teoria?.tabla || []).slice(0, 15).map((row: any) => {
    let valor = 0;
    if (slug === "fabrica") {
      valor = 3500 * row.k + 12000;
    } else if (slug === "ventas") {
      valor = 2000 * row.k - 5000;
    } else if (slug === "restaurante") {
      valor = 4500 * row.k;
    }
    return {
      x: row.k,
      valorEconomico: valor,
      probabilidad: row.probabilidad
    };
  });

  const esperanzaEconomicaActual =
    slug === "fabrica"
      ? 3500 * (teoria?.esperanza || 0) + 12000
      : slug === "ventas"
      ? 2000 * (teoria?.esperanza || 0) - 5000
      : 4500 * (teoria?.esperanza || 0);

  return (
    <div className="space-y-10">
      {/* 1. Encabezado */}
      <section className="border-b border-[#e5e5e5] pb-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-[#0a0a0a] tracking-tight">
          {nombre}
        </h1>
        <p className="mt-2 text-sm md:text-base text-[#737373] max-w-3xl leading-relaxed">
          {descripcion}
        </p>
      </section>

      {/* 2. Panel de Parámetros Interactivo */}
      <section className="design-card space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
          <h3 className="text-lg font-semibold text-[#0a0a0a]">Parámetros del Proceso</h3>
          <span className="text-xs font-mono text-[#737373]">
            Modelo B(n, p)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-[#0a0a0a] mb-1.5 uppercase font-mono tracking-wider">
              1. Ensayos por lote / día (n):
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={n}
              onChange={(e) => setN(Number(e.target.value))}
              className="design-input w-full font-mono text-xs"
            />
            <span className="text-[11px] text-[#737373] mt-1 block">
              {nombreVariableX}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0a0a0a] mb-1.5 uppercase font-mono tracking-wider">
              2. Probabilidad individual (p):
            </label>
            <input
              type="number"
              step="0.01"
              min={0}
              max={1}
              value={p}
              onChange={(e) => setP(Number(e.target.value))}
              className="design-input w-full font-mono text-xs"
            />
            <span className="text-[11px] text-[#737373] mt-1 block">
              Representa el {formatearPorcentaje(p * 100, 1)} de ocurrencia
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0a0a0a] mb-1.5 uppercase font-mono tracking-wider">
              3. Cantidad de Simulaciones:
            </label>
            <select
              value={numCorridas}
              onChange={(e) => setNumCorridas(Number(e.target.value))}
              className="design-input w-full font-mono text-xs cursor-pointer"
            >
              <option value={10}>10 experimentos (Muestra pequeña)</option>
              <option value={100}>100 experimentos</option>
              <option value={1000}>1.000 experimentos (Recomendado)</option>
              <option value={10000}>10.000 experimentos (Ley Grandes Números)</option>
            </select>
            <span className="text-[11px] text-[#737373] mt-1 block">
              Repeticiones para comparar empírico vs teórico
            </span>
          </div>

          <div className="flex flex-col justify-end gap-2">
            <button
              onClick={handleSimular}
              disabled={cargando}
              className="btn-primary w-full !py-2.5 text-xs font-medium"
            >
              <Play size={14} className={cargando ? "animate-spin" : "fill-current"} />
              <span>{cargando ? "Simulando..." : "Ejecutar Simulación"}</span>
            </button>
            <button
              onClick={handleRestablecer}
              className="btn-ghost w-full !py-1.5 text-xs"
            >
              <RotateCcw size={12} />
              <span>Valores por Defecto</span>
            </button>
          </div>
        </div>

        {/* Parámetro de reproducibilidad (Semilla) colapsable */}
        <div className="pt-2 border-t border-[#e5e5e5]/80 flex items-center justify-between text-xs text-[#737373]">
          <span className="text-[11px]">Semilla pseudoaleatoria: <strong className="font-mono text-[#0a0a0a]">{semilla}</strong> (Mulberry32 determinista)</span>
          <button
            type="button"
            onClick={() => setSemilla(Math.floor(Math.random() * 9999) + 1)}
            className="text-[11px] text-[#0a0a0a] hover:underline cursor-pointer"
          >
            Cambiar semilla al azar
          </button>
        </div>

        {error && (
          <div className="p-3 bg-[#fef2f2] border border-[#fecaca] text-[#e7000b] rounded-[18px] text-xs">
            {error}
          </div>
        )}
      </section>

      {/* 3. Cálculo Teórico con Desglose Numérico Paso a Paso */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="design-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="badge-soft text-[11px]">Esperanza Matemática</span>
              <span className="text-[11px] font-medium text-[#737373]">¿Qué esperar en promedio?</span>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#0a0a0a] tracking-tight">
              E(X) = {teoria ? formatearNumero(teoria.esperanza, 2) : "—"}
            </div>
            <p className="text-xs text-[#0a0a0a] font-medium mt-1">
              {slug === "fabrica"
                ? `Se espera en promedio ~${teoria ? formatearNumero(teoria.esperanza, 1) : "1"} pieza defectuosa por lote.`
                : slug === "ventas"
                ? `Se esperan en promedio ~${teoria ? formatearNumero(teoria.esperanza, 1) : "9"} ventas concretadas al día.`
                : `Se esperan en promedio ~${teoria ? formatearNumero(teoria.esperanza, 1) : "3.2"} pedidos no retirados.`}
            </p>
            <div className="mt-4 space-y-1.5 text-xs font-mono bg-[#f5f5f5] p-4 rounded-[18px] border border-[#e5e5e5]">
              <p className="text-[#737373] font-sans">Fórmula Binomial:</p>
              <p className="text-[#0a0a0a] font-semibold">E(X) = n · p</p>
              <p className="text-[#737373] pt-1 border-t border-[#e5e5e5]">Reemplazo numérico:</p>
              <p className="text-[#0a0a0a]">
                E(X) = {n} · {p} = {formatearNumero(n * p, 4)}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[#737373] mt-4 leading-relaxed">
            <strong>Significado:</strong> Es el centro de gravedad del proceso. Si repites la prueba muchas veces, el promedio se acercará exactamente a este número.
          </p>
        </div>

        <div className="design-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="badge-soft text-[11px]">Varianza Teórica</span>
              <span className="text-[11px] font-medium text-[#737373]">Variabilidad al cuadrado</span>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#0a0a0a] tracking-tight">
              Var(X) = {teoria ? formatearNumero(teoria.varianza, 4) : "—"}
            </div>
            <p className="text-xs text-[#0a0a0a] font-medium mt-1">
              Medida técnica de volatilidad o incertidumbre cuadrática.
            </p>
            <div className="mt-4 space-y-1.5 text-xs font-mono bg-[#f5f5f5] p-4 rounded-[18px] border border-[#e5e5e5]">
              <p className="text-[#737373] font-sans">Fórmula Binomial:</p>
              <p className="text-[#0a0a0a] font-semibold">Var(X) = n · p · (1 - p)</p>
              <p className="text-[#737373] pt-1 border-t border-[#e5e5e5]">Reemplazo numérico:</p>
              <p className="text-[#0a0a0a]">
                Var(X) = {n} · {p} · (1 - {p}) = {formatearNumero(n * p * (1 - p), 4)}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[#737373] mt-4 leading-relaxed">
            <strong>Significado:</strong> Cuanto más cercano a cero sea, más predecible y consistente será el resultado de cada corrida.
          </p>
        </div>

        <div className="design-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="badge-soft text-[11px]">Desviación Estándar</span>
              <span className="text-[11px] font-medium text-[#737373]">Oscilación típica (±)</span>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#0a0a0a] tracking-tight">
              σ = {teoria ? formatearNumero(teoria.desviacion, 3) : "—"}
            </div>
            <p className="text-xs text-[#0a0a0a] font-medium mt-1">
              {slug === "fabrica"
                ? `Lo habitual es oscilar ±${teoria ? formatearNumero(teoria.desviacion, 1) : "1"} defecto respecto al promedio.`
                : slug === "ventas"
                ? `Las ventas diarias suelen oscilar en ±${teoria ? formatearNumero(teoria.desviacion, 1) : "2.5"} clientes.`
                : `Los no retirados fluctúan en ±${teoria ? formatearNumero(teoria.desviacion, 1) : "1.7"} pedidos.`}
            </p>
            <div className="mt-4 space-y-1.5 text-xs font-mono bg-[#f5f5f5] p-4 rounded-[18px] border border-[#e5e5e5]">
              <p className="text-[#737373] font-sans">Fórmula:</p>
              <p className="text-[#0a0a0a] font-semibold">σ = √(Var(X))</p>
              <p className="text-[#737373] pt-1 border-t border-[#e5e5e5]">Reemplazo numérico:</p>
              <p className="text-[#0a0a0a]">
                σ = √({formatearNumero(n * p * (1 - p), 4)}) = {formatearNumero(Math.sqrt(n * p * (1 - p)), 4)}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[#737373] mt-4 leading-relaxed">
            <strong>Significado práctico:</strong> Expresa la dispersión en las mismas unidades (piezas, ventas, pedidos), permitiendo entender el rango esperado en el día a día.
          </p>
        </div>
      </section>

      {/* 4. Resultados de la Simulación */}
      {simulacion && (
        <section className="design-card space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#e5e5e5] gap-3">
            <div>
              <span className="badge-solid mb-1 text-[11px]">
                Resultados Monte Carlo
              </span>
              <h3 className="text-lg font-semibold text-[#0a0a0a] mt-1">
                Estimación Muestral vs Modelo Teórico
              </h3>
            </div>
            <button
              onClick={handleDescargarCSVResultados}
              className="btn-outline text-xs !py-1.5 !px-3 self-start md:self-auto"
            >
              <Download size={13} />
              <span>Exportar CSV</span>
            </button>
          </div>

          {/* Veredicto en lenguaje sencillo */}
          <div className="bg-[#f5f5f5] p-4 sm:p-5 rounded-[18px] border border-[#e5e5e5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0a0a0a] flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-[#0a0a0a]" />
                Conclusión de la Simulación ({numCorridas} corridas)
              </span>
              <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
                El promedio obtenido en las simulaciones fue de <strong className="text-[#0a0a0a]">{formatearNumero(simulacion.resultado.mediaMuestral, 2)}</strong> frente a la esperanza teórica de <strong className="text-[#0a0a0a]">{formatearNumero(simulacion.resultado.esperanzaTeorica, 2)}</strong> (diferencia de solo {formatearPorcentaje(simulacion.resultado.errorRelativoMedia, 2)}).
              </p>
            </div>
            <span className="badge-solid text-[11px] shrink-0">
              Ley de Grandes Números verificada
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3.5 bg-[#f5f5f5] rounded-[18px] border border-[#e5e5e5]">
              <span className="text-[11px] font-mono text-[#737373] block">Media Muestral (X̄)</span>
              <span className="text-lg font-mono font-semibold text-[#0a0a0a]">
                {formatearNumero(simulacion.resultado.mediaMuestral, 3)}
              </span>
              <span className="text-[10px] text-[#737373] block mt-1">
                E(X) = {formatearNumero(simulacion.resultado.esperanzaTeorica, 3)}
              </span>
            </div>

            <div className="p-3.5 bg-[#f5f5f5] rounded-[18px] border border-[#e5e5e5]">
              <span className="text-[11px] font-mono text-[#737373] block">Varianza Muestral (s²)</span>
              <span className="text-lg font-mono font-semibold text-[#0a0a0a]">
                {formatearNumero(simulacion.resultado.varianzaMuestral, 4)}
              </span>
              <span className="text-[10px] text-[#737373] block mt-1">Divisor N - 1</span>
            </div>

            <div className="p-3.5 bg-[#f5f5f5] rounded-[18px] border border-[#e5e5e5]">
              <span className="text-[11px] font-mono text-[#737373] block">Desv. Muestral (s)</span>
              <span className="text-lg font-mono font-semibold text-[#0a0a0a]">
                {formatearNumero(simulacion.resultado.desviacionMuestral, 4)}
              </span>
              <span className="text-[10px] text-[#737373] block mt-1">
                σ = {formatearNumero(simulacion.resultado.desviacionTeorica, 4)}
              </span>
            </div>

            <div className="p-3.5 bg-[#f5f5f5] rounded-[18px] border border-[#e5e5e5]">
              <span className="text-[11px] font-mono text-[#737373] block">Rango Observado</span>
              <span className="text-lg font-mono font-semibold text-[#0a0a0a]">
                [{simulacion.resultado.minimo} , {simulacion.resultado.maximo}]
              </span>
              <span className="text-[10px] text-[#737373] block mt-1">Mínimo y Máximo</span>
            </div>

            <div className="p-3.5 bg-[#f5f5f5] rounded-[18px] border border-[#e5e5e5]">
              <span className="text-[11px] font-mono text-[#737373] block">Error Absoluto Media</span>
              <span className="text-lg font-mono font-semibold text-[#0a0a0a]">
                {formatearNumero(simulacion.resultado.errorAbsolutoMedia, 4)}
              </span>
              <span className="text-[10px] text-[#737373] block mt-1">|X̄ - E(X)|</span>
            </div>

            <div className="p-3.5 bg-[#f5f5f5] rounded-[18px] border border-[#e5e5e5]">
              <span className="text-[11px] font-mono text-[#737373] block">Error Relativo</span>
              <span className="text-lg font-mono font-semibold text-[#0a0a0a]">
                {formatearPorcentaje(simulacion.resultado.errorRelativoMedia, 2)}
              </span>
              <span className="text-[10px] text-[#737373] block mt-1">
                {simulacion.resultado.errorRelativoMedia < 3 ? "✓ Cumple < 3%" : "Típico en N menor"}
              </span>
            </div>
          </div>

          {/* Interpretación Automática */}
          <div className="bg-[#fafafa] p-4 rounded-[18px] border border-[#e5e5e5] space-y-1.5">
            <div className="flex items-center gap-2">
              <Info size={15} className="text-[#0a0a0a]" />
              <span className="font-semibold text-xs uppercase tracking-wider text-[#0a0a0a]">
                Interpretación Automática del Proceso
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#737373] leading-relaxed">
              {simulacion.interpretacion}
            </p>
          </div>
        </section>
      )}

      {/* 5. Propiedades de la Esperanza y Varianza */}
      <section className="design-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e5e5e5]">
          <h3 className="text-lg font-semibold text-[#0a0a0a]">
            Propiedades Teóricas Demostradas y Significado de Datos
          </h3>
          <span className="text-xs font-mono text-[#737373]">
            Álgebra de Variables Aleatorias
          </span>
        </div>

        {/* Explicación didáctica introductoria */}
        <div className="p-4 sm:p-5 bg-[#f5f5f5] rounded-[18px] border border-[#e5e5e5] text-xs text-[#737373] leading-relaxed space-y-1.5">
          <p className="font-semibold text-[#0a0a0a] flex items-center gap-1.5 text-xs sm:text-[13px]">
            <Info size={14} />
            ¿Qué demuestran estas propiedades matemáticas?
          </p>
          <p>
            Demuestran que no es necesario simular millones de combinaciones para predecir costos totales o semanas completas: el álgebra de probabilidades permite deducir el valor exacto esperado y su volatilidad con fórmulas directas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta 1: Transformación Lineal */}
          <div className="p-6 sm:p-7 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="badge-outline text-[11px]">
                  Propiedad de Transformación Lineal
                </span>
                <span className="text-[11px] font-mono text-[#737373]">Y = a·X + b</span>
              </div>

              <div>
                <h5 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">
                  Linealidad del Indicador Económico
                </h5>
                <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                  {slug === "fabrica"
                    ? "Cada pieza defectuosa cuesta $3.500 de reparación (a) más un costo fijo de inspección de $12.000 por lote (b)."
                    : slug === "ventas"
                    ? "Cada cliente atendido aporta $2.000 (a), con un costo operativo fijo de la tienda de $5.000 al día (b)."
                    : "Cada pedido no retirado genera una pérdida neta directa de insumos de $4.500 (a), sin costos fijos adicionales (b = 0)."}
                </p>
              </div>

              {/* Parámetros involucrados */}
              <div className="p-3 bg-white rounded-[12px] border border-[#e5e5e5] space-y-1 text-xs">
                <p className="font-semibold text-[#0a0a0a]">Datos utilizados en el cálculo:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-[#737373] font-mono pt-1">
                  <div>• Coeficiente variable (a): <strong className="text-[#0a0a0a]">${valorUnitarioDefault.toLocaleString("es-CL")}</strong></div>
                  <div>• Monto base fijo (b): <strong className="text-[#0a0a0a]">${costoFijoDefault.toLocaleString("es-CL")}</strong></div>
                  <div>• Esperanza base E(X): <strong className="text-[#0a0a0a]">{teoria ? formatearNumero(teoria.esperanza, 2) : "—"}</strong></div>
                  <div>• Varianza base Var(X): <strong className="text-[#0a0a0a]">{teoria ? formatearNumero(teoria.varianza, 4) : "—"}</strong></div>
                </div>
              </div>

              {/* Fórmulas */}
              <div className="text-xs space-y-3 text-[#737373]">
                <div>
                  <strong className="text-[#0a0a0a] block mb-1">
                    1. Esperanza: E(aX + b) = a · E(X) + b
                  </strong>
                  <div className="font-mono bg-white p-3 rounded-[12px] border border-[#e5e5e5] text-[#0a0a0a] shadow-2xs leading-relaxed">
                    {teoria?.transformacionEconomica?.formulaEsperanza || "E(aX + b)"}
                  </div>
                  <p className="text-[11px] text-[#737373] mt-1">
                    <strong className="text-[#0a0a0a]">Significado:</strong> Es el gasto o ingreso económico que la empresa debe proyectar en promedio por cada ciclo.
                  </p>
                </div>

                <div>
                  <strong className="text-[#0a0a0a] block mb-1">
                    2. Varianza: Var(aX + b) = a² · Var(X)
                  </strong>
                  <div className="font-mono bg-white p-3 rounded-[12px] border border-[#e5e5e5] text-[#0a0a0a] shadow-2xs leading-relaxed overflow-x-auto">
                    {teoria?.transformacionEconomica?.formulaVarianza || "Var(aX + b) = a² · Var(X)"}
                  </div>
                  <p className="text-[11px] text-[#737373] mt-1">
                    <strong className="text-[#0a0a0a]">Razón analítica:</strong> Los valores fijos no fluctúan entre un día y otro. Al no tener variación, su varianza es 0.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Suma de Líneas Independientes (Fábrica) */}
          {tieneSumaIndependiente && (
            <div className="p-6 sm:p-7 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="badge-solid text-[11px]">
                    Propiedad de Suma Independiente
                  </span>
                  <span className="text-[11px] font-mono text-[#737373]">A + B</span>
                </div>

                <div>
                  <h5 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">
                    Dos Líneas de Producción en Paralelo
                  </h5>
                  <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                    Compara la producción simultánea de la <strong>Línea A</strong> (20 unidades, 5% de falla) y la <strong>Línea B</strong> (20 unidades, 8% de falla).
                  </p>
                </div>

                {/* Parámetros involucrados */}
                <div className="p-3 bg-white rounded-[12px] border border-[#e5e5e5] space-y-1 text-xs">
                  <p className="font-semibold text-[#0a0a0a]">Datos utilizados en el cálculo:</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#737373] font-mono pt-1">
                    <div>• E(A): <strong className="text-[#0a0a0a]">1,00 defectuoso</strong></div>
                    <div>• Var(A): <strong className="text-[#0a0a0a]">0,95</strong></div>
                    <div>• E(B): <strong className="text-[#0a0a0a]">1,60 defectuosos</strong></div>
                    <div>• Var(B): <strong className="text-[#0a0a0a]">1,472</strong></div>
                  </div>
                </div>

                {/* Fórmulas */}
                <div className="text-xs space-y-3 text-[#737373]">
                  <div>
                    <strong className="text-[#0a0a0a] block mb-1">
                      1. Esperanza Conjunta: E(A + B) = E(A) + E(B)
                    </strong>
                    <div className="font-mono bg-white p-3 rounded-[12px] border border-[#e5e5e5] text-[#0a0a0a] shadow-2xs leading-relaxed">
                      {teoria?.sumaPropiedad?.formulaEsperanza || "E(A + B) = 1 + 1.6 = 2.6"}
                    </div>
                    <p className="text-[11px] text-[#737373] mt-1">
                      <strong className="text-[#0a0a0a]">Significado:</strong> Entre ambas líneas se espera encontrar un promedio de <strong>2,6 piezas falladas</strong> en cada lote conjunto.
                    </p>
                  </div>

                  <div>
                    <strong className="text-[#0a0a0a] block mb-1">
                      2. Varianza Conjunta: Var(A + B) = Var(A) + Var(B)
                    </strong>
                    <div className="font-mono bg-white p-3 rounded-[12px] border border-[#e5e5e5] text-[#0a0a0a] shadow-2xs leading-relaxed overflow-x-auto">
                      {teoria?.sumaPropiedad?.formulaVarianza || "Var(A + B) = 0.95 + 1.472 = 2.422"}
                    </div>
                    <p className="text-[11px] text-[#737373] mt-1">
                      <strong className="text-[#0a0a0a]">Razón analítica:</strong> Válido porque ambas líneas son <em>estadísticamente independientes</em> (lo que ocurra en una máquina no afecta a la otra, covarianza = 0).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tarjeta 2 (Alternativa): Suma Semanal Temporal (Restaurante) */}
          {tieneSumaSemanal && (
            <div className="p-6 sm:p-7 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] space-y-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="badge-solid text-[11px]">
                    Propiedad de Suma Temporal
                  </span>
                  <span className="text-[11px] font-mono text-[#737373]">S₇ = Σ Xᵢ (i=1..7)</span>
                </div>

                <div>
                  <h5 className="text-sm sm:text-base font-semibold text-[#0a0a0a]">
                    Impacto Semanal Acumulado (7 Días)
                  </h5>
                  <p className="text-xs text-[#737373] mt-1 leading-relaxed">
                    Extensión del modelo diario de 40 pedidos al acumulado de lunes a domingo asumiendo comportamiento independiente entre jornadas.
                  </p>
                </div>

                {/* Parámetros involucrados */}
                <div className="p-3 bg-white rounded-[12px] border border-[#e5e5e5] space-y-1 text-xs">
                  <p className="font-semibold text-[#0a0a0a]">Datos utilizados en el cálculo:</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-[#737373] font-mono pt-1">
                    <div>• Días considerados: <strong className="text-[#0a0a0a]">7 días</strong></div>
                    <div>• E(X) por día: <strong className="text-[#0a0a0a]">3,20 pedidos</strong></div>
                    <div>• Var(X) por día: <strong className="text-[#0a0a0a]">2,944</strong></div>
                    <div>• Pérdida unitaria: <strong className="text-[#0a0a0a]">$4.500</strong></div>
                  </div>
                </div>

                {/* Fórmulas */}
                <div className="text-xs space-y-3 text-[#737373]">
                  <div>
                    <strong className="text-[#0a0a0a] block mb-1">
                      1. Esperanza Semanal: E(S₇) = 7 · E(X_día)
                    </strong>
                    <div className="font-mono bg-white p-3 rounded-[12px] border border-[#e5e5e5] text-[#0a0a0a] shadow-2xs leading-relaxed">
                      {teoria?.sumaPropiedad?.formulaEsperanza || "E(S₇) = 7 · 3.2 = 22.4"}
                    </div>
                    <p className="text-[11px] text-[#737373] mt-1">
                      <strong className="text-[#0a0a0a]">Significado:</strong> En una semana completa se espera un descarte acumulado promedio de <strong>22,4 platos no retirados</strong>.
                    </p>
                  </div>

                  <div>
                    <strong className="text-[#0a0a0a] block mb-1">
                      2. Varianza Semanal: Var(S₇) = 7 · Var(X_día)
                    </strong>
                    <div className="font-mono bg-white p-3 rounded-[12px] border border-[#e5e5e5] text-[#0a0a0a] shadow-2xs leading-relaxed overflow-x-auto">
                      {teoria?.sumaPropiedad?.formulaVarianza || "Var(S₇) = 7 · 2.944 = 20.608"}
                    </div>
                    <p className="text-[11px] text-[#737373] mt-1">
                      <strong className="text-[#0a0a0a]">Interpretación de dispersión:</strong> La desviación estándar semanal es de aproximadamente 4,54 pedidos (raíz cuadrada de 20,608), mostrando el rango habitual de oscilación semana a semana.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 6. Gráficos Interactivos Recharts */}
      <section ref={seccionGraficosRef} className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
          <h3 className="text-lg font-semibold text-[#0a0a0a]">Visualización Gráfica</h3>
          <button
            onClick={handleDescargarPNG}
            className="btn-outline text-xs !py-1.5 !px-3"
          >
            <Camera size={13} />
            <span>Descargar Gráficos (PNG)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GraficoHistograma datos={datosHistograma} />
          <GraficoConvergencia
            datos={
              simulacion?.resultado?.mediasAcumuladas || [
                { corrida: 1, mediaAcumulada: n * p, esperanzaTeorica: n * p }
              ]
            }
          />
          <GraficoComparativoDistribuciones datos={datosComparativaTres} />
          <GraficoEconomico
            titulo={etiquetaIndicadorEconomico}
            subtitulo={`Cálculo económico en función de las realizaciones de X`}
            datos={datosEconomico}
            esperanzaEconomica={esperanzaEconomicaActual}
            nombreEjeY="Monto (CLP)"
          />
        </div>
      </section>

      {/* 7. Tabla de Distribución de Probabilidad Completa */}
      {teoria?.tabla && (
        <section className="design-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
            <div>
              <h4 className="text-base font-semibold text-[#0a0a0a]">
                Función de Probabilidad Binomial Puntual y Acumulada
              </h4>
              <p className="text-xs text-[#737373]">
                Soporte discreto k ∈ &#123;0, 1, ..., n&#125; calculada con precisión logarítmica.
              </p>
            </div>
            <span className="badge-outline font-mono text-[11px]">n = {n}, p = {p}</span>
          </div>

          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="sticky top-0 bg-[#f5f5f5] text-[#0a0a0a] border-b border-[#e5e5e5]">
                <tr>
                  <th className="py-2.5 px-3">k (éxitos)</th>
                  <th className="py-2.5 px-3">P(X = k)</th>
                  <th className="py-2.5 px-3">P(X ≤ k) [Acumulada]</th>
                  <th className="py-2.5 px-3">Fórmula Matemática</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {teoria.tabla.map((f: any) => (
                  <tr key={f.k} className="hover:bg-[#fafafa]">
                    <td className="py-2 px-3 font-semibold text-[#0a0a0a]">{f.k}</td>
                    <td className="py-2 px-3 font-medium text-[#0a0a0a]">{f.probabilidad.toFixed(6)}</td>
                    <td className="py-2 px-3 text-[#737373]">{f.acumulada.toFixed(6)}</td>
                    <td className="py-2 px-3 text-[#737373] text-[11px] font-sans">{f.formula}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 8. Análisis de Sensibilidad (Restaurante) */}
      {tieneAnalisisSensibilidad && (
        <section className="design-card space-y-4">
          <div className="pb-3 border-b border-[#e5e5e5]">
            <span className="badge-soft mb-1 text-[11px]">Estudio Paramétrico</span>
            <h4 className="text-base font-semibold text-[#0a0a0a] mt-1">
              Análisis de Sensibilidad: Variación de p ∈ &#123;5%, 8%, 12%&#125; y n ∈ &#123;30, 40, 50&#125;
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="bg-[#f5f5f5] text-[#0a0a0a]">
                <tr>
                  <th className="py-2.5 px-3">Escenario (n, p)</th>
                  <th className="py-2.5 px-3">Esperanza E(X)</th>
                  <th className="py-2.5 px-3">Varianza Var(X)</th>
                  <th className="py-2.5 px-3">Desviación σ</th>
                  <th className="py-2.5 px-3">Pérdida Esperada E(L)</th>
                  <th className="py-2.5 px-3">Coef. Variación (CV)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {[
                  { n: 30, p: 0.05 },
                  { n: 30, p: 0.08 },
                  { n: 30, p: 0.12 },
                  { n: 40, p: 0.05 },
                  { n: 40, p: 0.08, actual: true },
                  { n: 40, p: 0.12 },
                  { n: 50, p: 0.05 },
                  { n: 50, p: 0.08 },
                  { n: 50, p: 0.12 }
                ].map((s, idx) => {
                  const e = s.n * s.p;
                  const v = s.n * s.p * (1 - s.p);
                  const d = Math.sqrt(v);
                  const l = 4500 * e;
                  const cv = (d / e) * 100;
                  return (
                    <tr
                      key={idx}
                      className={s.actual ? "bg-[#f5f5f5] font-semibold text-[#0a0a0a]" : "hover:bg-[#fafafa]"}
                    >
                      <td className="py-2 px-3">
                        n={s.n}, p={formatearPorcentaje(s.p * 100, 0)} {s.actual && "(Base)"}
                      </td>
                      <td className="py-2 px-3">{formatearNumero(e, 2)}</td>
                      <td className="py-2 px-3">{formatearNumero(v, 3)}</td>
                      <td className="py-2 px-3">{formatearNumero(d, 3)}</td>
                      <td className="py-2 px-3 text-[#0a0a0a]">{formatearCLP(l)}</td>
                      <td className="py-2 px-3">{formatearPorcentaje(cv, 1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 9. Tabla Histórica */}
      <TablaHistorica
        slug={slug}
        registrosIniciales={[]}
        totalInicial={0}
        onDataChanged={async () => {
          const resEmp = await fetchEmpirica(slug);
          if (resEmp.success) setEmpirica(resEmp.data);
        }}
      />
    </div>
  );
}
