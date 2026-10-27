import { CasoModulo } from "@/components/modulo/CasoModulo";

export const metadata = {
  title: "Caso 3: Pedidos en Restaurante | Simulador Binomial",
  description:
    "Análisis de pérdidas económicas por no retiro en n = 40 pedidos anticipados diarios con p = 0,08, suma semanal acumulada y análisis de sensibilidad paramétrico."
};

export default function RestaurantePage() {
  return (
    <CasoModulo
      slug="restaurante"
      nombre="Caso 3: Pedidos en Restaurante"
      descripcion="Gestión gastronómica de pedidos anticipados. X modela el número de pedidos confirmados pero no retirados por los clientes en la jornada (n = 40 pedidos, p = 0,08). Analiza la pérdida económica por insumos inutilizados L = 4500X, la acumulación semanal para 7 días independientes y el análisis de sensibilidad variando p y n."
      nDefault={40}
      pDefault={0.08}
      valorUnitarioDefault={4500}
      costoFijoDefault={0}
      etiquetaIndicadorEconomico="Pérdida Económica: L = 4.500·X"
      nombreVariableX="Pedidos anticipados diarios"
      tieneSumaSemanal={true}
      tieneAnalisisSensibilidad={true}
    />
  );
}
