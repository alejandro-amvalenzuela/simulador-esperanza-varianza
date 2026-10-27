import { PrismaClient, OrigenDato } from "@prisma/client";
import { crearGeneradorMulberry32, simularBinomialIndividual } from "../stats/simulation.js";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando sembrado de datos (seed)...");

  // Limpiar datos anteriores
  await prisma.registroHistorico.deleteMany();
  await prisma.simulacion.deleteMany();
  await prisma.caso.deleteMany();

  // 1. Caso Fábrica
  const fabrica = await prisma.caso.create({
    data: {
      slug: "fabrica",
      nombre: "Control de Calidad en Fábrica",
      descripcion:
        "Inspección de lotes de 20 unidades. X representa el número de piezas defectuosas detectadas por lote con probabilidad individual p = 0,05.",
      n: 20,
      p: 0.05,
      valorUnitario: 3500, // Costo de reproceso por unidad defectuosa
      costoFijo: 12000 // Costo fijo de inspección del lote
    }
  });

  // 2. Caso Ventas
  const ventas = await prisma.caso.create({
    data: {
      slug: "ventas",
      nombre: "Ventas Diarias de un Negocio",
      descripcion:
        "Flujo diario de 30 clientes. X representa el número de clientes que compran un producto adicional en el día con probabilidad p = 0,30.",
      n: 30,
      p: 0.30,
      valorUnitario: 2000, // Ganancia por producto adicional vendido
      costoFijo: 5000 // Costo fijo diario de exhibición y mantención
    }
  });

  // 3. Caso Restaurante
  const restaurante = await prisma.caso.create({
    data: {
      slug: "restaurante",
      nombre: "Pedidos Anticipados en Restaurante",
      descripcion:
        "Operación de 40 pedidos diarios. X representa el número de pedidos anticipados no retirados en la jornada con probabilidad p = 0,08.",
      n: 40,
      p: 0.08,
      valorUnitario: 4500, // Costo de insumos perdidos por cada pedido no retirado
      costoFijo: 0 // Sin costo fijo asociado directo
    }
  });

  console.log("Casos base creados exitosamente:");
  console.log(`- Fábrica (id: ${fabrica.id})`);
  console.log(`- Ventas (id: ${ventas.id})`);
  console.log(`- Restaurante (id: ${restaurante.id})`);

  // Sembrado de 120 registros sintéticos reproducibles por caso (con Mulberry32 determinista)
  const casosParaSeed = [
    { caso: fabrica, semilla: 101, lineas: ["Línea A", "Línea B", "Línea Central"] },
    { caso: ventas, semilla: 202, lineas: ["Turno Mañana", "Turno Tarde", "Jornada Completa"] },
    { caso: restaurante, semilla: 303, lineas: ["Salón Principal", "Terraza", "Delivery / Retiro"] }
  ];

  const fechaBase = new Date(2026, 0, 1); // 1 de enero de 2026

  for (const { caso, semilla, lineas } of casosParaSeed) {
    const rng = crearGeneradorMulberry32(semilla);
    const registrosData = [];

    for (let i = 0; i < 120; i++) {
      const exitos = simularBinomialIndividual(caso.n, caso.p, rng);
      const fechaRegistro = new Date(fechaBase);
      fechaRegistro.setDate(fechaRegistro.getDate() + i);

      registrosData.push({
        casoId: caso.id,
        fecha: fechaRegistro,
        linea: lineas[i % lineas.length],
        intentos: caso.n,
        exitos,
        origen: OrigenDato.sintetico,
        nota: `Simulación sintética determinista (Registro #${i + 1}, semilla base ${semilla})`
      });
    }

    await prisma.registroHistorico.createMany({
      data: registrosData
    });

    console.log(`✓ 120 registros sintéticos creados para: ${caso.nombre}`);
  }

  console.log("¡Sembrado completado con éxito!");
}

main()
  .catch((e) => {
    console.error("Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
