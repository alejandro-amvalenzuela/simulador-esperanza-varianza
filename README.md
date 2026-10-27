# Observatorio Estadístico: Esperanza, Media y Varianza Binomial

Sistema web integral de experimentación estocástica, cálculo analítico y simulación Monte Carlo para variables aleatorias discretas bajo el modelo Binomial. Desarrollado para la presentación y defensa frente a jurado universitario en la Universidad Católica del Maule (UCM).

---

## Stack Tecnológico

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS con tokens del sistema de diseño **Ventriloc** (Graphite, Ash, Ember Orange, esquinas asimétricas y botones de ángulo vivo), Recharts para visualización vectorial, y validación con Zod.
- **Backend:** Node.js con Express, TypeScript y arquitectura modular desacoplada en `/api`. Cálculos estadísticos puros en el servidor.
- **Base de Datos:** PostgreSQL local con Prisma ORM, migraciones versionadas y claves foráneas en cascada.
- **Testing:** Vitest con pruebas de tolerancia estricta ($10^{-9}$) y convergencia de 10.000 repeticiones.

---

## Requisitos Previos

1. **Node.js:** Versión $\ge 18.x$ (probado en v22.14.0).
2. **PostgreSQL:** Servidor local ejecutándose en el puerto estándar `5432`.
   - Base de datos requerida: `simulador_binomial` (o configurada en `.env`).

---

## Instalación y Configuración

1. **Clonar y posicionarse en la raíz del proyecto:**
   ```bash
   cd simulador_esperanza_varianza
   ```

2. **Configurar variables de entorno:**
   Copie el archivo de ejemplo tanto en la raíz como en `/api`:
   ```bash
   cp .env.example .env
   cp .env.example api/.env
   ```
   *Verifique las credenciales de PostgreSQL en `DATABASE_URL` (por defecto `postgresql://postgres:12345@localhost:5432/simulador_binomial?schema=public`).*

3. **Instalar dependencias del monorepo:**
   ```bash
   npm install
   cd api && npm install
   cd ../web && npm install
   cd ..
   ```

4. **Sincronizar y sembrar la base de datos (Seed):**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
   *El comando seed genera automáticamente los 3 casos y 120 registros sintéticos reproducibles por caso mediante el algoritmo Mulberry32.*

---

## Ejecución de Pruebas Estadísticas

Para verificar la rigurosidad matemática y el cumplimiento de las tolerancias requeridas:
```bash
npm run test
```
Esto ejecutará la suite de Vitest validando:
- Valores analíticos teóricos de Fábrica, Ventas y Restaurante con tolerancia $10^{-9}$.
- Estabilidad numérica de la distribución binomial con sumas de log-gamma.
- Prueba de convergencia Monte Carlo con 10.000 ensayos individuales de Bernoulli.

---

## Puesta en Marcha en Desarrollo

Para levantar simultáneamente la API REST (puerto 4000) y la aplicación Web Next.js (puerto 3000):
```bash
npm run dev
```

Abra el navegador en:
- **Frontend Web:** [http://localhost:3000](http://localhost:3000)
- **API REST (Health Check):** [http://localhost:4000/health](http://localhost:4000/health)

---

## Estructura del Proyecto

```
simulador_esperanza_varianza/
├── api/                          # Backend Express + TypeScript
│   ├── src/
│   │   ├── stats/                # Funciones estadísticas puras (binomial, simulación, propiedades, empírica)
│   │   ├── controllers/          # Controladores REST (/casos, /simular, /registros, /comparativo)
│   │   ├── routes/               # Enrutamiento de la API
│   │   ├── schemas/              # Validación Zod
│   │   ├── prisma/               # Schema Prisma y seed.ts
│   │   └── index.ts              # Servidor Express con CORS
│   └── tests/                    # Pruebas unitarias de estadística con Vitest
├── web/                          # Frontend Next.js (App Router) + Tailwind CSS
│   ├── src/
│   │   ├── app/                  # Rutas: /, /fabrica, /ventas, /restaurante, /teoria, /comparativo
│   │   ├── components/
│   │   │   ├── modulo/           # Componente CasoModulo reutilizable
│   │   │   ├── charts/           # Gráficos Recharts (histograma, convergencia, comparativo, económico)
│   │   │   ├── historical/       # Tabla histórica paginada, filtros y gestión CSV
│   │   │   └── layout/           # Barra de navegación en cápsula (nav-pill) y footer
│   │   └── lib/                  # Formateador chileno es-CL (CLP) y cliente API
├── docs/                         # Documentación requerida para la defensa
│   ├── EXPLICACION.md            # Fórmulas, archivo y función exacta por módulo
│   ├── PREGUNTAS_DEFENSA.md      # 15 preguntas clave con respuestas para el jurado
│   └── CAPTURAS.md               # Instrucciones y guía para capturas de gráficos en PNG
├── package.json                  # Scripts orquestadores del monorepo
├── .env.example                  # Plantilla de variables de entorno
└── DESIGN.md                     # Guía de estilo y diseño Ventriloc
```

---

## Documentos para la Defensa
- [docs/EXPLICACION.md](file:///c:/Users/aleja/Desktop/a/UCM-Proyectos/simulador_esperanza_varianza/docs/EXPLICACION.md): Mapeo detallado de fórmulas, archivos y funciones.
- [docs/PREGUNTAS_DEFENSA.md](file:///c:/Users/aleja/Desktop/a/UCM-Proyectos/simulador_esperanza_varianza/docs/PREGUNTAS_DEFENSA.md): 15 preguntas y respuestas académicas para el jurado.
- [docs/CAPTURAS.md](file:///c:/Users/aleja/Desktop/a/UCM-Proyectos/simulador_esperanza_varianza/docs/CAPTURAS.md): Guía para exportar las figuras del informe en PNG.
