"use client";

import { useMemo, useState } from "react";

import { BotaoWhatsapp } from "@/componentes/botao-whatsapp";
import { FormularioConversa } from "@/componentes/formulario-conversa";
import { Janela } from "@/componentes/janela";
import { dataBr, numero, reais, telefoneBr } from "@/lib/formato";
import { SITUACOES, TEMPERATURAS } from "@/lib/tipos";
import type { Situacao, Temperatura } from "@/lib/tipos";

export type ItemLead = {
  id: string;
  nome: string;
  telefone: string | null;
  segmentos: string[];
  cotas: number;
  valorTotal: number;
  valorEstimado: number | null;
  situacao: Situacao;
  temperatura: Temperatura;
  diasSemContato: number | null;
  ultimoContato: string | null;
  etapa: string | null;
  motivoPerda: string | null;
};

/**
 * A inicial usada no índice. Tira o acento antes, senão "Ângela" cairia numa
 * letra própria, longe de "Amanda".
 */
function inicial(nome: string): string {
  const letra = nome
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .charAt(0)
    .toUpperCase();
  return /[A-Z]/.test(letra) ? letra : "#";
}

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const COR_TEMPERATURA: Record<Temperatura, string> = {
  Quente: "bg-verde-claro text-verde",
  Morno: "bg-ambar-claro text-ambar",
  Frio: "bg-vermelho-claro text-vermelho",
};

const COR_SITUACAO: Record<Situacao, string> = {
  Convertido: "bg-verde-claro text-verde",
  "No funil": "bg-grafite-claro text-grafite",
  Perdido: "bg-fundo text-tinta-suave",
  "Sem movimento": "bg-fundo text-tinta-suave",
};

