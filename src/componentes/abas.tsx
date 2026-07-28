"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ABAS = [
  { href: "/", rotulo: "Painel" },
  { href: "/funil", rotulo: "Funil de vendas" },
  { href: "/vendas", rotulo: "Vendas" },
  { href: "/carteira", rotulo: "Carteira" },
  { href: "/semana", rotulo: "Minha semana" },
] as const;

export function Abas() {
  const caminho = usePathname();

  return (
    <nav
      aria-label="Seções do sistema"
      className="mx-auto w-full max-w-6xl overflow-x-auto px-3 sm:px-5"
    >
      <ul className="flex min-w-max gap-1 pb-1">
        {ABAS.map((aba) => {
          const ativa =
            aba.href === "/" ? caminho === "/" : caminho.startsWith(aba.href);
          return (
            <li key={aba.href}>
              <Link
                href={aba.href}
                aria-current={ativa ? "page" : undefined}
                className={`flex min-h-12 items-center rounded-t-xl border-b-4 px-4 font-bold whitespace-nowrap ${
                  ativa
                    ? "border-marca bg-marca-clara text-marca"
                    : "border-transparent text-tinta-suave"
                }`}
              >
                {aba.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
