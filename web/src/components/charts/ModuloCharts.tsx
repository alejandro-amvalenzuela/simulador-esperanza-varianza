"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { formatearNumero, formatearPorcentaje, formatearCLP } from "@/lib/formatters";
import { Info, HelpCircle } from "lucide-react";

interface PropsHistograma {
  datos: {
    k: number;
    probabilidadTeorica: number;
    frecuenciaRelativaSimulada?: number;
    frecuenciaRelativaEmpirica?: number;
  }[];
}

export function GraficoHistograma({ datos }: PropsHistograma) {
  return (
    <div className="design-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="badge-soft text-[11px]">
            Distribución de Probabilidad
          </span>
          <span className="badge-outline text-[11px] font-mono">
            Teoría vs Simulación
          </span>
        </div>

        <h4 className="text-base font-semibold text-[#0a0a0a]">
          Histograma de Probabilidades
        </h4>

        {/* Guía en lenguaje natural */}
        <div className="mt-2 mb-4 p-3 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#737373] space-y-1">
          <p className="flex items-center gap-1.5 font-medium text-[#0a0a0a]">
            <Info size={13} />
            ¿Qué muestra este gráfico?
          </p>
          <p className="leading-relaxed">
            Muestra la probabilidad de obtener exactamente <strong>x éxitos</strong>. La barra negra representa el modelo exacto <strong className="text-[#0a0a0a]">P(X=x)</strong> y la barra gris la frecuencia observada en tus simulaciones. Cuanto más se parezcan, más preciso es el experimento.
          </p>
        </div>

        <div className="h-64 sm:h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="k"
                label={{ value: "Cantidad de éxitos observados (x)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#737373" }}
                tick={{ fontSize: 11, fill: "#737373" }}
              />
              <YAxis
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                label={{ value: "Probabilidad (%)", angle: -90, position: "insideLeft", fontSize: 11, fill: "#737373" }}
                tick={{ fontSize: 11, fill: "#737373" }}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatearPorcentaje(Number(value) * 100, 2),
                  name === "probabilidadTeorica" ? "Teórico exacto" : "Simulación Monte Carlo"
                ]}
                labelFormatter={(label) => `Si ocurren x = ${label} éxitos`}
                contentStyle={{ backgroundColor: "#0a0a0a", color: "#fafafa", borderRadius: "12px", border: "none", fontSize: "12px" }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }} />
              <Bar dataKey="probabilidadTeorica" name="Teoría P(X=k)" fill="#0f172a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="frecuenciaRelativaSimulada" name="Simulación (Monte Carlo)" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-3 border-t border-[#e5e5e5] text-[11px] text-[#737373]">
        <strong className="text-[#0a0a0a]">Interpretación:</strong> La cúspide de las barras coincide con el valor más probable (cercano a la esperanza matemática E(X)).
      </div>
    </div>
  );
}

interface PropsConvergencia {
  datos: { corrida: number; mediaAcumulada: number; esperanzaTeorica: number }[];
}

export function GraficoConvergencia({ datos }: PropsConvergencia) {
  return (
    <div className="design-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="badge-soft text-[11px]">
            Ley Débil de los Grandes Números
          </span>
          <span className="badge-outline text-[11px] font-mono">
            X̄_N → E(X)
          </span>
        </div>

        <h4 className="text-base font-semibold text-[#0a0a0a]">
          Convergencia de la Media Acumulada
        </h4>

        {/* Guía en lenguaje natural */}
        <div className="mt-2 mb-4 p-3 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#737373] space-y-1">
          <p className="flex items-center gap-1.5 font-medium text-[#0a0a0a]">
            <Info size={13} />
            ¿Qué demuestra este gráfico?
          </p>
          <p className="leading-relaxed">
            A medida que aumenta el número de repeticiones (eje horizontal), la media promedio calculada (línea naranja) se va estabilizando y pegando a la línea continua de la <strong className="text-[#0a0a0a]">Esperanza Teórica E(X)</strong> (línea oscura).
          </p>
        </div>

        <div className="h-64 sm:h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datos} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="corrida"
                label={{ value: "N° de repetición acumulada", position: "insideBottom", offset: -10, fontSize: 11, fill: "#737373" }}
                tick={{ fontSize: 11, fill: "#737373" }}
              />
              <YAxis
                domain={["auto", "auto"]}
                label={{ value: "Promedio acumulado", angle: -90, position: "insideLeft", fontSize: 11, fill: "#737373" }}
                tick={{ fontSize: 11, fill: "#737373" }}
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  formatearNumero(Number(value), 3),
                  name === "esperanzaTeorica" ? "Meta teórica fija" : "Promedio hasta esta corrida"
                ]}
                labelFormatter={(label) => `Tras ${Number(label).toLocaleString("es-CL")} corridas`}
                contentStyle={{ backgroundColor: "#0a0a0a", color: "#fafafa", borderRadius: "12px", border: "none", fontSize: "12px" }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }} />
              <Line
                type="monotone"
                dataKey="esperanzaTeorica"
                name="Esperanza Teórica E(X)"
                stroke="#0f172a"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="mediaAcumulada"
                name="Media Muestral Acumulada"
                stroke="#f97316"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-3 border-t border-[#e5e5e5] text-[11px] text-[#737373]">
        <strong className="text-[#0a0a0a]">Principio matemático:</strong> Al inicio hay oscilaciones por el azar de pocas corridas; con N elevado, la media converge y se aplana en torno a la esperanza teórica E(X).
      </div>
    </div>
  );
}

