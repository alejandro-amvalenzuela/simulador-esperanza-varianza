import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar, Footer } from "@/components/layout/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Simulador Estadístico | Esperanza, Media y Varianza Binomial",
  description:
    "Observatorio didáctico para el cálculo teórico, simulación Monte Carlo de Bernoulli y análisis empírico de modelos de probabilidad binomiales."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="bg-[#f5f5f5] text-[#0a0a0a] antialiased">
        <Navbar />
        <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          {children}
        </main>
        <Footer />
      </body>

    </html>
  );
}
