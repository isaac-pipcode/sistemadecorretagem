"use client";

import { useActionState } from "react";

import { Aviso } from "@/componentes/aviso";
import { BotaoEnviar } from "@/componentes/botao-enviar";
import { CampoTexto } from "@/componentes/campos";
import { salvarSemana, type Resultado } from "@/lib/acoes";

type Props = {
  semanaInicio: string;
  contatos: number;
  reunioes: number;
  propostas: number;
};

/** Ajuste manual, para quando os botões "+1" não deram conta. */
export function FormularioSemana({
  semanaInicio,
  contatos,
  reunioes,
  propostas,
}: Props) {
  const [resultado, acao] = useActionState<Resultado | null, FormData>(
    salvarSemana,
    null,
  );

  return (
    <form action={acao} className="space-y-4">
      <input type="hidden" name="semana_inicio" value={semanaInicio} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CampoTexto
          nome="contatos"
          rotulo="Contatos novos"
          tipo="number"
          valorInicial={String(contatos)}
        />
        <CampoTexto
          nome="reunioes"
          rotulo="Reuniões"
          tipo="number"
          valorInicial={String(reunioes)}
        />
        <CampoTexto
          nome="propostas"
          rotulo="Propostas"
          tipo="number"
          valorInicial={String(propostas)}
        />
      </div>

      {resultado ? (
        <Aviso tipo={resultado.ok ? "sucesso" : "erro"}>
          {resultado.mensagem}
        </Aviso>
      ) : null}

      <BotaoEnviar className="botao-base botao-principal w-full text-lg sm:w-auto">
        Salvar números da semana
      </BotaoEnviar>
    </form>
  );
}
