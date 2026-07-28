import "server-only";

import { criarClienteServidor } from "@/lib/supabase/servidor";
import {
  diasEntre,
  hojeIso,
  segundaDaSemana,
  somarDias,
  ultimosMeses,
} from "@/lib/formato";
import {
  META_MENSAL_PADRAO,
  METAS_SEMANAIS_PADRAO,
  SEGMENTOS,
  type Cliente,
  type Lead,
  type MetasSemanais,
  type Segmento,
  type Semana,
  type Venda,
} from "@/lib/tipos";

export type Conversa = {
  id: string;
  cliente_id: string;
  data: string;
  nota: string | null;
};

/** Vendas contam para os totais, exceto as marcadas como 'Inválida'. */
export function valem(vendas: Venda[]): Venda[] {
  return vendas.filter((v) => v.status !== "Inválida");
}

export async function listarVendas(): Promise<Venda[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("vendas")
    .select("*")
    .order("data_venda", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((v) => ({ ...v, valor: Number(v.valor) })) as Venda[];
}

export async function listarClientes(): Promise<Cliente[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.from("clientes").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as Cliente[];
}

export async function listarLeads(): Promise<Lead[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("atualizado_em", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((l) => ({
    ...l,
    valor_estimado: l.valor_estimado === null ? null : Number(l.valor_estimado),
  })) as Lead[];
}

export async function listarSemanas(): Promise<Semana[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("atividade_semanal")
    .select("*")
    .order("semana_inicio", { ascending: false })
    .limit(60);
  if (error) throw new Error(error.message);
  return (data ?? []).map((s) => ({
    ...s,
    vendas_valor: Number(s.vendas_valor ?? 0),
  })) as Semana[];
}

export async function listarConversas(): Promise<Conversa[]> {
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase
    .from("conversas")
    .select("*")
    .order("data", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Conversa[];
}

export async function carregarMetas(): Promise<{
  metaMensal: number;
  metasSemanais: MetasSemanais;
}> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("config").select("chave, valor");
  const mapa = new Map((data ?? []).map((c) => [c.chave, c.valor]));
  const mensal = Number(mapa.get("meta_mensal") ?? META_MENSAL_PADRAO);
  const semanais = (mapa.get("metas_semanais") ??
    METAS_SEMANAIS_PADRAO) as MetasSemanais;
  return {
    metaMensal:
      Number.isFinite(mensal) && mensal > 0 ? mensal : META_MENSAL_PADRAO,
    metasSemanais: { ...METAS_SEMANAIS_PADRAO, ...semanais },
  };
}

export function somar(vendas: Venda[]): number {
  return vendas.reduce((total, v) => total + v.valor, 0);
}

/** Resumo do mês corrente: total, nº de cotas e total sem as desistências. */
export function resumoDoMes(vendas: Venda[], hoje: string) {
  const mes = hoje.slice(0, 7);
  const doMes = valem(vendas).filter((v) => v.data_venda.startsWith(mes));
  return {
    valor: somar(doMes),
    cotas: doMes.length,
    valorFirme: somar(doMes.filter((v) => v.status !== "Desistiu")),
  };
}

export function resumoDoAno(vendas: Venda[], hoje: string) {
  const ano = hoje.slice(0, 4);
  const doAno = valem(vendas).filter((v) => v.data_venda.startsWith(ano));
  return {
    valor: somar(doAno),
    cotas: doAno.length,
    valorFirme: somar(doAno.filter((v) => v.status !== "Desistiu")),
  };
}

/** Média do valor das vendas dos últimos 12 meses. */
export function ticketMedio12Meses(vendas: Venda[], hoje: string): number {
  const inicio = somarDias(hoje, -365);
  const recentes = valem(vendas).filter((v) => v.data_venda >= inicio);
  if (recentes.length === 0) return 0;
  return somar(recentes) / recentes.length;
}

export function diasDesdeUltimaVenda(
  vendas: Venda[],
  hoje: string,
): number | null {
  const validas = valem(vendas).filter((v) => v.data_venda <= hoje);
  if (validas.length === 0) return null;
  const ultima = validas.reduce(
    (max, v) => (v.data_venda > max ? v.data_venda : max),
    validas[0].data_venda,
  );
  return diasEntre(ultima, hoje);
}

export function taxaDeDesistencia(vendas: Venda[]): number {
  const base = valem(vendas);
  if (base.length === 0) return 0;
  return base.filter((v) => v.status === "Desistiu").length / base.length;
}

/** Valor vendido por mês nos últimos `meses` meses. */
export function vendasPorMes(vendas: Venda[], hoje: string, meses = 18) {
  const chaves = ultimosMeses(hoje, meses);
  const acumulado = new Map(chaves.map((c) => [c, 0]));
  for (const v of valem(vendas)) {
    const chave = v.data_venda.slice(0, 7);
    if (acumulado.has(chave)) {
      acumulado.set(chave, acumulado.get(chave)! + v.valor);
    }
  }
  return chaves.map((chave) => ({ mes: chave, valor: acumulado.get(chave)! }));
}

/** Vendas por segmento no ano corrente — sempre com os 4 segmentos. */
export function vendasPorSegmento(vendas: Venda[], hoje: string) {
  const ano = hoje.slice(0, 4);
  const doAno = valem(vendas).filter((v) => v.data_venda.startsWith(ano));
  return SEGMENTOS.map((segmento) => {
    const doSegmento = doAno.filter((v) => v.segmento === segmento);
    return {
      segmento: segmento as Segmento,
      valor: somar(doSegmento),
      cotas: doSegmento.length,
    };
  });
}

/** Conversão proposta → fechamento nos últimos 90 dias. */
export function taxaDeConversao(leads: Lead[], hoje: string) {
  const inicio = somarDias(hoje, -90);
  const recentes = leads.filter((l) => l.atualizado_em.slice(0, 10) >= inicio);
  const fechados = recentes.filter((l) => l.etapa === "Fechou").length;
  const perdidos = recentes.filter((l) => l.etapa === "Perdeu").length;
  const emProposta = recentes.filter(
    (l) => l.etapa === "Proposta feita",
  ).length;
  const base = fechados + perdidos + emProposta;
  return { fechados, base, taxa: base === 0 ? 0 : fechados / base };
}

export type Pendencia = {
  tipo: "Carteira" | "Funil";
  id: string;
  nome: string;
  telefone: string | null;
  descricao: string;
  data: string;
  atrasada: boolean;
};

/** "Para fazer hoje": próximas ações e retornos vencidos ou marcados para hoje. */
export function pendenciasDeHoje(
  clientes: Cliente[],
  leads: Lead[],
  hoje: string,
): Pendencia[] {
  const pendencias: Pendencia[] = [];

  for (const c of clientes) {
    if (c.proxima_acao_data && c.proxima_acao_data <= hoje) {
      pendencias.push({
        tipo: "Carteira",
        id: c.id,
        nome: c.nome,
        telefone: c.telefone,
        descricao: c.proxima_acao?.trim() || "Próxima ação combinada",
        data: c.proxima_acao_data,
        atrasada: c.proxima_acao_data < hoje,
      });
    }
  }

  for (const l of leads) {
    if (
      l.proximo_retorno &&
      l.proximo_retorno <= hoje &&
      l.etapa !== "Fechou" &&
      l.etapa !== "Perdeu"
    ) {
      pendencias.push({
        tipo: "Funil",
        id: l.id,
        nome: l.nome,
        telefone: l.telefone,
        descricao: `Retornar — ${l.etapa}`,
        data: l.proximo_retorno,
        atrasada: l.proximo_retorno < hoje,
      });
    }
  }

  return pendencias.sort((a, b) => a.data.localeCompare(b.data));
}

export type LinhaCarteira = {
  cliente: Cliente;
  segmentos: string[];
  cotas: number;
  valorTotal: number;
  ultimoNegocio: string | null;
  statusCotas: string[];
  ultimoContato: string | null;
  diasSemContato: number | null;
};

/** Uma linha por cliente, com o que veio das vendas + o que a usuária anotou. */
export function montarCarteira(
  clientes: Cliente[],
  vendas: Venda[],
  hoje: string,
): LinhaCarteira[] {
  const porCliente = new Map<string, Venda[]>();
  for (const v of vendas) {
    const chave = v.cliente_id ?? `nome:${v.nome_cliente}`;
    porCliente.set(chave, [...(porCliente.get(chave) ?? []), v]);
  }

  const linhas = clientes.map((cliente) => {
    const doCliente = valem(porCliente.get(cliente.id) ?? []);
    const ultimoNegocio =
      doCliente.length > 0
        ? doCliente.reduce(
            (max, v) => (v.data_venda > max ? v.data_venda : max),
            doCliente[0].data_venda,
          )
        : null;
    const ultimoContato = cliente.ultima_conversa ?? ultimoNegocio;
    return {
      cliente,
      segmentos: [...new Set(doCliente.map((v) => v.segmento))],
      cotas: doCliente.length,
      valorTotal: somar(doCliente),
      ultimoNegocio,
      statusCotas: [...new Set(doCliente.map((v) => v.status))],
      ultimoContato,
      diasSemContato: ultimoContato ? diasEntre(ultimoContato, hoje) : null,
    };
  });

  // Fila de reativação: quem está há mais tempo sem contato aparece primeiro.
  return linhas.sort((a, b) => {
    const ca = a.ultimoContato ?? "0000-00-00";
    const cb = b.ultimoContato ?? "0000-00-00";
    return ca.localeCompare(cb);
  });
}

/** Últimas `n` semanas (segundas-feiras), da mais antiga para a mais recente. */
export function ultimasSemanas(hoje: string, n = 12): string[] {
  const atual = segundaDaSemana(hoje);
  const lista: string[] = [];
  for (let i = n - 1; i >= 0; i--) lista.push(somarDias(atual, -7 * i));
  return lista;
}

/** Nº e valor de vendas registradas em cada semana, a partir das vendas reais. */
export function vendasDaSemana(vendas: Venda[], segundaIso: string) {
  const fim = somarDias(segundaIso, 6);
  const daSemana = valem(vendas).filter(
    (v) => v.data_venda >= segundaIso && v.data_venda <= fim,
  );
  return { quantidade: daSemana.length, valor: somar(daSemana) };
}

export { hojeIso };
