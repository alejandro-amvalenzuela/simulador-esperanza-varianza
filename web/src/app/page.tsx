import Link from "next/link";
import { Factory, ShoppingCart, UtensilsCrossed, ArrowRight, BookOpen, BarChart3, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Observatorio de Probabilidad Discreta | UCM",
  description:
    "Simulador interactivo de Esperanza, Media Muestral y Varianza para variables aleatorias discretas con modelo Binomial en 3 casos reales."
};

export default function HomePage() {
  const casos = [
    {
      slug: "fabrica",
      nombre: "Control de Calidad en Fábrica",
      subtitulo: "Lotes de producción y reproceso",
      n: 20,
      p: "5%",
      formula: "C = 3.500·X + 12.000",
      propiedad: "Suma de Línea A + Línea B independientes",
      icon: Factory
    },
    {
      slug: "ventas",
      nombre: "Ventas Diarias de un Negocio",
      subtitulo: "Conversión de clientes en tienda retail",
      n: 30,
      p: "30%",
      formula: "N = 2.000·X - 5.000",
      propiedad: "Distribución Empírica vs Modelo Teórico",
      icon: ShoppingCart
    },
    {
      slug: "restaurante",
      nombre: "Pedidos en Restaurante",
      subtitulo: "Pedidos anticipados no retirados",
      n: 40,
      p: "8%",
      formula: "L = 4.500·X",
      propiedad: "Suma semanal (7 días) & Sensibilidad",
      icon: UtensilsCrossed
    }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="design-card p-8 md:p-12 relative overflow-hidden bg-white">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="badge-solid">
            <span className="w-1.5 h-1.5 rounded-full bg-[#fafafa]"></span>
            Estadística Teórica & Simulación
          </span>
          <span className="badge-outline">UCM · 2026</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-semibold text-[#0a0a0a] tracking-tight max-w-4xl leading-[1.12]">
          Simulador de Esperanza, Media Muestral y Varianza
        </h1>

        <p className="mt-4 text-base md:text-lg text-[#737373] max-w-2xl leading-relaxed">
          Plataforma analítica para la experimentación estocástica. Analiza la convergencia de la media muestral mediante la Ley de los Grandes Números, contrasta distribuciones teóricas frente a frecuencias empíricas y valida transformaciones lineales.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-8">
          <Link href="/fabrica" className="btn-primary">
            <span>Explorar Módulo Fábrica</span>
            <ArrowRight size={15} />
          </Link>
          <Link href="/teoria" className="btn-outline">
            <BookOpen size={15} />
            <span>Fundamentos Teóricos</span>
          </Link>
          <Link href="/comparativo" className="btn-ghost">
            <BarChart3 size={15} />
            <span>Matriz Comparativa</span>
          </Link>
        </div>
      </section>

      {/* Los 3 Módulos de Caso */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-2xl font-semibold text-[#0a0a0a] tracking-tight">
              Casos de Aplicación Práctica
            </h2>
            <p className="text-sm text-[#737373]">
              Tres contextos reales modelados rigurosamente con distribuciones binomiales.
            </p>
          </div>
          <span className="badge-soft hidden sm:inline-flex">3 Escenarios B(n, p)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {casos.map((caso) => {
            const Icon = caso.icon;
            return (
              <div
                key={caso.slug}
                className="design-card flex flex-col justify-between hover:border-[#171717] transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-10 h-10 rounded-[14px] bg-[#f5f5f5] flex items-center justify-center text-[#0a0a0a] border border-[#e5e5e5]">
                      <Icon size={18} />
                    </span>
                    <span className="badge-soft font-mono text-[11px]">
                      n={caso.n}, p={caso.p}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-[#0a0a0a] mb-1">
                    {caso.nombre}
                  </h3>
                  <p className="text-xs text-[#737373] mb-4">
                    {caso.subtitulo}
                  </p>

                  <div className="space-y-2.5 bg-[#fafafa] p-3.5 rounded-[18px] border border-[#e5e5e5] text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373] block">
                        Transformación Económica
                      </span>
                      <span className="font-mono font-medium text-[#0a0a0a]">
                        {caso.formula}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-[#e5e5e5]/80">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-[#737373] block">
                        Propiedad Especial
                      </span>
                      <span className="text-[11px] text-[#171717]">
                        {caso.propiedad}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4">
                  <Link
                    href={`/${caso.slug}`}
                    className="btn-primary w-full text-xs !py-2.5"
                  >
                    <span>Ingresar al Simulador</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Características del Simulador */}
      <section className="design-card p-6 md:p-8 space-y-6 bg-white">
        <div>
          <span className="badge-soft mb-2">Capacidades del Sistema</span>
          <h3 className="text-xl font-semibold text-[#0a0a0a]">
            Herramientas para Defensa y Justificación Estadística
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="design-card-subtle space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0a0a0a]">
              <CheckCircle2 size={16} className="text-[#0a0a0a]" />
              <span>Simulación Monte Carlo</span>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Generador pseudoaleatorio determinista (Mulberry32) con semilla reproducible para ensayar entre 10 y 10.000 experimentos de Bernoulli independientes.
            </p>
          </div>

          <div className="design-card-subtle space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0a0a0a]">
              <CheckCircle2 size={16} className="text-[#0a0a0a]" />
              <span>Convergencia Asintótica</span>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Verificación visual de la Ley Débil de los Grandes Números (X̄_N &rarr; E(X)) y cálculo del error relativo con tolerancia de validación &lt; 3%.
            </p>
          </div>

          <div className="design-card-subtle space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0a0a0a]">
              <CheckCircle2 size={16} className="text-[#0a0a0a]" />
              <span>Datos Empíricos & CSV</span>
            </div>
            <p className="text-xs text-[#737373] leading-relaxed">
              Gestión histórica completa: tabla paginada, importación/exportación de archivos CSV e integración de frecuencias relativas empíricas en los gráficos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
