"use client";

import { useMemo, useState } from "react";

import { FormularioVenda } from "@/componentes/formulario-venda";
import { Janela } from "@/componentes/janela";
import { excluirVenda } from "@/lib/acoes";
import { dataBr, numero, reais } from "@/lib/formato";
import { SEGMENTOS, STATUS_VENDA, type Venda } from "@/lib/tipos";

type Props = { vendas: Venda[]; anos: string[] };

type Ordem = "data" | "valor";

const CORES_STATUS: Record<string, string> = {
  Ativa: "bg-carta",
  Contemplada: "bg-verde-claro",
  Desistiu: "bg-ambar-claro",
  Inválida: "bg-fundo text-tinta-suave line-through decoration-1",
};

export function TabelaVendas({ vendas, anos }: Props) {
  const [ano, setAno] = useState("todos");
  const [segmento, setSegmento] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("data");
  const [editando, setEditando] = useState<Venda | null>(null);
  const [criando, setCriando] = useState(false);

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = vendas.filter((v) => {
      if (ano !== "todos" && !v.data_venda.startsWith(ano)) return false;
      if (segmento !== "todos" && v.segmento !== segmento) return false;
      if (status !== "todos" && v.status !== status) return false;
      if (termo && !v.nome_cliente.toLowerCase().includes(termo)) return false;
      return true;
    });
    return lista.sort((a, b) =>
      ordem === "valor"
        ? b.valor - a.valor
        : b.data_venda.localeCompare(a.data_venda),
    );
  }, [vendas, ano, segmento, status, busca, ordem]);

  const validas = filtradas.filter((v) => v.status !== "Inválida");
  const total = validas.reduce((soma, v) => soma + v.valor, 0);

  function fechar() {
    setEditando(null);
    setCriando(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">Vendas</h1>
        <button
          type="button"
          onClick={() => setCriando(true)}
          className="botao-base botao-principal w-full text-lg sm:w-auto"
        >
          + Registrar venda
        </button>
      </div>

      <div className="carta grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="rotulo" htmlFor="filtro-busca">
            Procurar pelo nome
          </label>
          <input
            id="filtro-busca"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="campo"
            placeholder="Ex.: Castilho"
            type="search"
          />
        </div>
        <div>
          <label className="rotulo" htmlFor="filtro-ano">
            Ano
          </label>
          <select
            id="filtro-ano"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            className="campo"
          >
            <option value="todos">Todos os anos</option>
            {anos.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="rotulo" htmlFor="filtro-segmento">
            Segmento
          </label>
          <select
            id="filtro-segmento"
            value={segmento}
            onChange={(e) => setSegmento(e.target.value)}
            className="campo"
          >
            <option value="todos">Todos os segmentos</option>
            {SEGMENTOS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="rotulo" htmlFor="filtro-status">
            Situação
          </label>
          <select
            id="filtro-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="campo"
          >
            <option value="todos">Todas as situações</option>
            {STATUS_VENDA.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="rotulo" htmlFor="filtro-ordem">
            Ordenar por
          </label>
          <select
            id="filtro-ordem"
            value={ordem}
            onChange={(e) => setOrdem(e.target.value as Ordem)}
            className="campo"
          >
            <option value="data">Data (mais nova primeiro)</option>
            <option value="valor">Valor (maior primeiro)</option>
          </select>
        </div>
      </div>

      <div className="carta bg-marca-clara p-4">
        <p className="text-base font-bold text-tinta-suave">
          Total do que está aparecendo (sem as inválidas)
        </p>
        <p className="numeros text-[28px] leading-tight font-black sm:text-[34px]">
          {reais(total)}
        </p>
        <p className="numeros font-bold text-tinta-suave">
          {numero(validas.length)} {validas.length === 1 ? "cota" : "cotas"} de{" "}
          {numero(filtradas.length)}{" "}
          {filtradas.length === 1 ? "registro" : "registros"}
        </p>
      </div>

      {/* Celular: um cartão por venda */}
      <ul className="space-y-3 md:hidden">
        {filtradas.map((v) => (
          <li
            key={v.id}
            className={`carta p-4 ${CORES_STATUS[v.status] ?? "bg-carta"}`}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-lg font-black">{v.nome_cliente}</p>
              <p className="numeros text-lg font-black">{reais(v.valor)}</p>
            </div>
            <p className="numeros text-tinta-suave">
              {v.segmento} · {dataBr(v.data_venda)} · {v.status}
            </p>
            <p className="numeros text-tinta-suave">
              Grupo {v.grupo ?? "—"} · Cota {v.cota ?? "—"}
              {v.origem ? ` · ${v.origem}` : ""}
            </p>
            {v.observacoes ? (
              <p className="mt-2 rounded-xl border-2 border-borda bg-fundo px-3 py-2">
                {v.observacoes}
              </p>
            ) : null}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setEditando(v)}
                className="botao-base botao-secundario flex-1"
              >
                Corrigir
              </button>
              <FormularioExcluir id={v.id} nome={v.nome_cliente} />
            </div>
          </li>
        ))}
      </ul>

      {/* Notebook: tabela completa */}
      <div className="carta hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Todas as vendas registradas</caption>
          <thead>
            <tr className="border-b-2 border-borda bg-fundo">
              {[
                "Nome",
                "Segmento",
                "Grupo",
                "Cota",
                "Valor",
                "Data",
                "Situação",
                "Origem",
                "Observações",
                "",
              ].map((coluna) => (
                <th key={coluna} scope="col" className="px-3 py-3 font-black">
                  {coluna}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.map((v) => (
              <tr
                key={v.id}
                className={`border-b-2 border-borda align-top ${
                  CORES_STATUS[v.status] ?? ""
                }`}
              >
                <td className="px-3 py-3 font-bold">{v.nome_cliente}</td>
                <td className="px-3 py-3">{v.segmento}</td>
                <td className="numeros px-3 py-3">{v.grupo ?? "—"}</td>
                <td className="numeros px-3 py-3">{v.cota ?? "—"}</td>
                <td className="numeros px-3 py-3 font-bold whitespace-nowrap">
                  {reais(v.valor)}
                </td>
                <td className="numeros px-3 py-3 whitespace-nowrap">
                  {dataBr(v.data_venda)}
                </td>
                <td className="px-3 py-3">{v.status}</td>
                <td className="px-3 py-3">{v.origem ?? "—"}</td>
                <td className="max-w-64 px-3 py-3">{v.observacoes ?? ""}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditando(v)}
                      className="botao-base botao-secundario !min-h-11 !px-3"
                    >
                      Corrigir
                    </button>
                    <FormularioExcluir id={v.id} nome={v.nome_cliente} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-marca-clara">
              <td colSpan={4} className="px-3 py-3 font-black">
                Total do período filtrado
              </td>
              <td className="numeros px-3 py-3 font-black whitespace-nowrap">
                {reais(total)}
              </td>
              <td colSpan={5} className="numeros px-3 py-3 font-bold">
                {numero(validas.length)} cotas
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {filtradas.length === 0 ? (
        <p className="carta p-5 text-center text-lg font-bold text-tinta-suave">
          Nenhuma venda com esses filtros.
        </p>
      ) : null}

      {criando ? (
        <Janela titulo="Registrar venda" aoFechar={fechar}>
          <FormularioVenda aoConcluir={fechar} />
        </Janela>
      ) : null}

      {editando ? (
        <Janela titulo="Corrigir venda" aoFechar={fechar}>
          <FormularioVenda venda={editando} aoConcluir={fechar} />
        </Janela>
      ) : null}
    </div>
  );
}

function FormularioExcluir({ id, nome }: { id: string; nome: string }) {
  return (
    <form
      action={excluirVenda}
      onSubmit={(e) => {
        if (!confirm(`Apagar a venda de ${nome}? Isso não volta atrás.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="botao-base botao-neutro !min-h-11 !px-3 text-vermelho"
      >
        Apagar
      </button>
    </form>
  );
}
