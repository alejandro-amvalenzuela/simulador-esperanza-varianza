import { CasoModulo } from "@/components/modulo/CasoModulo";

export const metadata = {
  title: "Caso 2: Ventas Diarias de un Negocio | Simulador Binomial",
  description:
    "Modelación de compras adicionales en un flujo de n = 30 clientes con p = 0,30, ganancia bruta Y = 2000X, ganancia neta N = 2000X - 5000 y cálculo empírico."
};

export default function VentasPage() {
  return (
    <CasoModulo
      slug="ventas"
      nombre="Caso 2: Ventas Diarias de un Negocio"
      descripcion="Flujo diario de clientes en tienda retail. X modela la cantidad de clientes que acceden a comprar un producto adicional en un día (n = 30 clientes, p = 0,30). Analiza la ganancia bruta Y = 2000X, la ganancia neta N = 2000X - 5000 y contrasta el modelo binomial con la distribución empírica de frecuencias históricas."
      nDefault={30}
      pDefault={0.30}
      valorUnitarioDefault={2000}
      costoFijoDefault={5000}
      etiquetaIndicadorEconomico="Ganancia Neta: N = 2.000·X - 5.000"
      nombreVariableX="Clientes que visitan el local al día"
    />
  );
}
