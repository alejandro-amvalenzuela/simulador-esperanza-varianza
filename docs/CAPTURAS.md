# Guía de Capturas de Pantalla para el Informe Escrito

Este documento describe las instrucciones paso a paso para generar y exportar las capturas de pantalla de alta resolución requeridas para el anexo del informe académico y la presentación de diapositivas.

---

## 1. Captura de Gráficos en Formato PNG desde la Aplicación

Cada uno de los tres módulos del sistema dispone de un botón integrado:
- **Ubicación:** Sección superior de "Visualización Gráfica" en `/fabrica`, `/ventas` y `/restaurante`.
- **Botón:** `[Descargar Gráficos (PNG)]`
- **Mecanismo:** La aplicación utiliza la librería `html-to-image` para renderizar el lienzo SVG de Recharts en un archivo de imagen PNG con fondo blanco nítido y tipografía vectorial, descargándose automáticamente como:
  - `graficos_fabrica.png`
  - `graficos_ventas.png`
  - `graficos_restaurante.png`

---

## 2. Capturas Recomendadas para el Informe

Para ilustrar de forma completa la defensa teórica y práctica en el documento PDF o Word del informe, se sugiere incluir las siguientes 6 figuras:

### Figura 1: Módulo Fábrica — Ley de los Grandes Números
- **Ruta:** `/fabrica`
- **Acción:** Ejecutar simulación con $N = 10.000$ corridas y semilla `42`.
- **Qué muestra:** El gráfico de línea donde la media muestral acumulada $\bar{X}_N$ oscila al principio y se estabiliza con precisión asintótica sobre la línea punteada negra de la esperanza teórica $E(X) = 1.0$.

### Figura 2: Módulo Fábrica — Histograma Teórico vs Simulado
- **Ruta:** `/fabrica`
- **Qué muestra:** La superposición de las barras de la función de masa de probabilidad teórica $P(X=k)$ en tono latón (`#816729`) contra las frecuencias relativas simuladas en naranja brasa (`#ff682c`).

### Figura 3: Módulo Ventas — Comparativa Tridimensional
- **Ruta:** `/ventas`
- **Qué muestra:** La comparación de las tres fuentes de información:
  1. Distribución Teórica Binomial ($n=30, p=0.30$)
  2. Distribución Empírica calculada sobre los 120 registros históricos
  3. Frecuencias simuladas Monte Carlo con Bernoulli

### Figura 4: Módulo Restaurante — Análisis de Sensibilidad
- **Ruta:** `/restaurante`
- **Qué muestra:** La tabla y métricas donde varían simultáneamente $p \in \{5\%, 8\%, 12\%\}$ y $n \in \{30, 40, 50\}$, evidenciando el incremento no lineal de la pérdida esperada $E(L)$.

### Figura 5: Dashboard Comparativo Global
- **Ruta:** `/comparativo`
- **Qué muestra:** La matriz de momentos de los 3 casos y el gráfico del Coeficiente de Variación ($CV$), contrastando la dispersión relativa de cada proceso de negocio.

### Figura 6: Tabla Histórica con Paginación y Filtros
- **Ruta:** Cualquiera de los módulos (ej. `/fabrica`)
- **Qué muestra:** La grilla de registros con distintivos visuales para datos "reales" y "sintéticos", botones de importación/exportación CSV y controles de edición en línea.

---

## 3. Instrucciones con Herramienta de Recortes de Windows (Snipping Tool)
1. Abrir el navegador en `http://localhost:3000`.
2. Presionar `F11` para pantalla completa.
3. Presionar `Windows + Shift + S`.
4. Seleccionar el recuadro correspondiente a la tarjeta con radio asimétrico y guardarla en la carpeta `docs/capturas/` para adjuntar al informe.
