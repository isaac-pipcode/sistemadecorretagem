"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * `curto` é o que aparece no celular. Antes a barra rolava de lado com
 * `min-w-max`, e as últimas abas ficavam fora da tela sem nenhum aviso de que
 * dava para arrastar — em 390px, "Minha semana" simplesmente não existia.
 * Agora nada rola: os nomes encurtam e as pastilhas quebram de linha.
 */
const ABAS = [
  { href: "/", rotulo: "Painel", curto: "Painel" },
  { href: "/funil", rotulo: "Funil de vendas", curto: "Funil" },
  { href: "/leads", rotulo: "Leads", curto: "Leads" },
  { href: "/vendas", rotulo: "Vendas", curto: "Vendas" },
  { href: "/carteira", rotulo: "Carteira", curto: "Carteira" },
  { href: "/semana", rotulo: "Minha semana", curto: "Semana" },
] as const;

export function Abas() {
  const caminho = usePathname();

  return (
    <nav
      aria-label="Seções do sistema"
      className="mx-auto w-full max-w-6xl px-4 sm:px-6"
    >
      <ul className="carta flex flex-wrap gap-1 p-1.5">
        {ABAS.map((aba) => {
          const ativa =
            aba.href === "/" ? caminho === "/" : caminho.startsWith(aba.href);
          return (
            <li key={aba.href} className="min-w-0 grow">
              <Link
                href={aba.href}
                aria-current={ativa ? "page" : undefined}
                className={`flex min-h-12 items-center justify-center rounded-xl px-3 font-bold whitespace-nowrap sm:px-4 ${
                  ativa
                    ? "bg-marca text-white shadow-sm"
                    : "text-tinta-suave hover:bg-marca-clara"
                }`}
              >
                <span className="sm:hidden">{aba.curto}</span>
                <span className="hidden sm:inline">{aba.rotulo}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