interface PropsComparacionTres {
  datos: {
    k: number;
    teorica: number;
    empirica: number;
    simulada: number;
  }[];
}

export function GraficoComparativoDistribuciones({ datos }: PropsComparacionTres) {
  return (
    <div className="design-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="badge-soft text-[11px]">
            Triangulación de Resultados
          </span>
          <span className="badge-outline text-[11px] font-mono">
            3 Fuentes de Datos
          </span>
        </div>

        <h4 className="text-base font-semibold text-[#0a0a0a]">
          Comparativa: Teórica vs Histórica vs Simulación
        </h4>

        {/* Guía en lenguaje natural concisa */}
        <div className="mt-2 mb-4 p-3 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#737373] space-y-1.5">
          <p className="flex items-center gap-1.5 font-medium text-[#0a0a0a]">
            <Info size={13} />
            Significado de las tres barras:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] leading-relaxed pt-0.5">
            <div>• <strong className="text-[#0f172a]">Teórica (Azul marino):</strong> Probabilidad matemática pura B(n, p).</div>
            <div>• <strong className="text-[#0284c7]">Histórica (Celeste):</strong> Frecuencia real de registros pasados.</div>
            <div>• <strong className="text-[#f97316]">Simulación (Naranja):</strong> Frecuencia empírica Monte Carlo.</div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="k" tick={{ fontSize: 11, fill: "#737373" }} label={{ value: "Cantidad de éxitos (x)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#737373" }} />
              <YAxis tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fontSize: 11, fill: "#737373" }} />
              <Tooltip
                formatter={(val: any, name: any) => [
                  formatearPorcentaje(Number(val) * 100, 2),
                  name === "teorica" ? "Teórica B(n, p)" : name === "empirica" ? "Histórica Real" : "Simulación Monte Carlo"
                ]}
                labelFormatter={(label) => `Para x = ${label} éxitos`}
                contentStyle={{ backgroundColor: "#0a0a0a", color: "#fafafa", borderRadius: "12px", border: "none", fontSize: "12px" }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }} />
              <Bar dataKey="teorica" name="Teórica" fill="#0f172a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="empirica" name="Histórica (Real)" fill="#0284c7" radius={[3, 3, 0, 0]} />
              <Bar dataKey="simulada" name="Simulada (Monte Carlo)" fill="#f97316" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-3 border-t border-[#e5e5e5] text-[11px] text-[#737373]">
        <strong className="text-[#0a0a0a]">Validación:</strong> Si las tres barras tienen alturas similares para cada x, se confirma la validez del modelo teórico para este proceso.
      </div>
    </div>
  );
}

interface PropsEconomico {
  titulo: string;
  subtitulo: string;
  datos: { x: number; valorEconomico: number; probabilidad: number }[];
  esperanzaEconomica: number;
  nombreEjeY: string;
}

export function GraficoEconomico({
  titulo,
  subtitulo,
  datos,
  esperanzaEconomica,
  nombreEjeY
}: PropsEconomico) {
  return (
    <div className="design-card flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="badge-soft text-[11px]">
            Transformación Lineal Económica
          </span>
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase text-[#737373] block">Valor Medio Esperado</span>
            <span className="text-sm font-semibold font-mono text-[#0a0a0a]">
              {formatearCLP(esperanzaEconomica)}
            </span>
          </div>
        </div>

        <h4 className="text-base font-semibold text-[#0a0a0a]">{titulo}</h4>

        {/* Guía en lenguaje natural */}
        <div className="mt-2 mb-4 p-3 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#737373] space-y-1">
          <p className="flex items-center gap-1.5 font-medium text-[#0a0a0a]">
            <Info size={13} />
            ¿Qué representa este monto?
          </p>
          <p className="leading-relaxed">
            Muestra el dinero (costo, ganancia o pérdida) según la cantidad de eventos x. Cada barra representa el impacto financiero exacto correspondiente a ese escenario.
          </p>
        </div>

        <div className="h-64 sm:h-72 w-full mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} margin={{ top: 10, right: 10, left: 15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="x"
                label={{ value: "Cantidad de eventos (x)", position: "insideBottom", offset: -10, fontSize: 11, fill: "#737373" }}
                tick={{ fontSize: 11, fill: "#737373" }}
              />
              <YAxis
                tickFormatter={(v) => formatearCLP(v)}
                label={{ value: nombreEjeY, angle: -90, position: "insideLeft", fontSize: 11, fill: "#737373" }}
                tick={{ fontSize: 11, fill: "#737373" }}
              />
              <Tooltip
                formatter={(value: any) => [formatearCLP(Number(value)), nombreEjeY]}
                labelFormatter={(label) => `Con x = ${label} ocurrencias`}
                contentStyle={{ backgroundColor: "#0a0a0a", color: "#fafafa", borderRadius: "12px", border: "none", fontSize: "12px" }}
              />
              <Bar dataKey="valorEconomico" name={nombreEjeY} fill="#ea580c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-3 border-t border-[#e5e5e5] text-[11px] text-[#737373]">
        <strong className="text-[#0a0a0a]">Regla de Linealidad:</strong> La esperanza económica E(aX+b) es exactamente igual a reemplazar la esperanza teórica: a · E(X) + b.
      </div>
    </div>
  );
}

