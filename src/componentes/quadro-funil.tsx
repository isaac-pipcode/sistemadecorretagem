"use client";

import { useState, useTransition } from "react";

import { BotaoWhatsapp } from "@/componentes/botao-whatsapp";
import { FormularioLead } from "@/componentes/formulario-lead";
import { FormularioVenda } from "@/componentes/formulario-venda";
import { Janela } from "@/componentes/janela";
import { excluirLead, moverLead } from "@/lib/acoes";
import { dataBr, reais, telefoneBr } from "@/lib/formato";
import { ETAPAS, MOTIVOS_PERDA, type Etapa, type Lead } from "@/lib/tipos";

type Props = {
  leads: Lead[];
  hoje: string;
  conversao: { fechados: number; base: number; taxa: number };
};

const COLUNAS: { titulo: string; etapas: Etapa[] }[] = [
  { titulo: "Novo contato", etapas: ["Novo contato"] },
  { titulo: "Reunião marcada", etapas: ["Reunião marcada"] },
  { titulo: "Proposta feita", etapas: ["Proposta feita"] },
  { titulo: "Fechou / Perdeu", etapas: ["Fechou", "Perdeu"] },
];

export function QuadroFunil({ leads, hoje, conversao }: Props) {
  const [emTransicao, iniciar] = useTransition();
  const [arrastando, setArrastando] = useState<string | null>(null);
  const [alvoColuna, setAlvoColuna] = useState<string | null>(null);
  const [fechando, setFechando] = useState<Lead | null>(null);
  const [perdendo, setPerdendo] = useState<Lead | null>(null);
  const [editando, setEditando] = useState<Lead | null>(null);
  const [criando, setCriando] = useState(false);

  function mover(lead: Lead, etapa: Etapa) {
    if (etapa === lead.etapa) return;
    if (etapa === "Fechou") {
      setFechando(lead);
      return;
    }
    if (etapa === "Perdeu") {
      setPerdendo(lead);
      return;
    }
    const dados = new FormData();
    dados.set("id", lead.id);
    dados.set("etapa", etapa);
    iniciar(() => {
      void moverLead(dados);
    });
  }

  function soltarNaColuna(titulo: string) {
    const lead = leads.find((l) => l.id === arrastando);
    setArrastando(null);
    setAlvoColuna(null);
    if (!lead) return;
    const coluna = COLUNAS.find((c) => c.titulo === titulo);
    if (!coluna) return;
    mover(lead, coluna.etapas[0]);
  }

  function fecharJanelas() {
    setFechando(null);
    setPerdendo(null);
    setEditando(null);
    setCriando(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">Funil de vendas</h1>
        <button
          type="button"
          onClick={() => setCriando(true)}
          className="botao-base botao-principal w-full text-lg sm:w-auto"
        >
          + Anotar interessado
        </button>
      </div>

      <div className="carta bg-marca-clara p-4">
        <p className="text-base font-bold text-tinta-suave">
          De cada proposta que fiz nos últimos 90 dias, quantas viraram venda
        </p>
        <p className="numeros text-[28px] leading-tight font-black">
          {(conversao.taxa * 100).toLocaleString("pt-BR", {
            maximumFractionDigits: 0,
          })}
          %
        </p>
        <p className="numeros font-bold text-tinta-suave">
          {conversao.fechados} de {conversao.base}{" "}
          {conversao.base === 1 ? "proposta" : "propostas"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {COLUNAS.map((coluna) => {
          const daColuna = leads.filter((l) => coluna.etapas.includes(l.etapa));
          const soma = daColuna.reduce(
            (t, l) => t + (l.valor_estimado ?? 0),
            0,
          );
          return (
            <section
              key={coluna.titulo}
              onDragOver={(e) => {
                e.preventDefault();
                setAlvoColuna(coluna.titulo);
              }}
              onDragLeave={() => setAlvoColuna(null)}
              onDrop={() => soltarNaColuna(coluna.titulo)}
              className={`carta p-3 ${
                alvoColuna === coluna.titulo
                  ? "border-marca bg-marca-clara"
                  : ""
              }`}
              aria-label={coluna.titulo}
            >
              <div className="flex items-baseline justify-between gap-2 border-b-2 border-borda pb-2">
                <h2 className="text-lg font-black">{coluna.titulo}</h2>
                <span className="numeros rounded-full bg-marca px-3 py-1 font-black text-white">
                  {daColuna.length}
                </span>
              </div>
              {soma > 0 ? (
                <p className="numeros mt-1 font-bold text-tinta-suave">
                  {reais(soma)} em jogo
                </p>
              ) : null}

              <ul className="mt-3 space-y-3">
                {daColuna.map((lead) => (
                  <CartaoLead
                    key={lead.id}
                    lead={lead}
                    hoje={hoje}
                    ocupado={emTransicao}
                    aoArrastar={() => setArrastando(lead.id)}
                    aoMover={(etapa) => mover(lead, etapa)}
                    aoEditar={() => setEditando(lead)}
                  />
                ))}
                {daColuna.length === 0 ? (
                  <li className="rounded-xl border-2 border-dashed border-borda p-4 text-center text-tinta-suave">
                    Nenhum interessado aqui
                  </li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>

      {criando ? (
        <Janela titulo="Anotar interessado" aoFechar={fecharJanelas}>
          <FormularioLead aoConcluir={fecharJanelas} />
        </Janela>
      ) : null}

      {editando ? (
        <Janela titulo="Editar interessado" aoFechar={fecharJanelas}>
          <FormularioLead lead={editando} aoConcluir={fecharJanelas} />
        </Janela>
      ) : null}

      {fechando ? (
        <Janela
          titulo={`Fechar venda com ${fechando.nome}`}
          aoFechar={fecharJanelas}
        >
          <p className="mb-4 rounded-xl border-2 border-verde bg-verde-claro px-3 py-2 font-bold text-verde">
            Já preenchi com o que estava anotado. Confira e clique em Registrar
            venda.
          </p>
          <FormularioVenda
            leadId={fechando.id}
            inicial={{
              nome_cliente: fechando.nome,
              telefone: fechando.telefone ?? "",
              segmento: fechando.segmento ?? "Imóveis",
              valor: fechando.valor_estimado ?? undefined,
              origem: fechando.origem ?? "",
              indicado_por: fechando.indicado_por ?? "",
              observacoes: fechando.notas ?? "",
            }}
            aoConcluir={fecharJanelas}
          />
        </Janela>
      ) : null}

      {perdendo ? (
        <Janela
          titulo={`Por que ${perdendo.nome} não fechou?`}
          aoFechar={fecharJanelas}
        >
          <form
            action={(dados) => {
              iniciar(() => {
                void moverLead(dados);
              });
              fecharJanelas();
            }}
            className="space-y-3"
          >
            <input type="hidden" name="id" value={perdendo.id} />
            <input type="hidden" name="etapa" value="Perdeu" />
            {MOTIVOS_PERDA.map((motivo) => (
              <button
                key={motivo}
                type="submit"
                name="motivo_perda"
                value={motivo}
                className="botao-base botao-neutro w-full justify-start text-left text-lg"
              >
                {motivo}
              </button>
            ))}
          </form>
        </Janela>
      ) : null}
    </div>
  );
}

function CartaoLead({
  lead,
  hoje,
  ocupado,
  aoArrastar,
  aoMover,
  aoEditar,
}: {
  lead: Lead;
  hoje: string;
  ocupado: boolean;
  aoArrastar: () => void;
  aoMover: (etapa: Etapa) => void;
  aoEditar: () => void;
}) {
  const atrasado =
    lead.proximo_retorno !== null &&
    lead.proximo_retorno <= hoje &&
    lead.etapa !== "Fechou" &&
    lead.etapa !== "Perdeu";

  return (
    <li
      draggable
      onDragStart={aoArrastar}
      className={`rounded-xl border-2 p-3 ${
        atrasado ? "border-vermelho bg-vermelho-claro" : "border-borda bg-fundo"
      } ${ocupado ? "opacity-60" : ""}`}
    >
      <p className="text-lg font-black">{lead.nome}</p>

      <p className="numeros text-tinta-suave">
        {[
          lead.segmento,
          lead.valor_estimado ? reais(lead.valor_estimado) : null,
        ]
          .filter(Boolean)
          .join(" · ") || "Sem detalhes ainda"}
      </p>

      {lead.telefone ? (
        <p className="numeros text-tinta-suave">{telefoneBr(lead.telefone)}</p>
      ) : null}

      {lead.origem || lead.indicado_por ? (
        <p className="text-tinta-suave">
          {lead.origem ?? "Origem não anotada"}
          {lead.indicado_por ? ` — indicado por ${lead.indicado_por}` : ""}
        </p>
      ) : null}

      {lead.proximo_retorno ? (
        <p className={`numeros font-bold ${atrasado ? "text-vermelho" : ""}`}>
          Retornar em {dataBr(lead.proximo_retorno)}
          {atrasado ? " (atrasado)" : ""}
        </p>
      ) : null}

      {lead.motivo_perda ? (
        <p className="font-bold text-ambar">Motivo: {lead.motivo_perda}</p>
      ) : null}

      {lead.notas ? <p className="mt-1">{lead.notas}</p> : null}

      <div className="mt-3 space-y-2">
        <label className="rotulo text-base" htmlFor={`mover-${lead.id}`}>
          Mover para →
        </label>
        <select
          id={`mover-${lead.id}`}
          value={lead.etapa}
          onChange={(e) => aoMover(e.target.value as Etapa)}
          disabled={ocupado}
          className="campo"
        >
          {ETAPAS.map((etapa) => (
            <option key={etapa} value={etapa}>
              {etapa}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-2">
          <BotaoWhatsapp
            telefone={lead.telefone}
            rotulo="WhatsApp"
            className="botao-base botao-secundario !min-h-11 flex-1 !px-3"
          />
          <button
            type="button"
            onClick={aoEditar}
            className="botao-base botao-neutro !min-h-11 flex-1 !px-3"
          >
            Editar
          </button>
          <form
            action={excluirLead}
            onSubmit={(e) => {
              if (!confirm(`Apagar ${lead.nome} do funil?`)) e.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={lead.id} />
            <button
              type="submit"
              className="botao-base botao-neutro !min-h-11 !px-3 text-vermelho"
            >
              Apagar
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}
