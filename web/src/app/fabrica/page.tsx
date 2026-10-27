import { CasoModulo } from "@/components/modulo/CasoModulo";

export const metadata = {
  title: "Caso 1: Control de Calidad en Fábrica | Simulador Binomial",
  description:
    "Análisis de lotes de n = 20 piezas con probabilidad de defecto p = 0,05, función de costos C = 3500X + 12000 y propiedad de suma independiente de líneas A y B."
};

export default function FabricaPage() {
  return (
    <CasoModulo
      slug="fabrica"
      nombre="Caso 1: Control de Calidad en Fábrica"
      descripcion="Inspección de lotes de producción industrial. X modela el número de productos defectuosos hallados en una muestra de n = 20 unidades con probabilidad individual de falla p = 0,05. Permite analizar el costo total de reproceso e inspección y la suma de dos líneas de producción independientes A y B."
      nDefault={20}
      pDefault={0.05}
      valorUnitarioDefault={3500}
      costoFijoDefault={12000}
      etiquetaIndicadorEconomico="Costo del Lote: C = 3.500·X + 12.000"
      nombreVariableX="Piezas inspeccionadas por lote"
      tieneSumaIndependiente={true}
    />
  );
}
