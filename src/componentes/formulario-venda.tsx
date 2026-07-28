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
import { fecharLead, salvarVenda, type Resultado } from "@/lib/acoes";
import { hojeIso } from "@/lib/formato";
import { ORIGENS, SEGMENTOS, STATUS_VENDA, type Venda } from "@/lib/tipos";

type Props = {
  /** Venda existente, quando é correção. */
  venda?: Venda | null;
  /** Valores já preenchidos vindos do funil. */
  inicial?: {
    nome_cliente?: string;
    telefone?: string;
    segmento?: string;
    valor?: number;
    origem?: string;
    indicado_por?: string;
    observacoes?: string;
  };
  /** Quando vem do funil: id do interessado que vai virar "Fechou". */
  leadId?: string;
  aoConcluir: () => void;
};

export function FormularioVenda({ venda, inicial, leadId, aoConcluir }: Props) {
  const acaoBase = leadId ? fecharLead : salvarVenda;
  const [resultado, acao] = useActionState<Resultado | null, FormData>(
    acaoBase,
    null,
  );

  useEffect(() => {
    if (resultado?.ok) {
      const espera = setTimeout(aoConcluir, 900);
      return () => clearTimeout(espera);
    }
  }, [resultado, aoConcluir]);

  const valorInicial =
    venda?.valor != null
      ? venda.valor.toFixed(2).replace(".", "")
      : inicial?.valor != null
        ? inicial.valor.toFixed(2).replace(".", "")
        : "";

  return (
    <form action={acao} className="space-y-4">
      {venda ? <input type="hidden" name="id" value={venda.id} /> : null}
      {leadId ? <input type="hidden" name="lead_id" value={leadId} /> : null}

      <CampoTexto
        nome="nome_cliente"
        rotulo="Nome do cliente"
        obrigatorio
        valorInicial={venda?.nome_cliente ?? inicial?.nome_cliente ?? ""}
        placeholder="Ex.: Maria Aparecida"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoLista
          nome="segmento"
          rotulo="Segmento"
          obrigatorio
          opcoes={SEGMENTOS}
          valorInicial={venda?.segmento ?? inicial?.segmento ?? "Imóveis"}
          dica="Agro: tratores, máquinas, colheitadeiras e caminhões."
        />
        <CampoMoeda
          nome="valor"
          rotulo="Valor da cota"
          obrigatorio
          valorInicial={valorInicial}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoData
          nome="data_venda"
          rotulo="Data da venda"
          obrigatorio
          valorInicial={venda?.data_venda ?? hojeIso()}
        />
        <CampoLista
          nome="status"
          rotulo="Situação"
          obrigatorio
          opcoes={STATUS_VENDA}
          valorInicial={venda?.status ?? "Ativa"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoTexto
          nome="grupo"
          rotulo="Grupo"
          valorInicial={venda?.grupo ?? ""}
          placeholder="Ex.: 1180"
        />
        <CampoTexto
          nome="cota"
          rotulo="Cota"
          valorInicial={venda?.cota ?? ""}
          placeholder="Ex.: 602"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <CampoLista
          nome="origem"
          rotulo="Como chegou até mim"
          opcoes={ORIGENS}
          vazio="Não sei / deixar em branco"
          valorInicial={venda?.origem ?? inicial?.origem ?? ""}
        />
        <CampoTexto
          nome="indicado_por"
          rotulo="Quem indicou"
          valorInicial={venda?.indicado_por ?? inicial?.indicado_por ?? ""}
        />
      </div>

      {venda ? null : (
        <CampoTelefone
          nome="telefone"
          rotulo="Telefone (vai para a Carteira)"
          valorInicial={inicial?.telefone ?? ""}
        />
      )}

      <CampoNota
        nome="observacoes"
        rotulo="Observações"
        valorInicial={venda?.observacoes ?? inicial?.observacoes ?? ""}
        placeholder="Anote aqui o que precisa conferir depois"
      />

      {resultado ? (
        <Aviso tipo={resultado.ok ? "sucesso" : "erro"}>
          {resultado.mensagem}
        </Aviso>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <BotaoEnviar className="botao-base botao-principal w-full text-lg sm:w-auto">
          {venda ? "Salvar correção" : "Registrar venda"}
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
