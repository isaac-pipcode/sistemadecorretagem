export const SEGMENTOS = ["Imóveis", "Motos", "Serviços", "Agro"] as const;
export type Segmento = (typeof SEGMENTOS)[number];

export const STATUS_VENDA = [
  "Ativa",
  "Desistiu",
  "Contemplada",
  "Inválida",
] as const;
export type StatusVenda = (typeof STATUS_VENDA)[number];

export const ORIGENS = [
  "Indicação",
  "Carteira",
  "Parceria",
  "Prospecção",
] as const;
export type Origem = (typeof ORIGENS)[number];

export const ETAPAS = [
  "Novo contato",
  "Reunião marcada",
  "Proposta feita",
  "Fechou",
  "Perdeu",
] as const;
export type Etapa = (typeof ETAPAS)[number];

/** Colunas visíveis do quadro do funil. "Fechou" e "Perdeu" dividem a última. */
export const COLUNAS_FUNIL = [
  "Novo contato",
  "Reunião marcada",
  "Proposta feita",
  "Fechou / Perdeu",
] as const;

export const MOTIVOS_PERDA = [
  "Achou caro",
  "Sem crédito aprovado",
  "Comprou com concorrente",
  "Adiou a decisão",
  "Sumiu / não respondeu",
  "Outro motivo",
] as const;

/**
 * Temperatura pelo tempo sem contato — o sistema calcula, ela não marca nada.
 * O corte de 90 dias é o mesmo que a Carteira já usava no aviso vermelho.
 */
export const TEMPERATURAS = ["Quente", "Morno", "Frio"] as const;
export type Temperatura = (typeof TEMPERATURAS)[number];

export const DIAS_QUENTE = 30;
export const DIAS_MORNO = 90;

export function temperaturaPor(diasSemContato: number | null): Temperatura {
  if (diasSemContato === null) return "Frio"; // nunca houve contato
  if (diasSemContato <= DIAS_QUENTE) return "Quente";
  if (diasSemContato <= DIAS_MORNO) return "Morno";
  return "Frio";
}

/** Onde a pessoa está na vida comercial dela. */
export const SITUACOES = [
  "Convertido",
  "No funil",
  "Perdido",
  "Sem movimento",
] as const;
export type Situacao = (typeof SITUACOES)[number];

export type Venda = {
  id: string;
  cliente_id: string | null;
  nome_cliente: string;
  segmento: Segmento;
  grupo: string | null;
  cota: string | null;
  valor: number;
  data_venda: string;
  status: StatusVenda;
  origem: Origem | null;
  indicado_por: string | null;
  observacoes: string | null;
};

export type Cliente = {
  id: string;
  nome: string;
  telefone: string | null;
  cidade: string | null;
  ultima_conversa: string | null;
  proxima_acao: string | null;
  proxima_acao_data: string | null;
  indicacoes_pedidas: number | null;
};

export type Lead = {
  id: string;
  cliente_id: string | null;
  nome: string;
  telefone: string | null;
  segmento: string | null;
  valor_estimado: number | null;
  origem: string | null;
  indicado_por: string | null;
  etapa: Etapa;
  motivo_perda: string | null;
  proximo_retorno: string | null;
  notas: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type Semana = {
  id: string;
  semana_inicio: string;
  contatos: number;
  reunioes: number;
  propostas: number;
  vendas_qtd: number;
  vendas_valor: number;
};

export type MetasSemanais = {
  contatos: number;
  reunioes: number;
  propostas: number;
};

export const META_MENSAL_PADRAO = 1_000_000;
export const METAS_SEMANAIS_PADRAO: MetasSemanais = {
  contatos: 27,
  reunioes: 11,
  propostas: 7,
};
