/**
 * Utilidades matemáticas y estadísticas para distribución Binomial
 * 
 * Modelo: X ~ Binomial(n, p)
 * 
 * Esperanza teórica: E(X) = n * p
 * Varianza teórica: Var(X) = n * p * (1 - p)
 * Desviación estándar: sigma = sqrt(Var(X))
 */

/**
 * Logaritmo de la función Gamma ln(Gamma(z)) usando la aproximación de Lanczos.
 * Permite calcular log(k!) = ln(Gamma(k + 1)) sin desbordar con valores grandes de k.
 */
export function logGamma(z: number): number {
  const p = [
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];

  if (z < 0.5) {
    // Fórmula de reflexión: Gamma(1-z)*Gamma(z) = pi / sin(pi*z)
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  }

  z -= 1;
  let x = 0.99999999999980993;
  for (let i = 0; i < p.length; i++) {
    x += p[i] / (z + i + 1);
  }

  const t = z + p.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

/**
 * Logaritmo del factorial ln(n!) = ln(Gamma(n + 1))
 */
export function logFactorial(n: number): number {
  if (n < 0) throw new Error("Factorial no definido para números negativos");
  if (n === 0 || n === 1) return 0;
  return logGamma(n + 1);
}

/**
 * Logaritmo del coeficiente binomial ln(n choose k)
 * ln(C(n, k)) = ln(n!) - ln(k!) - ln((n - k)!)
 */
export function logBinomialCoefficient(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  if (k === 0 || k === n) return 0;
  return logFactorial(n) - logFactorial(k) - logFactorial(n - k);
}

/**
 * Función de probabilidad puntual para X ~ Binomial(n, p):
 * P(X = k) = C(n, k) * p^k * (1 - p)^(n - k)
 * 
 * Implementada de forma numéricamente estable calculando en escala logarítmica:
 * ln(P(X = k)) = ln(C(n, k)) + k*ln(p) + (n - k)*ln(1 - p)
 * P(X = k) = exp(ln(P(X = k)))
 */
export function probabilidadBinomial(n: number, p: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;

  const logProb = logBinomialCoefficient(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
  return Math.exp(logProb);
}

/**
 * Genera la tabla completa de distribución de probabilidad para k = 0, 1, ..., n
 */
export interface FilaProbabilidad {
  k: number;
  probabilidad: number;
  acumulada: number;
  formula: string;
}

export function tablaDistribucionBinomial(n: number, p: number): FilaProbabilidad[] {
  const tabla: FilaProbabilidad[] = [];
  let acumulada = 0;

  for (let k = 0; k <= n; k++) {
    const prob = probabilidadBinomial(n, p, k);
    acumulada += prob;
    tabla.push({
      k,
      probabilidad: prob,
      acumulada: Math.min(1, acumulada),
      formula: `P(X = ${k}) = C(${n}, ${k}) · (${p})^${k} · (1 - ${p})^${n - k}`
    });
  }

  return tabla;
}

/**
 * Cálculo de la Esperanza teórica de una Binomial: E(X) = n * p
 */
export function calcularEsperanzaTeorica(n: number, p: number): number {
  return n * p;
}

/**
 * Cálculo de la Varianza teórica de una Binomial: Var(X) = n * p * (1 - p)
 */
export function calcularVarianzaTeorica(n: number, p: number): number {
  return n * p * (1 - p);
}

/**
 * Cálculo de la Desviación Estándar teórica: sigma = sqrt(Var(X))
 */
export function calcularDesviacionTeorica(n: number, p: number): number {
  return Math.sqrt(calcularVarianzaTeorica(n, p));
}
