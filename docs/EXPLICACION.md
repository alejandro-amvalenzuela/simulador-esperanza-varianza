# Documentación de Fórmulas y Arquitectura por Módulo

Este documento detalla rigurosamente las fórmulas estadísticas, los archivos fuente y las funciones exactas donde están implementadas para facilitar la explicación y defensa ante la comisión universitaria.

---

## 1. Módulo Estadístico Central (`/api/src/stats`)

### 1.1. Distribución Binomial y Estabilidad Numérica
- **Archivo:** [`api/src/stats/binomial.ts`](file:///c:/Users/aleja/Desktop/a/UCM-Proyectos/simulador_esperanza_varianza/api/src/stats/binomial.ts)
- **Función:** `logGamma(z: number): number`
  - **Fórmula:** Aproximación de Lanczos de 8 coeficientes para $\ln \Gamma(z)$. Con fórmula de reflexión de Euler para $z < 0.5$:
    $$\Gamma(1-z)\Gamma(z) = \frac{\pi}{\sin(\pi z)}$$
- **Función:** `logBinomialCoefficient(n: number, k: number): number`
  - **Fórmula:**
    $$\ln \binom{n}{k} = \ln(n!) - \ln(k!) - \ln((n-k)!)$$
- **Función:** `probabilidadBinomial(n: number, p: number, k: number): number`
  - **Fórmula:** En escala logarítmica para prevenir overflow:
    $$P(X = k) = \exp\left( \ln \binom{n}{k} + k \ln(p) + (n-k) \ln(1-p) \right)$$
- **Funciones:** `calcularEsperanzaTeorica(n, p)` y `calcularVarianzaTeorica(n, p)`
  - **Fórmulas:**
    $$E(X) = n \cdot p$$
    $$\text{Var}(X) = n \cdot p \cdot (1 - p)$$
    $$\sigma = \sqrt{\text{Var}(X)}$$

---

### 1.2. Simulación Monte Carlo y Ensayos de Bernoulli
- **Archivo:** [`api/src/stats/simulation.ts`](file:///c:/Users/aleja/Desktop/a/UCM-Proyectos/simulador_esperanza_varianza/api/src/stats/simulation.ts)
- **Función:** `crearGeneradorMulberry32(seed: number)`
  - **Mecanismo:** Algoritmo PRNG de 32 bits determinista con operaciones bitwise `imul` para garantizar reproducibilidad exacta entre ejecuciones.
- **Función:** `simularBernoulli(p: number, rng: () => number)`
  - **Mecanismo:** Genera una variable indicadora $B_i \in \{0, 1\}$ comparando el número pseudoaleatorio $u \in [0, 1)$ con la probabilidad $p$:
    $$B_i = \begin{cases} 1 & \text{si } u < p \\ 0 & \text{si } u \ge p \end{cases}$$
- **Función:** `simularBinomialIndividual(n: number, p: number, rng: () => number)`
  - **Concepto Pedagógico:** Simula los $n$ ensayos de Bernoulli uno por uno y los suma:
    $$X = \sum_{i=1}^n B_i$$
- **Función:** `ejecutarSimulacion(n, p, numCorridas, semilla)`
  - **Media Muestral:** $\bar{X} = \frac{1}{N} \sum_{i=1}^N X_i$
  - **Cuasivarianza Muestral Insesgada (Corrección de Bessel):**
    $$s^2 = \frac{1}{N - 1} \sum_{i=1}^N (X_i - \bar{X})^2$$
  - **Error Absoluto:** $|\bar{X} - E(X)|$
  - **Error Relativo Porcentual:** $\frac{|\bar{X} - E(X)|}{E(X)} \times 100\%$

---

### 1.3. Propiedades Matemáticas de Linealidad y Suma
- **Archivo:** [`api/src/stats/properties.ts`](file:///c:/Users/aleja/Desktop/a/UCM-Proyectos/simulador_esperanza_varianza/api/src/stats/properties.ts)
- **Función:** `calcularTransformacionLineal(a, b, E_X, Var_X, muestrasX)`
  - **Esperanza:** $E(aX + b) = a \cdot E(X) + b$
  - **Varianza:** $\text{Var}(aX + b) = a^2 \cdot \text{Var}(X)$ (la constante aditiva $b$ no altera la dispersión).
- **Función:** `calcularSumaFabrica(nA, pA, nB, pB)`
  - **Esperanza:** $E(A + B) = E(A) + E(B) = 1 + 1.6 = 2.6$
  - **Varianza:** $\text{Var}(A + B) = \text{Var}(A) + \text{Var}(B) = 0.95 + 1.472 = 2.422$
- **Función:** `calcularSumaSemanaRestaurante(nDia, pDia, 7)`
  - **Esperanza:** $E(S_7) = 7 \cdot E(X) = 7 \cdot 3.2 = 22.4$
  - **Varianza:** $\text{Var}(S_7) = 7 \cdot \text{Var}(X) = 7 \cdot 2.944 = 20.608$

---

### 1.4. Distribución Empírica y Estimación de Parámetros
- **Archivo:** [`api/src/stats/empirical.ts`](file:///c:/Users/aleja/Desktop/a/UCM-Proyectos/simulador_esperanza_varianza/api/src/stats/empirical.ts)
- **Función:** `calcularDistribucionEmpirica(registros)`
  - **Frecuencia Relativa Observada:** $p_{\text{emp}}(x) = \frac{f(x)}{N_{\text{total}}}$
  - **Esperanza Empírica:** $\hat{E}(X) = \sum x \cdot p_{\text{emp}}(x)$
  - **Segundo Momento Empírico:** $\hat{E}(X^2) = \sum x^2 \cdot p_{\text{emp}}(x)$
  - **Varianza Empírica (Fórmula de Steiner):**
    $$\hat{\text{Var}}(X) = \hat{E}(X^2) - [\hat{E}(X)]^2$$
  - **Estimador de Máxima Verosimilitud de $p$:**
    $$\hat{p} = \frac{\text{Total de Éxitos}}{\text{Total de Intentos}}$$

---

## 2. Aplicación a los 3 Casos Universitarios

| Caso | Parámetros Base | Transformación Económica | Propiedad Especial |
|---|---|---|---|
| **1. Fábrica (`/fabrica`)** | $n = 20, p = 0.05$ | $C = 3500X + 12000$<br>$E(C) = \$15.500$<br>$\text{Var}(C) = 11.637.500$ | Suma de líneas $A$ y $B$:<br>$E(A+B) = 2.6$<br>$\text{Var}(A+B) = 2.422$ |
| **2. Ventas (`/ventas`)** | $n = 30, p = 0.30$ | Ganancia bruta: $Y = 2000X \to E(Y) = \$18.000$<br>Ganancia neta: $N = 2000X - 5000 \to E(N) = \$13.000$ | Estimación empírica a partir de tabla histórica de frecuencias |
| **3. Restaurante (`/restaurante`)** | $n = 40, p = 0.08$ | Pérdida: $L = 4500X$<br>$E(L) = \$14.400$<br>$\text{Var}(L) = 59.616.000$ | Suma semanal 7 días ($E=22.4, \text{Var}=20.608$) + Análisis de sensibilidad ($n \in \{30, 40, 50\}$, $p \in \{5\%, 8\%, 12\%\}$) |
