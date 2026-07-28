"use client";

import { useId, useState } from "react";

import { telefoneBr } from "@/lib/formato";

type BaseProps = {
  nome: string;
  rotulo: string;
  valorInicial?: string;
  obrigatorio?: boolean;
  dica?: string;
};

/** Dinheiro com máscara automática: digita 150000 e vira 1.500,00. */
export function CampoMoeda({
  nome,
  rotulo,
  valorInicial = "",
  obrigatorio,
  dica,
}: BaseProps) {
  const id = useId();
  const [texto, setTexto] = useState(() => formatarMoeda(valorInicial));

  return (
    <div>
      <label className="rotulo" htmlFor={id}>
        {rotulo}
        {obrigatorio ? " *" : ""}
      </label>
      <div className="flex items-stretch">
        <span className="flex min-h-12 items-center rounded-l-xl border-2 border-r-0 border-borda bg-fundo px-3 font-bold">
          R$
        </span>
        <input
          id={id}
          name={nome}
          value={texto}
          onChange={(e) => setTexto(formatarMoeda(e.target.value))}
          inputMode="decimal"
          required={obrigatorio}
          placeholder="0,00"
          className="campo numeros !rounded-l-none text-right"
        />
      </div>
      {dica ? <p className="mt-1 text-tinta-suave">{dica}</p> : null}
    </div>
  );
}

function formatarMoeda(entrada: string): string {
  const numeros = (entrada ?? "").replace(/\D/g, "");
  if (!numeros) return "";
  const centavos = Number(numeros) / 100;
  return centavos.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Telefone com máscara (19) 99999-9999. */
export function CampoTelefone({
  nome,
  rotulo,
  valorInicial = "",
  dica,
}: BaseProps) {
  const id = useId();
  const [texto, setTexto] = useState(() => telefoneBr(valorInicial));

  return (
    <div>
      <label className="rotulo" htmlFor={id}>
        {rotulo}
      </label>
      <input
        id={id}
        name={nome}
        value={texto}
        onChange={(e) => setTexto(mascararTelefone(e.target.value))}
        inputMode="tel"
        placeholder="(19) 99999-9999"
        className="campo numeros"
      />
      {dica ? <p className="mt-1 text-tinta-suave">{dica}</p> : null}
    </div>
  );
}

function mascararTelefone(entrada: string): string {
  const d = (entrada ?? "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Campo de texto comum. */
export function CampoTexto({
  nome,
  rotulo,
  valorInicial = "",
  obrigatorio,
  dica,
  tipo = "text",
  placeholder,
}: BaseProps & { tipo?: string; placeholder?: string }) {
  const id = useId();
  return (
    <div>
      <label className="rotulo" htmlFor={id}>
        {rotulo}
        {obrigatorio ? " *" : ""}
      </label>
      <input
        id={id}
        name={nome}
        type={tipo}
        defaultValue={valorInicial}
        required={obrigatorio}
        placeholder={placeholder}
        className="campo"
      />
      {dica ? <p className="mt-1 text-tinta-suave">{dica}</p> : null}
    </div>
  );
}

/** Data com o calendário do próprio celular (mostra dia/mês/ano). */
export function CampoData({
  nome,
  rotulo,
  valorInicial = "",
  obrigatorio,
  dica,
}: BaseProps) {
  const id = useId();
  return (
    <div>
      <label className="rotulo" htmlFor={id}>
        {rotulo}
        {obrigatorio ? " *" : ""}
      </label>
      <input
        id={id}
        name={nome}
        type="date"
        defaultValue={valorInicial ? valorInicial.slice(0, 10) : ""}
        required={obrigatorio}
        className="campo numeros"
      />
      {dica ? <p className="mt-1 text-tinta-suave">{dica}</p> : null}
    </div>
  );
}

export function CampoLista({
  nome,
  rotulo,
  valorInicial = "",
  obrigatorio,
  opcoes,
  vazio,
  dica,
}: BaseProps & { opcoes: readonly string[]; vazio?: string }) {
  const id = useId();
  return (
    <div>
      <label className="rotulo" htmlFor={id}>
        {rotulo}
        {obrigatorio ? " *" : ""}
      </label>
      <select
        id={id}
        name={nome}
        defaultValue={valorInicial}
        required={obrigatorio}
        className="campo"
      >
        {vazio !== undefined ? <option value="">{vazio}</option> : null}
        {opcoes.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      {dica ? <p className="mt-1 text-tinta-suave">{dica}</p> : null}
    </div>
  );
}

export function CampoNota({
  nome,
  rotulo,
  valorInicial = "",
  linhas = 3,
  placeholder,
}: BaseProps & { linhas?: number; placeholder?: string }) {
  const id = useId();
  return (
    <div>
      <label className="rotulo" htmlFor={id}>
        {rotulo}
      </label>
      <textarea
        id={id}
        name={nome}
        rows={linhas}
        defaultValue={valorInicial}
        placeholder={placeholder}
        className="campo !min-h-24"
      />
    </div>
  );
}
