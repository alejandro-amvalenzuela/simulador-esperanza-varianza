# Preguntas y Respuestas Clave para la Defensa Universitaria

Este cuestionario contiene 15 preguntas típicas que la comisión o jurado evaluador suele formular sobre este proyecto, junto con respuestas técnicas, claras y fundamentadas.

---

### 1. ¿Cuál es la diferencia conceptual entre la Esperanza Matemática y la Media Muestral?
**Respuesta:** La Esperanza Matemática $E(X)$ es un parámetro poblacional teórico, determinista y fijo que representa el centro de gravedad de la distribución de probabilidad completa ($\sum x p(x)$). La Media Muestral $\bar{X} = \frac{1}{N}\sum X_i$ es un estadístico muestral, una variable aleatoria que cambia con cada conjunto de datos empíricos observados. Por la Ley de los Grandes Números, cuando el tamaño de muestra $N \to \infty$, la media muestral converge en probabilidad hacia la esperanza matemática.

---

### 2. ¿Por qué la media simulada no coincide exactamente con el valor teórico de la esperanza?
**Respuesta:** Porque cualquier simulación genera una muestra finita de tamaño $N$, la cual está sujeta a **variabilidad muestral estocástica**. El error de estimación disminuye a una tasa de orden $O(1/\sqrt{N})$ según el Teorema del Límite Central. Solo en el límite cuando $N \to \infty$ el error se anula.

---

### 3. ¿Por qué en la varianza de $aX + b$ el término $b$ no afecta el resultado y $a$ aparece al cuadrado?
**Respuesta:** Por definición de varianza, $\text{Var}(Y) = E[(Y - E(Y))^2]$. Si $Y = aX + b$, entonces:
$$(aX + b) - E(aX + b) = aX + b - (aE(X) + b) = a(X - E(X))$$
La constante $b$ se cancela porque sumar una cantidad fija desplaza rígidamente toda la distribución sobre el eje horizontal sin cambiar las distancias relativas entre los puntos (no altera la dispersión). El factor $a$ sale al cuadrado ($a^2$) porque la varianza mide dispersión en unidades cuadráticas.

---

### 4. ¿Por qué se utiliza el divisor $N - 1$ en lugar de $N$ para calcular la varianza muestral?
**Respuesta:** Se conoce como la **corrección de Bessel**. Cuando calculamos la varianza muestral usando la media muestral $\bar{X}$ en lugar de la verdadera esperanza poblacional $\mu$, las desviaciones $(X_i - \bar{X})^2$ son ligeramente menores que $(X_i - \mu)^2$ porque $\bar{X}$ minimiza la suma de cuadrados para esa muestra particular. Dividir por $N$ produciría un estimador sesgado que subestima la varianza real ($E[S_N^2] = \frac{N-1}{N}\sigma^2$). Dividir por $N - 1$ elimina este sesgo, logrando un estimador insesgado ($E[s^2] = \sigma^2$).

---

### 5. ¿Qué supuestos deben cumplirse para aplicar el modelo Binomial?
**Respuesta:**
1. El experimento consiste en un número fijo $n$ de ensayos idénticos.
2. Cada ensayo solo admite dos resultados posibles y mutuamente excluyentes: Éxito ($1$) o Fracaso ($0$).
3. La probabilidad de éxito $p$ permanece estrictamente constante en todos los ensayos (muestreo con reemplazo o población infinita).
4. Todos los ensayos son estocásticamente independientes entre sí.

---

### 6. ¿Por qué en el código simularon los ensayos de Bernoulli uno por uno en lugar de invocar una función binomial directa?
**Respuesta:** Por una razón pedagógica fundamental exigida en la cátedra: una variable Binomial es, por definición conceptual, la suma de $n$ variables indicadoras de Bernoulli independientes ($X = \sum_{i=1}^n B_i$). Simular cada Bernoulli individualmente demuestra cómo la suma de micro-eventos binarios produce la distribución discreta observada y permite auditar el proceso paso a paso.

---

### 7. ¿Por qué fue necesario utilizar una aproximación logarítmica (log-gamma) para la distribución binomial?
**Respuesta:** Porque el cálculo directo de factoriales como $n!$ desborda la representación de números de punto flotante de 64 bits (IEEE 754) para $n > 170$ ($171! \approx \infty$). Al calcular en escala logarítmica usando $\ln \Gamma(z)$ mediante la aproximación de Lanczos:
$$\ln \binom{n}{k} = \ln \Gamma(n+1) - \ln \Gamma(k+1) - \ln \Gamma(n-k+1)$$
podemos calcular probabilidades exactas para valores grandes de $n$ sin riesgo de desbordamiento aritmético ni pérdidas de precisión.

