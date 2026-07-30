"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { Aviso } from "@/componentes/aviso";
import { BotaoEnviar } from "@/componentes/botao-enviar";
import { BotaoWhatsapp } from "@/componentes/botao-whatsapp";
import { CampoData, CampoTelefone, CampoTexto } from "@/componentes/campos";
import { FormularioConversa } from "@/componentes/formulario-conversa";
import { Janela } from "@/componentes/janela";
import { salvarCliente, type Resultado } from "@/lib/acoes";
import { dataBr, numero, reais, telefoneBr } from "@/lib/formato";

export type ItemCarteira = {
  id: string;
  nome: string;
  telefone: string | null;
  segmentos: string[];
  cotas: number;
  valorTotal: number;
  ultimoNegocio: string | null;
  statusCotas: string[];
  ultimaConversa: string | null;
  ultimaNota: string | null;
  proximaAcao: string | null;
  proximaAcaoData: string | null;
  indicacoesPedidas: number;
  diasSemContato: number | null;
};

type Props = { itens: ItemCarteira[] };

export function ListaCarteira({ itens }: Props) {
  const [busca, setBusca] = useState("");
  const [conversando, setConversando] = useState<ItemCarteira | null>(null);
  const [editando, setEditando] = useState<ItemCarteira | null>(null);

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return itens;
    return itens.filter((i) => i.nome.toLowerCase().includes(termo));
  }, [itens, busca]);

  const esfriando = itens.filter(
    (i) => i.diasSemContato !== null && i.diasSemContato > 90,
  ).length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black text-marca">Carteira</h1>

      <div className="carta bg-marca-clara p-4">
        <p className="font-bold">
          {numero(itens.length)} clientes com cota ativa ou contemplada.
        </p>
        <p className="numeros font-bold text-tinta-suave">
          {numero(esfriando)} sem contato há mais de 90 dias — comece por eles,
          estão no topo da lista.
        </p>
        <p className="mt-1 text-tinta-suave">
          Aqui entra só quem comprou. Quem desistiu, quem está no funil e quem
          nunca fechou ficam na aba <strong>Leads</strong>.
        </p>
      </div>

      <div className="carta p-4">
        <label className="rotulo" htmlFor="busca-carteira">
          Procurar cliente
        </label>
        <input
          id="busca-carteira"
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="campo"
          placeholder="Ex.: Rose"
        />
      </div>

      <ul className="space-y-3">
        {lista.map((item) => {
          const frio = item.diasSemContato !== null && item.diasSemContato > 90;
          return (
            <li
              key={item.id}
              className={`carta p-4 ${frio ? "border-vermelho" : ""}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                {/* min-w-0: sem isto o item de flex se recusa a encolher e
                    um nome comprido estica o cartão para fora da tela. */}
                <p className="min-w-0 text-xl font-black text-marca">
                  {item.nome}
                </p>
                <p className="numeros text-lg font-black">
                  {reais(item.valorTotal)}
                </p>
              </div>

              <p className="numeros text-tinta-suave">
                {item.segmentos.length > 0
                  ? item.segmentos.join(", ")
                  : "Sem venda registrada"}{" "}
                · {numero(item.cotas)} {item.cotas === 1 ? "cota" : "cotas"}
                {item.statusCotas.length > 0
                  ? ` · ${item.statusCotas.join(", ")}`
                  : ""}
              </p>

              <p className="numeros text-tinta-suave">
                Último negócio: {dataBr(item.ultimoNegocio)}
                {item.telefone ? ` · ${telefoneBr(item.telefone)}` : ""}
              </p>

              {frio ? (
                <p className="numeros mt-2 rounded-xl border-2 border-vermelho bg-vermelho-claro px-3 py-2 font-bold text-vermelho">
                  Sem falar com você há {numero(item.diasSemContato)} dias
                </p>
              ) : null}

              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-xl border-2 border-borda bg-fundo px-3 py-2">
                  <p className="font-bold">Última conversa</p>
                  <p className="numeros">
                    {item.ultimaConversa
                      ? dataBr(item.ultimaConversa)
                      : "Ainda não anotei"}
                  </p>
                  {item.ultimaNota ? <p>{item.ultimaNota}</p> : null}
                </div>
                <div className="rounded-xl border-2 border-borda bg-fundo px-3 py-2">
                  <p className="font-bold">Próxima ação</p>
                  <p className="numeros">
                    {item.proximaAcao
                      ? `${item.proximaAcao}${
                          item.proximaAcaoData
                            ? ` — ${dataBr(item.proximaAcaoData)}`
                            : ""
                        }`
                      : "Nada combinado"}
                  </p>
                  <p className="numeros text-tinta-suave">
                    Pedi indicação:{" "}
                    {item.indicacoesPedidas > 0
                      ? `sim (${numero(item.indicacoesPedidas)})`
                      : "não"}
                  </p>
                </div>
              </div>

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
                <button
                  type="button"
                  onClick={() => setEditando(item)}
                  className="botao-base botao-neutro sm:flex-1"
                >
                  Editar dados
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {lista.length === 0 ? (
        <p className="carta p-5 text-center text-lg font-bold text-tinta-suave">
          Nenhum cliente com esse nome.
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

      {editando ? (
        <Janela
          titulo={`Dados de ${editando.nome}`}
          aoFechar={() => setEditando(null)}
        >
          <FormularioCliente
            item={editando}
            aoConcluir={() => setEditando(null)}
          />
        </Janela>
      ) : null}
    </div>
  );
}

function FormularioCliente({
  item,
  aoConcluir,
}: {
  item: ItemCarteira;
  aoConcluir: () => void;
}) {
  const [resultado, acao] = useActionState<Resultado | null, FormData>(
    salvarCliente,
    null,
  );

  useEffect(() => {
    if (resultado?.ok) {
      const espera = setTimeout(aoConcluir, 900);
      return () => clearTimeout(espera);
    }
  }, [resultado, aoConcluir]);

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="id" value={item.id} />

      <CampoTelefone
        nome="telefone"
        rotulo="Telefone"
        valorInicial={item.telefone ?? ""}
      />

      <CampoTexto
        nome="proxima_acao"
        rotulo="Próxima ação"
        valorInicial={item.proximaAcao ?? ""}
        placeholder="Ex.: ligar para oferecer cota de moto"
      />

      <CampoData
        nome="proxima_acao_data"
        rotulo="Quando fazer"
        valorInicial={item.proximaAcaoData ?? ""}
      />

      <CampoTexto
        nome="indicacoes_pedidas"
        rotulo="Quantas indicações já pedi"
        tipo="number"
        valorInicial={String(item.indicacoesPedidas)}
      />

      {resultado ? (
        <Aviso tipo={resultado.ok ? "sucesso" : "erro"}>
          {resultado.mensagem}
        </Aviso>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <BotaoEnviar className="botao-base botao-principal w-full text-lg sm:w-auto">
          Salvar
        </BotaoEnviar>
        <button
          type="button"
          onClick={aoConcluir}
          className="botao-base botao-neutro w-full sm:w-auto"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
