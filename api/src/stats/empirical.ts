/**
 * Análisis Empírico a partir de Tablas de Frecuencias Históricas
 * 
 * Fórmulas fundamentales para variables discretas empíricas:
 * Probabilidad observada: p_emp(x) = f(x) / N_total
 * 
 * Esperanza Empírica:
 * E_emp(X) = sum_x [ x * p_emp(x) ]
 * 
 * Segundo Momento:
 * E_emp(X^2) = sum_x [ x^2 * p_emp(x) ]
 * 
 * Varianza Empírica (Fórmula de Steiner):
 * Var_emp(X) = E_emp(X^2) - [E_emp(X)]^2
 * 
 * Estimación del parámetro p de la binomial:
 * p_estimada = Total de Éxitos / Total de Intentos
 */

export interface FilaFrecuenciaEmpirica {
  x: number;
  frecuenciaAbsoluta: number;
  probabilidadEmpirica: number;
  xPorProb: number;
  xCuadradoPorProb: number;
}

export interface ResultadoEmpirico {
  totalRegistros: number;
  totalIntentos: number;
  totalExitos: number;
  pEstimada: number;
  tablaFrecuencias: FilaFrecuenciaEmpirica[];
  esperanzaEmpirica: number;
  segundoMomentoEmpirico: number;
  varianzaEmpirica: number;
  desviacionEmpirica: number;
  formulaEsperanza: string;
  formulaVarianza: string;
}

export function calcularDistribucionEmpirica(
  registros: { exitos: number; intentos: number }[]
): ResultadoEmpirico {
  if (registros.length === 0) {
    return {
      totalRegistros: 0,
      totalIntentos: 0,
      totalExitos: 0,
      pEstimada: 0,
      tablaFrecuencias: [],
      esperanzaEmpirica: 0,
      segundoMomentoEmpirico: 0,
      varianzaEmpirica: 0,
      desviacionEmpirica: 0,
      formulaEsperanza: "E(X) = 0",
      formulaVarianza: "Var(X) = 0"
    };
  }

  let totalIntentos = 0;
  let totalExitos = 0;
  const conteoFrecuencias: { [x: number]: number } = {};

  for (const reg of registros) {
    totalIntentos += reg.intentos;
    totalExitos += reg.exitos;
    conteoFrecuencias[reg.exitos] = (conteoFrecuencias[reg.exitos] || 0) + 1;
  }

  const totalRegistros = registros.length;
  const pEstimada = totalIntentos > 0 ? totalExitos / totalIntentos : 0;

  // Valores únicos de x ordenados
  const valoresX = Object.keys(conteoFrecuencias)
    .map(Number)
    .sort((a, b) => a - b);

  let esperanzaEmpirica = 0;
  let segundoMomentoEmpirico = 0;
  const tablaFrecuencias: FilaFrecuenciaEmpirica[] = [];

  for (const x of valoresX) {
    const fAbs = conteoFrecuencias[x];
    const pEmp = fAbs / totalRegistros;
    const xP = x * pEmp;
    const x2P = x * x * pEmp;

    esperanzaEmpirica += xP;
    segundoMomentoEmpirico += x2P;

    tablaFrecuencias.push({
      x,
      frecuenciaAbsoluta: fAbs,
      probabilidadEmpirica: pEmp,
      xPorProb: xP,
      xCuadradoPorProb: x2P
    });
  }

  // Varianza: Var(X) = E(X^2) - [E(X)]^2
  const varianzaEmpirica = Math.max(0, segundoMomentoEmpirico - esperanzaEmpirica * esperanzaEmpirica);
  const desviacionEmpirica = Math.sqrt(varianzaEmpirica);

  const formulaEsperanza = `E(X) = \\sum x \\cdot p(x) = ${esperanzaEmpirica.toFixed(4)}`;
  const formulaVarianza = `Var(X) = E(X^2) - [E(X)]^2 = ${segundoMomentoEmpirico.toFixed(4)} - (${esperanzaEmpirica.toFixed(4)})^2 = ${varianzaEmpirica.toFixed(4)}`;

  return {
    totalRegistros,
    totalIntentos,
    totalExitos,
    pEstimada,
    tablaFrecuencias,
    esperanzaEmpirica,
    segundoMomentoEmpirico,
    varianzaEmpirica,
    desviacionEmpirica,
    formulaEsperanza,
    formulaVarianza
  };
}
