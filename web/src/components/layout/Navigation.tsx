"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, BarChart3, Factory, ShoppingCart, UtensilsCrossed } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Inicio", icon: Activity },
    { href: "/fabrica", label: "Fábrica", icon: Factory },
    { href: "/ventas", label: "Ventas", icon: ShoppingCart },
    { href: "/restaurante", label: "Restaurante", icon: UtensilsCrossed },
    { href: "/teoria", label: "Teoría", icon: BookOpen },
    { href: "/comparativo", label: "Comparativo", icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#ffffff] backdrop-blur-md border-b border-[#e5e5e5] shadow-xs">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 min-h-[64px] py-2 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-[#0a0a0a] leading-tight tracking-tight group-hover:text-[#f97316] transition-colors">
              Observatorio Binomial
            </span>
            <span className="text-[11px] text-[#737373] tracking-normal font-normal">
              UCM · Esperanza & Varianza
            </span>
          </div>
        </Link>

        {/* Navigation items - Pill geometry 18px */}
        <nav className="hidden md:flex items-center gap-1 bg-[#f5f5f5] p-1 rounded-[18px] border border-[#e5e5e5]/80">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-[13px] font-medium rounded-[18px] transition-all duration-150 ${
                  isActive
                    ? "bg-[#0a0a0a] text-[#fafafa] shadow-xs"
                    : "text-[#737373] hover:text-[#0a0a0a] hover:bg-[#ffffff]/60"
                }`}
              >
                <Icon size={14} className={isActive ? "text-[#f97316]" : "text-[#737373]"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA button */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/teoria"
            className="btn-primary text-[13px] !py-1.5 !px-3.5 !bg-[#f97316] hover:!bg-[#ea580c] text-white"
          >
            <BookOpen size={14} />
            <span className="hidden sm:inline">Ver Fórmulas</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#ffffff] border-t border-[#e5e5e5] py-8 mt-16 text-[#737373]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div>
          <span className="font-semibold text-[#0a0a0a]">Observatorio Binomial</span> — Universidad Católica del Maule
        </div>
        <div className="font-mono text-[#737373]">
          Semestre 2026
        </div>
      </div>
    </footer>
  );
}
