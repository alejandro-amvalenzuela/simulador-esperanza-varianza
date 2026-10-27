# Plan de Implementación: Simulador de Esperanza y Varianza (Modelo Binomial)

## 1. Arquitectura y Estructura del Monorepo
```
simulador_esperanza_varianza/
├── api/                          # Backend Express + TypeScript
│   ├── src/
│   │   ├── stats/                # Funciones estadísticas puras (E, Var, Binomial, Bernoulli, Mulberry32)
│   │   │   ├── binomial.ts
│   │   │   ├── simulation.ts
│   │   │   ├── properties.ts
│   │   │   └── empirical.ts
│   │   ├── controllers/          # Controladores REST
│   │   ├── routes/               # Rutas de la API (/api/casos, /api/comparativo, etc.)
│   │   ├── schemas/              # Esquemas Zod para validación de requests/queries
│   │   ├── prisma/               # Schema Prisma, migraciones y seed.ts
│   │   └── app.ts / index.ts     # Servidor Express con CORS, manejo de errores
│   ├── tests/                    # Vitest para funciones estadísticas y convergencia
│   ├── package.json
│   └── tsconfig.json
├── web/                          # Frontend Next.js (App Router) + Tailwind CSS + TypeScript
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Layout con tipografía Inter y tokens Ventriloc
│   │   │   ├── page.tsx          # Inicio (/) con tarjetas y métricas globales
│   │   │   ├── teoria/           # /teoria: Definiciones, fórmulas y ejemplos
│   │   │   ├── comparativo/      # /comparativo: Tabla y gráficos comparativos
│   │   │   ├── fabrica/          # /fabrica: Caso control de calidad
│   │   │   ├── ventas/           # /ventas: Caso ventas diarias
│   │   │   └── restaurante/      # /restaurante: Caso pedidos restaurante
│   │   ├── components/
│   │   │   ├── layout/           # Navbar cápsula pill, Footer editorial
│   │   │   ├── modulo/           # Componente CasoModulo reusable (parámetros, resultados, simulación)
│   │   │   ├── charts/           # Gráficos Recharts (histograma, convergencia ley grandes números, empírica vs teórica, económico)
│   │   │   ├── stats/            # Tablas de probabilidad, fórmulas con sustitución paso a paso
│   │   │   ├── historical/       # Tabla paginada de registros históricos, CSV import/export, modal CRUD
│   │   │   └── ui/               # Botones 0px, cards asimétricas, badges 20px, inputs
│   │   ├── lib/                  # Helpers, api client, formatters CLP y es-CL
│   │   └── types/                # Tipos compartidos
│   ├── package.json
│   └── tailwind.config.ts / globals.css (Tokens de DESIGN.md: Graphite, Ash, Ember Orange, etc.)
├── docs/                         # Documentación requerida para la defensa
│   ├── EXPLICACION.md            # Fórmulas, archivo y función exacta por módulo
│   ├── PREGUNTAS_DEFENSA.md      # 15 preguntas y respuestas clave para el jurado
│   └── CAPTURAS.md               # Guía e instrucciones para capturas de gráficos
├── package.json                  # Scripts raíz para orquestar (dev, build, test, db:migrate, db:seed)
├── .env.example                  # Plantilla de variables de entorno (DATABASE_URL, PORT, etc.)
├── README.md                     # Documentación principal del sistema
└── DESIGN.md                     # Guía de estilo Ventriloc
```

## 2. Etapas de Ejecución Verificables

- **Etapa 1: Estructura del Proyecto, Monorepo y Base de Datos**
  - Configurar package.json raíz con concurrently o npm workspaces.
  - Inicializar `/api` con TypeScript, Express, Zod, Vitest y Prisma.
  - Diseñar el esquema Prisma (`Caso`, `RegistroHistorico`, `Simulacion`) con claves foráneas e índices.
  - Crear script de seed (`seed.ts`) con los 3 casos iniciales y 120 registros sintéticos por caso con semilla determinista.

- **Etapa 2: Funciones Estadísticas Puras y Pruebas Unitarias**
  - Implementar cálculo binomial numéricamente estable con log-gamma / sumas de logaritmos: $\ln \binom{n}{x} = \ln \Gamma(n+1) - \ln \Gamma(x+1) - \ln \Gamma(n-x+1)$.
  - Implementar generador pseudoaleatorio `Mulberry32(seed)` reproducible.
  - Implementar simulador con ensayos individuales de Bernoulli ($X = \sum_{i=1}^n B_i$).
  - Implementar métricas muestrales (media, varianza muestral $s^2$ con divisor $N-1$, desviación estándar, errores teóricos).
  - Implementar propiedades de linealidad y suma: $E(aX+b) = aE(X)+b$, $\text{Var}(aX+b) = a^2 \text{Var}(X)$, $E(A+B) = E(A)+E(B)$, $\text{Var}(A+B) = \text{Var}(A)+\text{Var}(B)$ (independientes).
  - Implementar cálculo empírico de frecuencias y momentos: $\hat{E}(X) = \sum x p(x)$, $\hat{\text{Var}}(X) = \hat{E}(X^2) - [\hat{E}(X)]^2$.
  - Ejecutar Vitest y validar los valores exactos especificados para los 3 casos y el test de convergencia ($N=10.000$).

- **Etapa 3: API REST Completa**
  - Implementar endpoints para casos, teoría, simulación, historial de simulaciones, CRUD de registros históricos, importación/exportación CSV y comparativo.
  - Middleware de validación con Zod y tipado seguro.
  - Formateo de respuestas y manejo de errores con códigos HTTP correctos en español.

- **Etapa 4: Frontend y Sistema de Diseño Ventriloc**
  - Configurar Next.js App Router con Tailwind CSS utilizando los tokens exactos de `DESIGN.md`.
  - Crear componentes base: Navbar en cápsula flotante (`nav-pills`), tarjetas asimétricas (`6px 0px 0px`), botones con borde agudo (`0px`), tipografía con peso 400 y acentos en Ember Orange (`#ff682c`) y Brass (`#816729`).
  - Formateador chileno de números: miles con `.`, decimales con `,`, pesos chilenos sin decimales.
  - Componente de fórmulas con desglose paso a paso (sustitución numérica).

- **Etapa 5: Los 3 Módulos (/fabrica, /ventas, /restaurante)**
  - Construir el componente maestro `CasoModulo` reutilizable.
  - Módulo Fábrica: Costo $C = 3500X + 12000$, suma de líneas A y B.
  - Módulo Ventas: Ganancia $Y = 2000X$, Ganancia Neta $N = 2000X - 5000$, distribución empírica vs teórica.
  - Módulo Restaurante: Pérdida $L = 4500X$, suma de 7 días, análisis de sensibilidad $p \in \{5\%, 8\%, 12\%\}$ y $n \in \{30, 40, 50\}$.
  - 4 Gráficos Recharts en cada módulo + exportación CSV y PNG.
  - Interpretación automática en lenguaje natural comprensible.

- **Etapa 6: Páginas Adicionales (/ y /teoria y /comparativo)**
  - Inicio (`/`): Presentación académica, cards de navegación y métricas recientes.
  - Teoría (`/teoria`): Marco conceptual completo con fórmulas y ejemplos numéricos para el jurado.
  - Comparativo (`/comparativo`): Tabla comparativa y gráfico de barras/coeficiente de variación entre casos.

- **Etapa 7: Documentación de Defensa y Cierre**
  - Crear `README.md`, `docs/EXPLICACION.md`, `docs/PREGUNTAS_DEFENSA.md`, `docs/CAPTURAS.md`.
  - Verificación final de calidad, linters y tests.
