import Link from "next/link";

import { BotaoWhatsapp } from "@/componentes/botao-whatsapp";
import { CartaoNumero } from "@/componentes/cartao-numero";
import { GraficoMeses } from "@/componentes/grafico-meses";
import { GraficoSegmentos } from "@/componentes/grafico-segmentos";
import {
  carregarMetas,
  diasDesdeUltimaVenda,
  hojeIso,
  listarClientes,
  listarLeads,
  listarVendas,
  pendenciasDeHoje,
  resumoDoAno,
  resumoDoMes,
  taxaDeDesistencia,
  ticketMedio12Meses,
  vendasPorMes,
  vendasPorSegmento,
} from "@/lib/dados";
import { dataBr, numero, reais } from "@/lib/formato";

export default async function PaginaPainel() {
  const hoje = hojeIso();
  const [vendas, clientes, leads, { metaMensal, metasSemanais }] =
    await Promise.all([
      listarVendas(),
      listarClientes(),
      listarLeads(),
      carregarMetas(),
    ]);

  const mes = resumoDoMes(vendas, hoje);
  const ano = resumoDoAno(vendas, hoje);
  const ticket = ticketMedio12Meses(vendas, hoje);
  const dias = diasDesdeUltimaVenda(vendas, hoje);
  const desistencia = taxaDeDesistencia(vendas);
  const porMes = vendasPorMes(vendas, hoje, 18);
  const porSegmento = vendasPorSegmento(vendas, hoje);
  const pendencias = pendenciasDeHoje(clientes, leads, hoje);
  const anoCorrente = hoje.slice(0, 4);

  return (
    <div className="space-y-6">
      <section aria-labelledby="titulo-numeros">
        <h1 id="titulo-numeros" className="text-2xl font-black">
          Painel
        </h1>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CartaoNumero
            titulo="Vendido no mês"
            valor={reais(mes.valor)}
            detalhe={`${numero(mes.cotas)} ${
              mes.cotas === 1 ? "cota" : "cotas"
            } · sem desistências: ${reais(mes.valorFirme)}`}
          />
          <CartaoNumero
            titulo={`Vendido no ano (${anoCorrente})`}
            valor={reais(ano.valor)}
            detalhe={`${numero(ano.cotas)} ${
              ano.cotas === 1 ? "cota" : "cotas"
            } · sem desistências: ${reais(ano.valorFirme)}`}
          />
          <CartaoNumero
            titulo="Tíquete médio (12 meses)"
            valor={reais(ticket)}
            detalhe={`Desistências: ${(desistencia * 100).toLocaleString(
              "pt-BR",
              {
                maximumFractionDigits: 0,
              },
            )}% das vendas`}
          />
          <CartaoNumero
            titulo="Dias desde a última venda"
            valor={dias === null ? "—" : numero(dias)}
            detalhe={
              dias === null
                ? "Nenhuma venda registrada ainda"
                : dias > 14
                  ? "Passou de 14 dias — hora de ligar para a carteira"
                  : "Ritmo em dia"
            }
            tom={dias !== null && dias > 14 ? "alerta" : "normal"}
          />
        </div>
      </section>

      <section className="carta p-4" aria-labelledby="titulo-hoje">
        <h2 id="titulo-hoje" className="text-2xl font-black">
          Para fazer hoje
        </h2>
        {pendencias.length === 0 ? (
          <p className="mt-2 text-tinta-suave">
            Nada marcado para hoje. Aproveite para ligar para quem está há mais
            tempo sem contato na{" "}
            <Link href="/carteira" className="font-bold text-marca underline">
              Carteira
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {pendencias.map((p) => (
              <li
                key={`${p.tipo}-${p.id}`}
                className={`rounded-xl border-2 p-3 ${
                  p.atrasada
                    ? "border-vermelho bg-vermelho-claro"
                    : "border-borda bg-fundo"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-lg font-black">{p.nome}</p>
                    <p className="text-tinta-suave">{p.descricao}</p>
                    <p className="numeros font-bold">
                      {p.atrasada ? "Atrasado desde " : "Para hoje — "}
                      {dataBr(p.data)}
                      <span className="ml-2 font-normal text-tinta-suave">
                        ({p.tipo})
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <BotaoWhatsapp
                      telefone={p.telefone}
                      rotulo="WhatsApp"
                      className="botao-base botao-secundario !min-h-11 !px-3"
                    />
                    <Link
                      href={p.tipo === "Funil" ? "/funil" : "/carteira"}
                      className="botao-base botao-neutro !min-h-11 !px-3"
                    >
                      Abrir
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="carta p-4" aria-labelledby="titulo-meses">
        <h2 id="titulo-meses" className="text-2xl font-black">
          Valor vendido por mês
        </h2>
        <p className="text-tinta-suave">
          Últimos 18 meses. A linha vermelha é a meta de {reais(metaMensal)}.
        </p>
        <div className="mt-3">
          <GraficoMeses dados={porMes} meta={metaMensal} />
        </div>
      </section>

      <section className="carta p-4" aria-labelledby="titulo-segmentos">
        <h2 id="titulo-segmentos" className="text-2xl font-black">
          Vendas por segmento em {anoCorrente}
        </h2>
        <div className="mt-3">
          <GraficoSegmentos dados={porSegmento} />
        </div>
        <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {porSegmento.map((s) => (
            <li
              key={s.segmento}
              className="numeros flex items-baseline justify-between rounded-xl border-2 border-borda bg-fundo px-3 py-2"
            >
              <span className="font-bold">{s.segmento}</span>
              <span>
                {reais(s.valor)} · {numero(s.cotas)}{" "}
                {s.cotas === 1 ? "cota" : "cotas"}
              </span>
            </li>
          ))}
        </ul>
        {porSegmento.find((s) => s.segmento === "Agro")?.valor === 0 ? (
          <p className="mt-3 rounded-xl border-2 border-ambar bg-ambar-claro px-3 py-2 font-bold text-ambar">
            Agro ainda zerado em {anoCorrente}: máquinas, tratores e caminhões
            são o mercado com o maior tíquete e ainda não explorado.
          </p>
        ) : null}
      </section>

      <section className="carta p-4" aria-labelledby="titulo-alvos">
        <h2 id="titulo-alvos" className="text-2xl font-black">
          Meus alvos da semana
        </h2>
        <p className="text-tinta-suave">
          É o que sustenta a meta de {reais(metaMensal)} por mês.
        </p>
        <ul className="mt-3 grid grid-cols-3 gap-2">
          {[
            { rotulo: "Contatos novos", valor: metasSemanais.contatos },
            { rotulo: "Reuniões", valor: metasSemanais.reunioes },
            { rotulo: "Propostas", valor: metasSemanais.propostas },
          ].map((alvo) => (
            <li
              key={alvo.rotulo}
              className="rounded-xl border-2 border-borda bg-fundo p-3 text-center"
            >
              <p className="numeros text-[28px] leading-none font-black">
                {alvo.valor}
              </p>
              <p className="mt-1 font-bold text-tinta-suave">{alvo.rotulo}</p>
            </li>
          ))}
        </ul>
        <Link
          href="/semana"
          className="botao-base botao-secundario mt-3 w-full sm:w-auto"
        >
          Anotar minha semana
        </Link>
      </section>
    </div>
  );
}