export function ListaLeads({ itens }: { itens: ItemLead[] }) {
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState<Situacao | "Todas">("Todas");
  const [temperatura, setTemperatura] = useState<Temperatura | "Todas">(
    "Todas",
  );
  const [conversando, setConversando] = useState<ItemLead | null>(null);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return itens.filter((i) => {
      if (termo && !i.nome.toLowerCase().includes(termo)) return false;
      if (situacao !== "Todas" && i.situacao !== situacao) return false;
      if (temperatura !== "Todas" && i.temperatura !== temperatura)
        return false;
      return true;
    });
  }, [itens, busca, situacao, temperatura]);

  // Uma seção por letra, na ordem do alfabeto, com "#" no fim para quem
  // começa com número ou símbolo.
  const secoes = useMemo(() => {
    const mapa = new Map<string, ItemLead[]>();
    for (const item of lista) {
      const letra = inicial(item.nome);
      mapa.set(letra, [...(mapa.get(letra) ?? []), item]);
    }
    return [...mapa.entries()].sort(([a], [b]) => {
      if (a === "#") return 1;
      if (b === "#") return -1;
      return a.localeCompare(b, "pt-BR");
    });
  }, [lista]);

  const comLetra = new Set(secoes.map(([letra]) => letra));
  const contar = (s: Situacao) => itens.filter((i) => i.situacao === s).length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-marca">Leads</h1>

      <div className="carta bg-marca-clara p-4">
        <p className="font-bold">
          {numero(itens.length)} pessoas na lista — todo mundo que já passou
          pelas suas mãos.
        </p>
        <p className="numeros font-bold text-tinta-suave">
          {numero(contar("Convertido"))} compraram ·{" "}
          {numero(contar("No funil"))} no funil ·{" "}
          {numero(contar("Perdido"))} perdidas ·{" "}
          {numero(contar("Sem movimento"))} paradas
        </p>
      </div>

      <div className="carta space-y-4 p-4">
        <div>
          <label className="rotulo" htmlFor="busca-leads">
            Procurar pessoa
          </label>
          <input
            id="busca-leads"
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="campo"
            placeholder="Ex.: Rose"
          />
        </div>

        <Filtro
          rotulo="Situação"
          opcoes={SITUACOES}
          valor={situacao}
          aoEscolher={setSituacao}
        />
        <Filtro
          rotulo="Temperatura"
          opcoes={TEMPERATURAS}
          valor={temperatura}
          aoEscolher={setTemperatura}
          dica="Quente: falou faz até 30 dias · Morno: até 90 · Frio: mais que isso"
        />
      </div>

      {/* Índice A-Z: letra sem ninguém fica apagada e não clica. */}
      <nav aria-label="Ir para a letra" className="carta p-2">
        <ul className="flex flex-wrap justify-center gap-1">
          {ALFABETO.concat(comLetra.has("#") ? ["#"] : []).map((letra) => {
            const tem = comLetra.has(letra);
            return (
              <li key={letra}>
                {tem ? (
                  <a
                    href={`#letra-${letra}`}
                    className="flex h-10 w-10 items-center justify-center rounded-lg font-black text-marca hover:bg-marca-clara"
                  >
                    {letra}
                  </a>
                ) : (
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-lg font-black text-borda-forte"
                  >
                    {letra}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {secoes.map(([letra, pessoas]) => (
        <section key={letra} aria-labelledby={`letra-${letra}`}>
          <h2
            id={`letra-${letra}`}
            className="scroll-mt-36 border-b-4 border-marca pb-1 text-2xl font-black text-marca"
          >
            {letra}
            <span className="ml-2 text-base font-bold text-tinta-suave">
              {numero(pessoas.length)}{" "}
              {pessoas.length === 1 ? "pessoa" : "pessoas"}
            </span>
          </h2>

          <ul className="mt-3 space-y-3">
            {pessoas.map((item) => (
              <li key={item.id} className="carta p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="min-w-0 text-xl font-black text-marca">
                    {item.nome}
                  </p>
                  {item.valorTotal > 0 ? (
                    <p className="numeros text-lg font-black">
                      {reais(item.valorTotal)}
                    </p>
                  ) : item.valorEstimado ? (
                    <p className="numeros font-bold text-tinta-suave">
                      {reais(item.valorEstimado)} estimados
                    </p>
                  ) : null}
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`etiqueta ${COR_TEMPERATURA[item.temperatura]}`}
                  >
                    {item.temperatura}
                  </span>
                  <span className={`etiqueta ${COR_SITUACAO[item.situacao]}`}>
                    {item.situacao === "No funil" && item.etapa
                      ? item.etapa
                      : item.situacao}
                  </span>
                </div>

                <p className="numeros mt-2 text-tinta-suave">
                  {item.cotas > 0
                    ? `${item.segmentos.join(", ")} · ${numero(item.cotas)} ${
                        item.cotas === 1 ? "cota" : "cotas"
                      }`
                    : "Ainda não comprou"}
                  {item.telefone ? ` · ${telefoneBr(item.telefone)}` : ""}
                </p>

                <p className="numeros text-tinta-suave">
                  {item.ultimoContato
                    ? `Último contato: ${dataBr(item.ultimoContato)} — faz ${numero(
                        item.diasSemContato ?? 0,
                      )} dias`
                    : "Nunca registrei um contato"}
                  {item.motivoPerda ? ` · Perdeu: ${item.motivoPerda}` : ""}
                </p>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <BotaoWhatsapp
                    telefone={item.telefone}
                    className="botao-base botao-secundario sm:flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => setConversando(item)}
                    className="botao-base botao-principal sm:flex-1"
                  >
                    Registrar conversa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {lista.length === 0 ? (
        <p className="carta p-5 text-center text-lg font-bold text-tinta-suave">
          Ninguém com esses filtros.
        </p>
      ) : null}

      {conversando ? (
        <Janela
          titulo={`Conversa com ${conversando.nome}`}
          aoFechar={() => setConversando(null)}
        >
          <FormularioConversa
            clienteId={conversando.id}
            aoConcluir={() => setConversando(null)}
          />
        </Janela>
      ) : null}
    </div>
  );
}

function Filtro<T extends string>({
  rotulo,
  opcoes,
  valor,
  aoEscolher,
  dica,
}: {
  rotulo: string;
  opcoes: readonly T[];
  valor: T | "Todas";
  aoEscolher: (v: T | "Todas") => void;
  dica?: string;
}) {
  return (
    <div>
      <p className="rotulo">{rotulo}</p>
      <div className="flex flex-wrap gap-2">
        {(["Todas", ...opcoes] as (T | "Todas")[]).map((opcao) => {
          const ativa = valor === opcao;
          return (
            <button
              key={opcao}
              type="button"
              aria-pressed={ativa}
              onClick={() => aoEscolher(opcao)}
              className={`botao-base !min-h-11 !rounded-full !px-4 ${
                ativa ? "botao-principal" : "botao-neutro"
              }`}
            >
              {opcao}
            </button>
          );
        })}
      </div>
      {dica ? <p className="mt-1.5 text-tinta-suave">{dica}</p> : null}
    </div>
  );
}
