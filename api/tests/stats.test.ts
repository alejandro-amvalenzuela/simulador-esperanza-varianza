import { describe, it, expect } from "vitest";
import {
  calcularEsperanzaTeorica,
  calcularVarianzaTeorica,
  calcularDesviacionTeorica,
  probabilidadBinomial,
  tablaDistribucionBinomial
} from "../src/stats/binomial.js";
import { ejecutarSimulacion } from "../src/stats/simulation.js";
import {
  calcularTransformacionLineal,
  calcularSumaFabrica,
  calcularSumaSemanaRestaurante
} from "../src/stats/properties.js";
import { calcularDistribucionEmpirica } from "../src/stats/empirical.js";

const EPSILON = 1e-9;
// Para números de orden 10^7, la precisión de coma flotante de 64 bits (53 bits significativos)
// tiene una unidad en el último lugar (ULP) de ~7.4e-9. Usamos tolerancia relativa para números grandes.
function sonCasiIguales(a: number, b: number, eps: number = 1e-7): boolean {
  if (Math.abs(a - b) < 1e-9) return true;
  return Math.abs(a - b) / Math.max(Math.abs(a), Math.abs(b)) < 1e-12;
}

describe("Validación de Requerimientos Estadísticos - Casos Teóricos", () => {
  it("Caso 1: Fábrica (n = 20, p = 0.05)", () => {
    const n = 20;
    const p = 0.05;

    // E(X) = 1; Var(X) = 0.95
    const eX = calcularEsperanzaTeorica(n, p);
    const varX = calcularVarianzaTeorica(n, p);
    expect(Math.abs(eX - 1)).toBeLessThan(EPSILON);
    expect(Math.abs(varX - 0.95)).toBeLessThan(EPSILON);

    // Costo: C = 3500*X + 12000
    // E(C) = 3500*1 + 12000 = 15500
    // Var(C) = (3500)^2 * 0.95 = 12250000 * 0.95 = 11637500
    const transf = calcularTransformacionLineal(3500, 12000, eX, varX, []);
    expect(Math.abs(transf.esperanzaTeorica - 15500)).toBeLessThan(EPSILON);
    expect(Math.abs(transf.varianzaTeorica - 11637500)).toBeLessThan(EPSILON);

    // Propiedad de suma independiente: Línea A (20, 0.05) y Línea B (20, 0.08)
    // E(A+B) = 1 + 1.6 = 2.6
    // Var(A+B) = 0.95 + 20*0.08*0.92 = 0.95 + 1.472 = 2.422
    const suma = calcularSumaFabrica(20, 0.05, 20, 0.08);
    expect(Math.abs(suma.esperanzaTeorica - 2.6)).toBeLessThan(EPSILON);
    expect(Math.abs(suma.varianzaTeorica - 2.422)).toBeLessThan(EPSILON);
  });

  it("Caso 2: Ventas (n = 30, p = 0.30)", () => {
    const n = 30;
    const p = 0.30;

    // E(X) = 9; Var(X) = 6.3
    const eX = calcularEsperanzaTeorica(n, p);
    const varX = calcularVarianzaTeorica(n, p);
    expect(Math.abs(eX - 9)).toBeLessThan(EPSILON);
    expect(Math.abs(varX - 6.3)).toBeLessThan(EPSILON);

    // Ganancia: Y = 2000*X
    // E(Y) = 2000 * 9 = 18000
    // Var(Y) = (2000)^2 * 6.3 = 4000000 * 6.3 = 25200000
    const ganancia = calcularTransformacionLineal(2000, 0, eX, varX, []);
    expect(Math.abs(ganancia.esperanzaTeorica - 18000)).toBeLessThan(EPSILON);
    expect(Math.abs(ganancia.varianzaTeorica - 25200000)).toBeLessThan(EPSILON);

    // Ganancia neta: N = 2000*X - 5000
    // E(N) = 18000 - 5000 = 13000
    const neta = calcularTransformacionLineal(2000, -5000, eX, varX, []);
    expect(Math.abs(neta.esperanzaTeorica - 13000)).toBeLessThan(EPSILON);
  });

  it("Caso 3: Restaurante (n = 40, p = 0.08)", () => {
    const n = 40;
    const p = 0.08;

    // E(X) = 3.2; Var(X) = 40 * 0.08 * 0.92 = 2.944
    const eX = calcularEsperanzaTeorica(n, p);
    const varX = calcularVarianzaTeorica(n, p);
    expect(Math.abs(eX - 3.2)).toBeLessThan(EPSILON);
    expect(Math.abs(varX - 2.944)).toBeLessThan(EPSILON);

    // Pérdida económica: L = 4500*X
    // E(L) = 4500 * 3.2 = 14400
    // Var(L) = (4500)^2 * 2.944 = 20250000 * 2.944 = 59616000
    const perdida = calcularTransformacionLineal(4500, 0, eX, varX, []);
    expect(sonCasiIguales(perdida.esperanzaTeorica, 14400)).toBe(true);
    expect(sonCasiIguales(perdida.varianzaTeorica, 59616000)).toBe(true);

    // Semana: 7 días independientes
    // E = 7 * 3.2 = 22.4
    // Var = 7 * 2.944 = 20.608
    const semana = calcularSumaSemanaRestaurante(40, 0.08, 7);
    expect(Math.abs(semana.esperanzaTeorica - 22.4)).toBeLessThan(EPSILON);
    expect(Math.abs(semana.varianzaTeorica - 20.608)).toBeLessThan(EPSILON);
  });
});

