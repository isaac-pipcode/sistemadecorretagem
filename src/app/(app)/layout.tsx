import Link from "next/link";

import { Abas } from "@/componentes/abas";
import { Marca } from "@/componentes/marca";
import { MedidorMeta } from "@/componentes/medidor-meta";
import { sair } from "@/lib/acoes";
import {
  carregarMetas,
  carregarPerfil,
  hojeIso,
  listarVendas,
  resumoDoMes,
} from "@/lib/dados";
import { nomeMes } from "@/lib/formato";

export default async function LayoutApp({
  children,
}: {
  children: React.ReactNode;
}) {
  const hoje = hojeIso();
  const [vendas, { metaMensal }, perfil] = await Promise.all([
    listarVendas(),
    carregarMetas(),
    carregarPerfil(),
  ]);
  const mes = resumoDoMes(vendas, hoje);
  const [ano, numeroMes] = hoje.slice(0, 7).split("-");

  return (
    <div className="min-h-dvh">
      {/* Faixa azul: marca, mês corrente e o medidor da meta */}
      <div className="faixa-marca">
        <div className="mx-auto w-full max-w-6xl px-4 pt-3 pb-5 sm:px-6 sm:pt-4 sm:pb-6">
          {/* No celular a marca fica sozinha na primeira linha; os botões
              caem para baixo, senão o cabeçalho estoura os 380px. */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" aria-label="Ir para o Painel">
              <Marca />
            </Link>
            <div className="flex shrink-0 gap-2">
              <Link
                href="/conta"
                className="botao-base !min-h-11 !rounded-full border-2 border-white/35 !px-4 text-white"
              >
                Minha conta
              </Link>
              <form action={sair}>
                <button
                  type="submit"
                  className="botao-base !min-h-11 !rounded-full border-2 border-white/35 !px-4 text-white"
                >
                  Sair
                </button>
              </form>
            </div>
          </div>

          {/* Mês corrente e de quem é esta tela — com várias consultoras no
              mesmo sistema, o nome evita dúvida sobre de quem são os números. */}
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-4">
            <p className="font-bold text-white/80 first-letter:uppercase">
              {nomeMes(Number(numeroMes))} de {ano}
            </p>
            {perfil ? (
              <p className="font-bold text-white/80">{perfil.nome}</p>
            ) : null}
          </div>
          <div className="mt-1.5">
            <MedidorMeta
              valor={mes.valor}
              meta={metaMensal}
              cotas={mes.cotas}
            />
          </div>
        </div>
      </div>

      {/* Abas: descem sobre a faixa azul, como um bloco de pastilhas */}
      <div className="sticky top-0 z-30 -mt-3 bg-fundo/95 pb-1 backdrop-blur">
        <Abas />
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pt-4 pb-20 sm:px-6">
        {children}
      </main>
    </div>
  );
}
