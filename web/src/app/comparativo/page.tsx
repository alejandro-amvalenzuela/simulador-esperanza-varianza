"use client";

import { useState, useEffect } from "react";
import { fetchComparativo } from "@/lib/api";
import { formatearNumero, formatearPorcentaje, formatearCLP } from "@/lib/formatters";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import Link from "next/link";
import { ArrowRight, BarChart2, Info } from "lucide-react";

export default function ComparativoPage() {
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchComparativo();
        if (res.success) setDatos(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    }
    load();
  }, []);

  const chartData = datos.map((d) => ({
    nombre: d.slug === "fabrica" ? "Fábrica" : d.slug === "ventas" ? "Ventas" : "Restaurante",
    esperanza: d.esperanza,
    varianza: d.varianza,
    desviacion: d.desviacion,
    cv: d.coeficienteVariacion
  }));

  return (
    <div className="space-y-10">
      <section className="border-b border-[#e5e5e5] pb-6">
        <span className="badge-soft mb-3">
          Análisis Comparativo Integral
        </span>
        <h1 className="text-3xl md:text-4xl font-semibold text-[#0a0a0a] tracking-tight mt-1">
          Comparativa entre los 3 Casos de Estudio
        </h1>
        <p className="mt-3 text-sm md:text-base text-[#737373] leading-relaxed max-w-3xl">
          Contraste de los momentos estadísticos (Esperanza, Varianza, Desviación Estándar) y la dispersión relativa (Coeficiente de Variación) entre Fábrica, Ventas y Restaurante.
        </p>
      </section>

      {/* Tabla Comparativa */}
      <section className="design-card space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
          <h3 className="text-lg font-semibold text-[#0a0a0a]">Matriz de Momentos Estadísticos</h3>
          <span className="badge-outline">3 Modelos Binomiales</span>
        </div>

        {cargando ? (
          <div className="py-12 text-center text-sm text-[#737373] font-mono">
            Cargando datos comparativos de la API...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-mono">
              <thead className="bg-[#f5f5f5] text-[#0a0a0a] rounded-[18px]">
                <tr>
                  <th className="py-3 px-3.5 rounded-l-[10px]">Caso de Estudio</th>
                  <th className="py-3 px-3">Parámetros (n, p)</th>
                  <th className="py-3 px-3">Esperanza E(X)</th>
                  <th className="py-3 px-3">Varianza Var(X)</th>
                  <th className="py-3 px-3">Desviación σ</th>
                  <th className="py-3 px-3">Coef. Variación (CV)</th>
                  <th className="py-3 px-3.5 rounded-r-[10px]">Acceso Rápido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5]">
                {datos.map((d) => (
                  <tr key={d.slug} className="hover:bg-[#fafafa] transition-colors">
                    <td className="py-3 px-3.5 font-semibold text-[#0a0a0a] font-sans">
                      {d.nombre}
                    </td>
                    <td className="py-3 px-3 text-[#737373]">
                      n={d.n}, p={formatearPorcentaje(d.p * 100, 1)}
                    </td>
                    <td className="py-3 px-3 font-semibold text-[#0a0a0a]">
                      {formatearNumero(d.esperanza, 3)}
                    </td>
                    <td className="py-3 px-3 text-[#737373]">
                      {formatearNumero(d.varianza, 4)}
                    </td>
                    <td className="py-3 px-3 text-[#737373]">
                      {formatearNumero(d.desviacion, 4)}
                    </td>
                    <td className="py-3 px-3 text-[#0a0a0a] font-semibold">
                      {formatearPorcentaje(d.coeficienteVariacion, 2)}
                    </td>
                    <td className="py-3 px-3.5">
                      <Link
                        href={`/${d.slug}`}
                        className="btn-outline !py-1 !px-2.5 text-[11px]"
                      >
                        <span>Abrir</span>
                        <ArrowRight size={11} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Gráficos Comparativos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="design-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="badge-soft text-[11px]">Comparación de Escala Absoluta</span>
              <BarChart2 size={16} className="text-[#737373]" />
            </div>
            <h4 className="text-base font-semibold text-[#0a0a0a]">Esperanza vs Desviación Estándar</h4>

            <div className="mt-2 mb-4 p-3 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#737373] space-y-1">
              <p className="font-semibold text-[#0a0a0a] flex items-center gap-1.5">
                <Info size={13} />
                ¿Qué compara este gráfico?
              </p>
              <p className="leading-relaxed">
                Compara el centro esperado (<strong className="text-[#0a0a0a]">Esperanza</strong>, barra negra) con la magnitud típica de fluctuación (<strong className="text-[#737373]">Desviación</strong>, barra gris) en las unidades directas de cada negocio.
              </p>
            </div>

            <div className="h-64 sm:h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: "#737373" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#737373" }} />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      formatearNumero(Number(val), 3),
                      name === "esperanza" ? "Esperanza E(X)" : "Desviación Estándar σ"
                    ]}
                    contentStyle={{ backgroundColor: "#0a0a0a", color: "#fafafa", borderRadius: "12px", border: "none", fontSize: "12px" }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }} />
                  <Bar dataKey="esperanza" name="Esperanza E(X)" fill="#0f172a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="desviacion" name="Desviación Estándar σ" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[#e5e5e5] text-[11px] text-[#737373]">
            <strong className="text-[#0a0a0a]">Conclusión:</strong> Ventas posee la mayor escala de actividad (promedio ~9 clientes), mientras Fábrica opera en escala reducida (~1 defecto por lote).
          </div>
        </div>

        <div className="design-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="badge-soft text-[11px]">Dispersión Normalizada</span>
              <span className="text-xs font-mono text-[#737373]">CV = (σ / E) · 100</span>
            </div>
            <h4 className="text-base font-semibold text-[#0a0a0a]">Coeficiente de Variación (%)</h4>

            <div className="mt-2 mb-4 p-3 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs text-[#737373] space-y-1">
              <p className="font-semibold text-[#0a0a0a] flex items-center gap-1.5">
                <Info size={13} />
                ¿Qué indica el Coeficiente de Variación?
              </p>
              <p className="leading-relaxed">
                Mide la <strong className="text-[#0a0a0a]">incertidumbre porcentual relativa</strong> eliminando la escala física. Permite comparar la volatilidad de procesos con unidades totalmente distintas.
              </p>
            </div>

            <div className="h-64 sm:h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: "#737373" }} />
                  <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: "#737373" }} />
                  <Tooltip
                    formatter={(val: any) => [formatearPorcentaje(Number(val), 2), "Incertidumbre Relativa (CV)"]}
                    contentStyle={{ backgroundColor: "#0a0a0a", color: "#fafafa", borderRadius: "12px", border: "none", fontSize: "12px" }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: "11px", paddingBottom: "10px" }} />
                  <Bar dataKey="cv" name="CV (%)" fill="#ea580c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-[#e5e5e5] text-[11px] text-[#737373]">
            <strong className="text-[#0a0a0a]">Conclusión:</strong> Fábrica tiene el mayor CV (~97%) debido a que p=5% genera eventos raros con alta incertidumbre relativa. Ventas es el proceso más predecible (~28%).
          </div>
        </div>
      </section>
    </div>
  );
}