describe("Estabilidad Numérica de la Distribución Binomial", () => {
  it("La suma de probabilidades en todo el soporte [0, n] es exactamente 1", () => {
    const n = 50;
    const p = 0.12;
    const tabla = tablaDistribucionBinomial(n, p);
    const sumaProb = tabla.reduce((acc, row) => acc + row.probabilidad, 0);
    expect(Math.abs(sumaProb - 1.0)).toBeLessThan(1e-7);
  });

  it("Soporta n grandes sin desbordamiento aritmético", () => {
    const prob = probabilidadBinomial(100, 0.05, 5);
    expect(prob).toBeGreaterThan(0);
    expect(prob).toBeLessThan(1);
    expect(Number.isFinite(prob)).toBe(true);
  });
});

describe("Prueba de Convergencia Monte Carlo (10.000 repeticiones)", () => {
  it("Con 10.000 simulaciones y semilla fija, el error relativo de la media es < 3% y el de la varianza es < 8%", () => {
    // Semilla fija 123456
    const res = ejecutarSimulacion(20, 0.05, 10000, 123456);

    // Requisito: media muestral a menos de 3% de la esperanza
    expect(res.errorRelativoMedia).toBeLessThan(3.0);

    // Requisito: varianza muestral a menos de 8% de la varianza teórica
    expect(res.errorRelativoVarianza).toBeLessThan(8.0);
  });
});

describe("Cálculo Empírico de Frecuencias y Momentos", () => {
  it("Calcula correctamente E_emp(X) = sum(x*p(x)) y Var_emp(X) = E(X^2) - [E(X)]^2", () => {
    const registros = [
      { exitos: 1, intentos: 20 },
      { exitos: 2, intentos: 20 },
      { exitos: 1, intentos: 20 },
      { exitos: 0, intentos: 20 }
    ];
    // x = 0 (1/4), x = 1 (2/4 = 0.5), x = 2 (1/4 = 0.25)
    // E = 0*0.25 + 1*0.5 + 2*0.25 = 1.0
    // E(X^2) = 0*0.25 + 1*0.5 + 4*0.25 = 1.5
    // Var = 1.5 - 1.0^2 = 0.5
    const res = calcularDistribucionEmpirica(registros);
    expect(res.esperanzaEmpirica).toBeCloseTo(1.0, 5);
    expect(res.segundoMomentoEmpirico).toBeCloseTo(1.5, 5);
    expect(res.varianzaEmpirica).toBeCloseTo(0.5, 5);
    expect(res.pEstimada).toBeCloseTo(4 / 80, 5); // 0.05
  });
});
