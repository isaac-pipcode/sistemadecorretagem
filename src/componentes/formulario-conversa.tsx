"use client";

import { useActionState, useEffect } from "react";

import { Aviso } from "@/componentes/aviso";
import { BotaoEnviar } from "@/componentes/botao-enviar";
import { CampoNota } from "@/componentes/campos";
import { registrarConversa, type Resultado } from "@/lib/acoes";

/**
 * Registrar conversa — usado na Carteira e em Leads. É o que esquenta de novo
 * uma pessoa: a temperatura sai do tempo desde o último contato.
 */
export function FormularioConversa({
  clienteId,
  aoConcluir,
}: {
  clienteId: string;
  aoConcluir: () => void;
}) {
  const [resultado, acao] = useActionState<Resultado | null, FormData>(
    registrarConversa,
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
      <input type="hidden" name="cliente_id" value={clienteId} />
      <p className="text-tinta-suave">
        A data de hoje entra sozinha. Escreva só o que foi conversado.
      </p>
      <CampoNota
        nome="nota"
        rotulo="O que foi conversado"
        placeholder="Ex.: liguei, ela vai pensar na cota de imóvel para janeiro"
        linhas={4}
      />
      {resultado ? (
        <Aviso tipo={resultado.ok ? "sucesso" : "erro"}>
          {resultado.mensagem}
        </Aviso>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <BotaoEnviar className="botao-base botao-principal w-full text-lg sm:w-auto">
          Salvar conversa
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
