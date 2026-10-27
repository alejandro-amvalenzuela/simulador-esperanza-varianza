/**
 * Motor de Simulación Monte Carlo para Modelo Binomial
 * 
 * Concepto Pedagógico Fundamental:
 * Cada variable binomial X representa la suma de n variables indicadoras de Bernoulli independientes:
 * X = sum_{i=1}^n B_i,  donde B_i ~ Bernoulli(p) con P(B_i = 1) = p y P(B_i = 0) = 1 - p.
 * 
 * Por exigencia pedagógica, cada repetición simula los n ensayos de Bernoulli uno por uno
 * utilizando un generador pseudoaleatorio reproducible (Mulberry32).
 */

/**
 * Generador pseudoaleatorio Mulberry32 (32-bit PRNG rápido y de alta calidad determinista)
 * Retorna una función que entrega números pseudoaleatorios en el intervalo [0, 1) dado un seed entero.
 */
export function crearGeneradorMulberry32(seed: number): () => number {
  let s = Math.trunc(seed);
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simula un único ensayo de Bernoulli con probabilidad p
 * Retorna 1 si u < p (éxito), o 0 si u >= p (fracaso)
 */
export function simularBernoulli(p: number, rng: () => number): number {
  return rng() < p ? 1 : 0;
}

/**
 * Simula una corrida completa de una variable Binomial sumando n ensayos individuales de Bernoulli:
 * X = sum_{i=1}^n B_i
 */
export function simularBinomialIndividual(n: number, p: number, rng: () => number): number {
  let exitos = 0;
  for (let i = 0; i < n; i++) {
    exitos += simularBernoulli(p, rng);
  }
  return exitos;
}

export interface ResultadoSimulacion {
  n: number;
  p: number;
  numCorridas: number;
  semilla: number;
  muestras: number[];
  frecuencias: { [exitos: number]: number };
  frecuenciasRelativas: { [exitos: number]: number };
  mediaMuestral: number;
  varianzaMuestral: number; // Con divisor N - 1 (cuasivarianza muestral insesgada)
  desviacionMuestral: number;
  minimo: number;
  maximo: number;
  esperanzaTeorica: number;
  varianzaTeorica: number;
  desviacionTeorica: number;
  errorAbsolutoMedia: number;
  errorRelativoMedia: number; // Porcentaje |media - E| / E * 100
  errorAbsolutoVarianza: number;
  errorRelativoVarianza: number; // Porcentaje |var - Var| / Var * 100
  mediasAcumuladas: { corrida: number; mediaAcumulada: number; esperanzaTeorica: number }[];
}

/**
 * Ejecuta N repeticiones de la simulación Binomial
 */
export function ejecutarSimulacion(
  n: number,
  p: number,
  numCorridas: number,
  semilla: number = 42
): ResultadoSimulacion {
  if (n <= 0) throw new Error("n debe ser mayor que 0");
  if (p < 0 || p > 1) throw new Error("p debe estar en el intervalo [0, 1]");
  if (numCorridas <= 1) throw new Error("numCorridas debe ser mayor que 1 para calcular varianza muestral");

  const rng = crearGeneradorMulberry32(semilla);
  const muestras: number[] = new Array(numCorridas);
  const frecuencias: { [k: number]: number } = {};

  let suma = 0;
  let min = Infinity;
  let max = -Infinity;

  // Seguimiento de medias acumuladas para ilustrar la Ley de los Grandes Números
  // Para no saturar memoria en simulaciones grandes (p. ej. 10.000), guardamos hasta 200 puntos equiespaciados
  const pasoMuestreo = Math.max(1, Math.floor(numCorridas / 200));
  const mediasAcumuladas: { corrida: number; mediaAcumulada: number; esperanzaTeorica: number }[] = [];
  const esperanzaTeorica = n * p;
  const varianzaTeorica = n * p * (1 - p);
  const desviacionTeorica = Math.sqrt(varianzaTeorica);

  for (let i = 0; i < numCorridas; i++) {
    const x = simularBinomialIndividual(n, p, rng);
    muestras[i] = x;
    suma += x;
    frecuencias[x] = (frecuencias[x] || 0) + 1;

    if (x < min) min = x;
    if (x > max) max = x;

    const corridaActual = i + 1;
    if (corridaActual % pasoMuestreo === 0 || corridaActual === numCorridas) {
      mediasAcumuladas.push({
        corrida: corridaActual,
        mediaAcumulada: suma / corridaActual,
        esperanzaTeorica
      });
    }
  }

  // 1. Media Muestral (x_barra = (1 / N) * sum(x_i))
  const mediaMuestral = suma / numCorridas;

  // 2. Varianza Muestral Insesgada (s^2 = (1 / (N - 1)) * sum((x_i - x_barra)^2))
  let sumaCuadradosDiferencias = 0;
  for (let i = 0; i < numCorridas; i++) {
    const diff = muestras[i] - mediaMuestral;
    sumaCuadradosDiferencias += diff * diff;
  }
  const varianzaMuestral = sumaCuadradosDiferencias / (numCorridas - 1);
  const desviacionMuestral = Math.sqrt(varianzaMuestral);

  // Frecuencias relativas
  const frecuenciasRelativas: { [k: number]: number } = {};
  for (const k in frecuencias) {
    frecuenciasRelativas[k] = frecuencias[k] / numCorridas;
  }

  // Errores frente a la teoría
  const errorAbsolutoMedia = Math.abs(mediaMuestral - esperanzaTeorica);
  const errorRelativoMedia = esperanzaTeorica !== 0 ? (errorAbsolutoMedia / esperanzaTeorica) * 100 : 0;

  const errorAbsolutoVarianza = Math.abs(varianzaMuestral - varianzaTeorica);
  const errorRelativoVarianza = varianzaTeorica !== 0 ? (errorAbsolutoVarianza / varianzaTeorica) * 100 : 0;

  return {
    n,
    p,
    numCorridas,
    semilla,
    muestras,
    frecuencias,
    frecuenciasRelativas,
    mediaMuestral,
    varianzaMuestral,
    desviacionMuestral,
    minimo: min,
    maximo: max,
    esperanzaTeorica,
    varianzaTeorica,
    desviacionTeorica,
    errorAbsolutoMedia,
    errorRelativoMedia,
    errorAbsolutoVarianza,
    errorRelativoVarianza,
    mediasAcumuladas
  };
}
