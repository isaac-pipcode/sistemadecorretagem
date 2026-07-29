"use client";

import { useTransition } from "react";

import { somarAtividade } from "@/lib/acoes";
import { numero } from "@/lib/formato";

type Props = {
  campo: "contatos" | "reunioes" | "propostas";
  rotulo: string;
  feito: number;
  alvo: number;
  semanaInicio: string;
};

/** Um contador com botão "+1" grande, para usar durante o dia. */
export function ContadorSemana({
  campo,
  rotulo,
  feito,
  alvo,
  semanaInicio,
}: Props) {
  const [ocupado, iniciar] = useTransition();
  const bateu = feito >= alvo;

  function somar(passo: number) {
    const dados = new FormData();
    dados.set("campo", campo);
    dados.set("semana_inicio", semanaInicio);
    dados.set("passo", String(passo));
    iniciar(() => {
      void somarAtividade(dados);
    });
  }

  return (
    <div
      className={`carta p-4 ${bateu ? "border-verde bg-verde-claro" : ""} ${
        ocupado ? "opacity-70" : ""
      }`}
    >
      <p className="text-lg font-bold text-tinta-suave">{rotulo}</p>
      <p
        className={`numeros text-[34px] leading-tight font-black sm:text-[40px] ${
          bateu ? "text-verde" : ""
        }`}
      >
        {numero(feito)}
        <span className="text-xl font-bold text-tinta-suave">
          {" "}
          de {numero(alvo)}
        </span>
      </p>
      <p className={`font-bold ${bateu ? "text-verde" : "text-tinta-suave"}`}>
        {bateu ? "Alvo da semana batido!" : `Faltam ${numero(alvo - feito)}`}
      </p>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => somar(1)}
          disabled={ocupado}
          className="botao-base botao-principal flex-1 text-xl disabled:opacity-60"
        >
          +1
        </button>
        <button
          type="button"
          onClick={() => somar(-1)}
          disabled={ocupado || feito === 0}
          className="botao-base botao-neutro !px-4 text-xl disabled:opacity-40"
          aria-label={`Tirar um de ${rotulo}`}
        >
          −1
        </button>
      </div>
    </div>
  );
}
