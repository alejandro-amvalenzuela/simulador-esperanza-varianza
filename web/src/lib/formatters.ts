/**
 * Utilidades de formateo numérico y de moneda según estándar chileno (es-CL)
 * - Separador de miles: punto (.)
 * - Separador de decimales: coma (,)
 * - Moneda: CLP sin decimales ($ 15.500)
 */

export function formatearNumero(
  val: number | null | undefined,
  decimales: number = 2
): string {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return new Intl.NumberFormat("es-CL", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(val);
}

export function formatearEntero(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "0";
  return new Intl.NumberFormat("es-CL", {
    maximumFractionDigits: 0
  }).format(val);
}

export function formatearCLP(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "$0";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(val);
}

export function formatearPorcentaje(val: number | null | undefined, decimales: number = 2): string {
  if (val === null || val === undefined || isNaN(val)) return "0%";
  return `${formatearNumero(val, decimales)}%`;
}
