/**
 * Propiedades Teóricas y Simuladas de la Esperanza y la Varianza
 * 
 * 1. Linealidad de la Esperanza:
 *    E(aX + b) = a * E(X) + b
 * 
 * 2. Varianza de una Transformación Lineal:
 *    Var(aX + b) = a^2 * Var(X)  (La constante b no afecta la dispersión)
 *    Desviacion(aX + b) = |a| * Desviacion(X)
 * 
 * 3. Suma de Variables Aleatorias Independientes:
 *    E(X + Y) = E(X) + E(Y)
 *    Var(X + Y) = Var(X) + Var(Y)  (por independencia, Cov(X, Y) = 0)
 * 
 * 4. Suma de k variables idénticamente distribuidas e independientes:
 *    E(sum_{i=1}^k X_i) = k * E(X)
 *    Var(sum_{i=1}^k X_i) = k * Var(X)
 */

export interface PropiedadTransformacionLineal {
  a: number;
  b: number;
  formulaEsperanza: string;
  esperanzaTeorica: number;
  esperanzaSimulada: number;
  errorEsperanza: number;
  formulaVarianza: string;
  varianzaTeorica: number;
  varianzaSimulada: number;
  errorVarianza: number;
  desviacionTeorica: number;
  desviacionSimulada: number;
}

export function calcularTransformacionLineal(
  a: number,
  b: number,
  esperanzaTeoricaX: number,
  varianzaTeoricaX: number,
  muestrasX: number[]
): PropiedadTransformacionLineal {
  // Teórico
  const esperanzaTeorica = a * esperanzaTeoricaX + b;
  const varianzaTeorica = a * a * varianzaTeoricaX;
  const desviacionTeorica = Math.abs(a) * Math.sqrt(varianzaTeoricaX);

  // Simulado sobre las muestras transformadas Y_i = a * X_i + b
  const nMuestras = muestrasX.length;
  let suma = 0;
  const muestrasY = new Array(nMuestras);
  for (let i = 0; i < nMuestras; i++) {
    const y = a * muestrasX[i] + b;
    muestrasY[i] = y;
    suma += y;
  }
  const esperanzaSimulada = suma / nMuestras;

  let sumaCuadDiff = 0;
  for (let i = 0; i < nMuestras; i++) {
    const diff = muestrasY[i] - esperanzaSimulada;
    sumaCuadDiff += diff * diff;
  }
  const varianzaSimulada = nMuestras > 1 ? sumaCuadDiff / (nMuestras - 1) : 0;
  const desviacionSimulada = Math.sqrt(varianzaSimulada);

  return {
    a,
    b,
    formulaEsperanza: `E(${a}X + ${b}) = ${a} · E(X) + ${b}`,
    esperanzaTeorica,
    esperanzaSimulada,
    errorEsperanza: Math.abs(esperanzaSimulada - esperanzaTeorica),
    formulaVarianza: `Var(${a}X + ${b}) = (${a})² · Var(X) = ${a * a} · Var(X)`,
    varianzaTeorica,
    varianzaSimulada,
    errorVarianza: Math.abs(varianzaSimulada - varianzaTeorica),
    desviacionTeorica,
    desviacionSimulada
  };
}

export interface PropiedadSumaIndependiente {
  descripcion: string;
  esperanzaTeorica: number;
  varianzaTeorica: number;
  desviacionTeorica: number;
  formulaEsperanza: string;
  formulaVarianza: string;
  esperanzaSimulada?: number;
  varianzaSimulada?: number;
}

/**
 * Caso 1: Fábrica con dos líneas A y B independientes
 * A ~ Binomial(20, 0.05)
 * B ~ Binomial(20, 0.08)
 */
export function calcularSumaFabrica(
  nA: number = 20,
  pA: number = 0.05,
  nB: number = 20,
  pB: number = 0.08,
  muestrasA?: number[],
  muestrasB?: number[]
): PropiedadSumaIndependiente {
  const eA = Number((nA * pA).toFixed(3));
  const varA = Number((nA * pA * (1 - pA)).toFixed(4));

  const eB = Number((nB * pB).toFixed(3));
  const varB = Number((nB * pB * (1 - pB)).toFixed(4));

  const esperanzaTeorica = Number((eA + eB).toFixed(3));
  const varianzaTeorica = Number((varA + varB).toFixed(4));
  const desviacionTeorica = Math.sqrt(varianzaTeorica);

  let esperanzaSimulada: number | undefined;
  let varianzaSimulada: number | undefined;

  if (muestrasA && muestrasB && muestrasA.length === muestrasB.length) {
    const N = muestrasA.length;
    let suma = 0;
    const sumaAB = new Array(N);
    for (let i = 0; i < N; i++) {
      const val = muestrasA[i] + muestrasB[i];
      sumaAB[i] = val;
      suma += val;
    }
    esperanzaSimulada = suma / N;

    let sumaCuadDiff = 0;
    for (let i = 0; i < N; i++) {
      const diff = sumaAB[i] - esperanzaSimulada;
      sumaCuadDiff += diff * diff;
    }
    varianzaSimulada = N > 1 ? sumaCuadDiff / (N - 1) : 0;
  }

  return {
    descripcion: "Suma de dos líneas de producción independientes (Línea A + Línea B)",
    esperanzaTeorica,
    varianzaTeorica,
    desviacionTeorica,
    formulaEsperanza: `E(A + B) = E(A) + E(B) = ${eA} + ${eB} = ${esperanzaTeorica}`,
    formulaVarianza: `Var(A + B) = Var(A) + Var(B) = ${varA} + ${varB} = ${varianzaTeorica}`,
    esperanzaSimulada,
    varianzaSimulada
  };
}

/**
 * Caso 3: Restaurante - Suma para una semana de k = 7 días independientes
 * S_7 = sum_{i=1}^7 X_i
 */
export function calcularSumaSemanaRestaurante(
  nDia: number = 40,
  pDia: number = 0.08,
  dias: number = 7
): PropiedadSumaIndependiente {
  const eDia = Number((nDia * pDia).toFixed(3));
  const varDia = Number((nDia * pDia * (1 - pDia)).toFixed(4));

  const esperanzaTeorica = Number((dias * eDia).toFixed(3));
  const varianzaTeorica = Number((dias * varDia).toFixed(4));
  const desviacionTeorica = Math.sqrt(varianzaTeorica);

  return {
    descripcion: `Suma semanal acumulada para ${dias} días independientes`,
    esperanzaTeorica,
    varianzaTeorica,
    desviacionTeorica,
    formulaEsperanza: `E(S_${dias}) = ${dias} · E(X_día) = ${dias} · ${eDia} = ${esperanzaTeorica}`,
    formulaVarianza: `Var(S_${dias}) = ${dias} · Var(X_día) = ${dias} · ${varDia} = ${varianzaTeorica}`
  };
}
