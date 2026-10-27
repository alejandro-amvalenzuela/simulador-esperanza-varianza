import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Fundamentos Teóricos | Simulador de Probabilidad Discreta",
  description:
    "Definiciones formales de variable aleatoria discreta, esperanza matemática, varianza, distribución binomial y propiedades analíticas para la defensa universitaria."
};

export default function TeoriaPage() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      {/* Cabecera */}
      <section className="border-b border-[#e5e5e5] pb-6">
        <span className="badge-soft mb-3">
          Marco Teórico y Formalismo Matemático
        </span>
        <h1 className="text-3xl md:text-4xl font-semibold text-[#0a0a0a] tracking-tight mt-1">
          Variables Aleatorias Discretas y Modelo Binomial
        </h1>
        <p className="mt-3 text-sm md:text-base text-[#737373] leading-relaxed">
          Guía conceptual rigurosa para la defensa ante el jurado universitario. Explica las diferencias entre esperanza y media muestral, la formulación matemática de la varianza y las propiedades de transformaciones lineales y sumas independientes.
        </p>
      </section>

      {/* 1. Variable Aleatoria Discreta */}
      <section className="design-card space-y-4">
        <h2 className="text-xl font-semibold text-[#0a0a0a]">1. Variable Aleatoria Discreta</h2>
        <p className="text-sm text-[#737373] leading-relaxed">
          Una <strong className="text-[#0a0a0a]">variable aleatoria discreta</strong> <em>X</em> es una función medible que asigna a cada elemento del espacio muestral &Omega; un valor perteneciente a un conjunto contable (finito o numerable) de números reales:
        </p>
        <div className="p-3 bg-[#f5f5f5] rounded-[18px] font-mono text-xs text-[#0a0a0a] border border-[#e5e5e5]">
          {"X: \u03A9 \u2192 {x\u2081, x\u2082, ..., x\u2096} \u2282 \u211D"}
        </div>
        <p className="text-sm text-[#737373]">
          Su distribución está completamente caracterizada por su <strong className="text-[#0a0a0a]">función de masa de probabilidad</strong> (FMP) <em>p(x) = P(X = x)</em>, la cual debe satisfacer los axiomas de Kolmogorov:
        </p>
        <ul className="list-disc pl-5 text-xs text-[#737373] space-y-1 font-mono">
          <li>{"p(x\u1D62) \u2265 0  \u2200 i"}</li>
          <li>{"\u2211 p(x\u1D62) = 1"}</li>
        </ul>
      </section>

      {/* 2. Esperanza vs Media Muestral */}
      <section className="design-card space-y-4">
        <h2 className="text-xl font-semibold text-[#0a0a0a]">2. Esperanza Matemática vs Media Muestral</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          <div className="p-5 sm:p-6 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] space-y-3">
            <span className="badge-outline text-[11px]">Poblacional / Teórico</span>
            <h4 className="text-base font-semibold text-[#0a0a0a]">Esperanza E(X)</h4>
            <p className="text-xs text-[#737373] leading-relaxed">
              Es una constante matemática teórica fija que representa el valor medio ponderado por las probabilidades:
            </p>
            <div className="p-3.5 bg-[#ffffff] rounded-[12px] font-mono text-xs text-[#0a0a0a] border border-[#e5e5e5] shadow-2xs">
              {"E(X) = \u2211 [ x\u1D62 \u00B7 P(X = x\u1D62) ]"}
            </div>
            <p className="text-[12px] text-[#737373] pt-1">
              Para una distribución Binomial B(n, p): <strong className="text-[#0a0a0a] font-mono">E(X) = n &middot; p</strong>
            </p>
          </div>

          <div className="p-5 sm:p-6 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] space-y-3">
            <span className="badge-soft text-[11px]">Muestral / Empírico</span>
            <h4 className="text-base font-semibold text-[#0a0a0a]">Media Muestral (X̄)</h4>
            <p className="text-xs text-[#737373] leading-relaxed">
              Es una variable aleatoria que depende de los datos recopilados en N observaciones:
            </p>
            <div className="p-3.5 bg-[#ffffff] rounded-[12px] font-mono text-xs text-[#0a0a0a] border border-[#e5e5e5] shadow-2xs">
              {"X\u0304 = (1 / N) \u00B7 \u2211 x\u1D62"}
            </div>
            <p className="text-[12px] text-[#737373] pt-1 leading-relaxed">
              Por la Ley Débil de los Grandes Números: cuando N &rarr; &infin;, la media muestral converge en probabilidad hacia la esperanza matemática E(X).
            </p>
          </div>
        </div>
      </section>

      {/* 3. Varianza y Desviación Estándar */}
      <section className="design-card space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0a0a0a]"></span>
          <h2 className="text-xl font-semibold text-[#0a0a0a]">3. Varianza y Desviación Estándar</h2>
        </div>
        <p className="text-sm text-[#737373]">
          La varianza cuantifica el grado de dispersión cuadrática promedio de los resultados con respecto al centro de gravedad:
        </p>
        <div className="p-3 bg-[#f5f5f5] rounded-[18px] font-mono text-xs text-[#0a0a0a] border border-[#e5e5e5]">
          {"Var(X) = E[(X - E(X))\u00B2] = E(X\u00B2) - [E(X)]\u00B2"}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5]">
            <span className="text-[#737373] block mb-1 font-sans">En Modelo Binomial:</span>
            <span className="text-[#0a0a0a] font-semibold text-sm">Var(X) = n &middot; p &middot; (1 - p)</span>
          </div>
          <div className="p-3 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5]">
            <span className="text-[#737373] block mb-1 font-sans">Desviación Estándar (σ):</span>
            <span className="text-[#0a0a0a] font-semibold text-sm">&sigma; = &radic;(n &middot; p &middot; (1 - p))</span>
          </div>
        </div>
      </section>

      {/* 4. Modelo Binomial */}
      <section className="design-card space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0a0a0a]"></span>
          <h2 className="text-xl font-semibold text-[#0a0a0a]">4. Modelo Binomial B(n, p)</h2>
        </div>
        <p className="text-sm text-[#737373]">
          El modelo binomial surge de la suma de <em>n</em> ensayos de Bernoulli independientes e idénticamente distribuidos (i.i.d.), donde cada ensayo posee probabilidad fija <em>p</em> de éxito:
        </p>
        <div className="p-3 bg-[#f5f5f5] rounded-[18px] font-mono text-xs text-[#0a0a0a] border border-[#e5e5e5]">
          {"P(X = k) = \u207F\u0043\u2096 \u00B7 p\u1D4F \u00B7 (1 - p)\u207F\u207B\u1D4F"}
        </div>
        <div className="p-3 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5] text-xs font-mono text-[#737373]">
          Donde el coeficiente binomial es: {"\u207F\u0043\u2096 = n! / (k! \u00B7 (n - k)!)"}
        </div>
      </section>

      {/* 5. Propiedades de Linealidad y Suma */}
      <section className="design-card space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0a0a0a]"></span>
          <h2 className="text-xl font-semibold text-[#0a0a0a]">5. Propiedades de Linealidad y Suma</h2>
        </div>
        <div className="space-y-3 text-xs">
          <div className="p-3.5 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5]">
            <span className="font-semibold text-sm text-[#0a0a0a] block mb-1">
              Transformación Lineal: Y = aX + b
            </span>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[#737373]">
              <li>{"E(aX + b) = a \u00B7 E(X) + b"}</li>
              <li>{"Var(aX + b) = a\u00B2 \u00B7 Var(X)"} (la constante fija &apos;b&apos; no tiene varianza)</li>
              <li>{"\u03C3(aX + b) = |a| \u00B7 \u03C3(X)"}</li>
            </ul>
          </div>

          <div className="p-3.5 bg-[#fafafa] rounded-[14px] border border-[#e5e5e5]">
            <span className="font-semibold text-sm text-[#0a0a0a] block mb-1">
              Suma de Variables Independientes: S = X + Y
            </span>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[#737373]">
              <li>{"E(X + Y) = E(X) + E(Y)"} (se cumple siempre, incluso si no son independientes)</li>
              <li>{"Var(X + Y) = Var(X) + Var(Y)"} (requiere estricta independencia: Cov(X, Y) = 0)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Enlace a Casos */}
      <div className="flex items-center justify-between pt-4">
        <Link href="/" className="btn-outline text-xs">
          <span>&larr; Volver al Inicio</span>
        </Link>
        <Link href="/fabrica" className="btn-primary text-xs">
          <span>Ir al Caso 1: Fábrica</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