---

### 8. ¿Bajo qué condición la varianza de la suma es igual a la suma de las varianzas: $\text{Var}(X + Y) = \text{Var}(X) + \text{Var}(Y)$?
**Respuesta:** La fórmula general es $\text{Var}(X + Y) = \text{Var}(X) + \text{Var}(Y) + 2\text{Cov}(X, Y)$. La igualdad se cumple estrictamente cuando la covarianza entre ambas variables es nula ($\text{Cov}(X, Y) = 0$). Una condición suficiente para ello es que $X$ e $Y$ sean **estocásticamente independientes**, tal como ocurre con las dos líneas de producción de la fábrica o los días de la semana del restaurante.

---

### 9. ¿Cómo se interpreta el Coeficiente de Variación ($CV$) en el módulo comparativo?
**Respuesta:** El Coeficiente de Variación se define como $CV = \frac{\sigma}{E(X)} \times 100\%$. Es una medida adimensional de **dispersión relativa** que permite comparar la variabilidad de procesos con diferentes escalas o magnitudes medias. Un proceso con un $CV$ menor indica mayor consistencia y predictibilidad relativa respecto a su promedio.

---

### 10. ¿Cómo estiman el parámetro $p$ a partir de la tabla histórica de datos?
**Respuesta:** Se utiliza el Estimador de Máxima Verosimilitud (EMV):
$$\hat{p} = \frac{\text{Total de Éxitos Observados}}{\text{Total de Ensayos Realizados}} = \frac{\sum x_i}{\sum n_i}$$
Este estimador es insesgado, consistente y de mínima varianza para el parámetro $p$ de la distribución binomial.

---

### 11. ¿Qué es la fórmula de Steiner y cómo se aplica al cálculo empírico?
**Respuesta:** Es la identidad que relaciona la varianza con los momentos no centrales: $\text{Var}(X) = E(X^2) - [E(X)]^2$. En el cálculo empírico, se calcula primero la esperanza $\hat{E}(X) = \sum x p(x)$ y luego el segundo momento $\hat{E}(X^2) = \sum x^2 p(x)$. La fórmula de Steiner permite obtener la varianza en una sola pasada sobre las frecuencias sin tener que recalcular las distancias respecto a la media.

---

### 12. ¿Por qué las simulaciones son reproducibles (deterministas)?
**Respuesta:** Porque utilizamos un generador de números pseudoaleatorios con semilla (PRNG Mulberry32). Al fijar una semilla entera específica (como `42`), la secuencia de números pseudoaleatorios generada es 100% idéntica en cualquier computador, lo que permite replicar exactamente las pruebas y verificar las tolerancias exigidas.

---

### 13. ¿Qué representa la desviación estándar en el contexto del negocio?
**Respuesta:** Representa la magnitud de la fluctuación habitual alrededor del promedio en las mismas unidades de la variable original. Según la desigualdad de Chebyshev y la regla empírica, la mayor parte de las observaciones operativas diarias se encontrarán en el intervalo $[E(X) - \sigma, E(X) + \sigma]$, permitiendo al gerente planificar dotación o inventario para la variabilidad cotidiana.

---

### 14. En el caso del restaurante, ¿qué revela el análisis de sensibilidad al variar $p$ y $n$?
**Respuesta:** Revela la elasticidad del impacto económico frente a cambios en los parámetros del entorno. Aumentar $p$ del 5% al 12% más que duplica la pérdida esperada $E(L)$ (pasa de \$9.000 a \$21.600 con $n=40$). Permite a la administración evaluar qué medida es más costo-efectiva: reducir el número de pedidos aceptados ($n$) o implementar políticas de confirmación o cobro previo para disminuir la tasa de abandono ($p$).

---

### 15. ¿Cómo garantizan que la API y los cálculos no dependan del estado del frontend?
**Respuesta:** Siguiendo una arquitectura desacoplada de software: todas las fórmulas estadísticas son **funciones puras** implementadas en TypeScript dentro de la carpeta `/api/src/stats`, sin efectos secundarios. La API REST procesa las simulaciones en el servidor y entrega JSON tipado validado por esquemas Zod, permitiendo que la lógica matemática sea verificada de manera autónoma con vitest sin requerir interfaz gráfica.
