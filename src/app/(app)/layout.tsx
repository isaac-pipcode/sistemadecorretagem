import Link from "next/link";

import { Abas } from "@/componentes/abas";
import { MedidorMeta } from "@/componentes/medidor-meta";
import { sair } from "@/lib/acoes";
import { carregarMetas, hojeIso, listarVendas, resumoDoMes } from "@/lib/dados";
import { nomeMes } from "@/lib/formato";

export default async function LayoutApp({
  children,
}: {
  children: React.ReactNode;
}) {
  const hoje = hojeIso();
  const [vendas, { metaMensal }] = await Promise.all([
    listarVendas(),
    carregarMetas(),
  ]);
  const mes = resumoDoMes(vendas, hoje);
  const [ano, numeroMes] = hoje.slice(0, 7).split("-");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b-2 border-borda bg-carta">
        <div className="mx-auto w-full max-w-6xl px-3 pt-3 pb-2 sm:px-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href="/"
                className="block text-lg font-black leading-tight text-marca sm:text-2xl"
              >
                Minhas Vendas — Consórcios
              </Link>
              <p className="text-tinta-suave">
                {nomeMes(Number(numeroMes))} de {ano}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href="/conta"
                className="botao-base botao-neutro !min-h-11 !px-3"
              >
                Minha conta
              </Link>
              <form action={sair}>
                <button
                  type="submit"
                  className="botao-base botao-neutro !min-h-11 !px-3"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>

          <MedidorMeta valor={mes.valor} meta={metaMensal} cotas={mes.cotas} />
        </div>

        <Abas />
      </header>

      <main className="mx-auto w-full max-w-6xl px-3 pt-4 pb-16 sm:px-5">
        {children}
      </main>
    </div>
  );
}
