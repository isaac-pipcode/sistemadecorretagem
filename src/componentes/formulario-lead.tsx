"use client";

import { useActionState, useEffect } from "react";

import { Aviso } from "@/componentes/aviso";
import { BotaoEnviar } from "@/componentes/botao-enviar";
import {
  CampoData,
  CampoLista,
  CampoMoeda,
  CampoNota,
  CampoTelefone,
  CampoTexto,
} from "@/componentes/campos";
import { salvarLead, type Resultado } from "@/lib/acoes";
import { ETAPAS, ORIGENS, SEGMENTOS, type Lead } from "@/lib/tipos";

type Props = { lead?: Lead | null; aoConcluir: () => void };

export function FormularioLead({ lead, aoConcluir }: Props) {
  const [resultado, acao] = useActionState<Resultado | null, FormData>(
    salvarLead,
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
      {lead ? <input type="hidden" name="id" value={lead.id} /> : null}

      <CampoTexto
        nome="nome"
        rotulo="Nome do interessado"
        obrigatorio
        valorInicial={lead?.nome ?? ""}
        placeholder="Ex.: Seu João da chácara"
      />

      <CampoTelefone
        nome="telefone"
        rotulo="Telefone (para o WhatsApp)"
        valorInicial={lead?.telefone ?? ""}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoLista
          nome="segmento"
          rotulo="Interesse"
          opcoes={SEGMENTOS}
          vazio="Ainda não sei"
          valorInicial={lead?.segmento ?? ""}
        />
        <CampoMoeda
          nome="valor_estimado"
          rotulo="Valor que ele pensa em fazer"
          valorInicial={
            lead?.valor_estimado != null
              ? lead.valor_estimado.toFixed(2).replace(".", "")
              : ""
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoLista
          nome="origem"
          rotulo="Como chegou até mim"
          opcoes={ORIGENS}
          vazio="Não sei / deixar em branco"
          valorInicial={lead?.origem ?? ""}
        />
        <CampoTexto
          nome="indicado_por"
          rotulo="Quem indicou"
          valorInicial={lead?.indicado_por ?? ""}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoLista
          nome="etapa"
          rotulo="Em que ponto está"
          obrigatorio
          opcoes={ETAPAS}
          valorInicial={lead?.etapa ?? "Novo contato"}
        />
        <CampoData
          nome="proximo_retorno"
          rotulo="Quando retornar"
          valorInicial={lead?.proximo_retorno ?? ""}
        />
      </div>

      <CampoNota
        nome="notas"
        rotulo="Anotações"
        valorInicial={lead?.notas ?? ""}
        placeholder="O que ele falou, o que combinamos…"
      />

      {resultado ? (
        <Aviso tipo={resultado.ok ? "sucesso" : "erro"}>
          {resultado.mensagem}
        </Aviso>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <BotaoEnviar className="botao-base botao-principal w-full text-lg sm:w-auto">
          {lead ? "Salvar" : "Anotar interessado"}
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
