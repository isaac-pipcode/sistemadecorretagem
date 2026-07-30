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
  temperaturaPor,
  type Cliente,
  type Etapa,
  type Lead,
  type MetasSemanais,
  type Segmento,
  type Semana,
  type Situacao,
  type Temperatura,
  type Venda,
} from "@/lib/tipos";

export type Conversa = {
  id: string;
  cliente_id: string;
  data: string;
  nota: string | null;
};

export type Perfil = {
  id: string;
  nome: string;
  cidade: string | null;
  email: string;
};

/**
 * Quem está usando o sistema agora.
 *
 * Não precisa filtrar por id: o RLS só devolve o perfil de quem está logado.
 * Vale para todas as leituras deste arquivo — cada consultora enxerga apenas
 * as próprias linhas, e isso é garantido pelo banco, não pelo código.
 */
export async function carregarPerfil(): Promise<Perfil | null> {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("consultoras")
    .select("id, nome, cidade")
    .maybeSingle();

  return {
    id: user.id,
    nome: data?.nome?.trim() || "Consultora",
    cidade: data?.cidade ?? null,
    email: user.email ?? "",
  };
}

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

export type LinhaDiretorio = {
  cliente: Cliente;
  segmentos: string[];
  /** Cotas convertidas (Ativa ou Contemplada). */
  cotas: number;
  /** Só o que virou negócio de verdade — é o número que a Carteira mostra. */
  valorTotal: number;
  /** O que ainda é expectativa, vindo do funil. */
  valorEstimado: number | null;
  ultimoNegocio: string | null;
  statusCotas: string[];
  ultimoContato: string | null;
  diasSemContato: number | null;
  temperatura: Temperatura;
  situacao: Situacao;
  etapa: Etapa | null;
  motivoPerda: string | null;
};

export type LinhaCarteira = LinhaDiretorio;

/** Venda que conta como convertida — as outras não entram na Carteira. */
export function convertidas(vendas: Venda[]): Venda[] {
  return vendas.filter(
    (v) => v.status === "Ativa" || v.status === "Contemplada",
  );
}

/** A data mais recente entre duas — qualquer uma pode ser nula. */
function maisRecente(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}

/**
 * Uma linha por PESSOA, em ordem alfabética — é o que a aba Leads mostra.
 *
 * Junta os três lados que antes não se falavam: o cadastro da pessoa, as
 * vendas dela e a passagem pelo funil. A Carteira é um recorte disto.
 */
export function montarDiretorio(
  clientes: Cliente[],
  vendas: Venda[],
  leads: Lead[],
  hoje: string,
): LinhaDiretorio[] {
  const vendasPor = new Map<string, Venda[]>();
  for (const v of vendas) {
    if (!v.cliente_id) continue;
    vendasPor.set(v.cliente_id, [...(vendasPor.get(v.cliente_id) ?? []), v]);
  }

  // Um lead por pessoa: o mais recente manda, é o estado atual dela no funil.
  const leadPor = new Map<string, Lead>();
  for (const l of leads) {
    if (!l.cliente_id) continue;
    const atual = leadPor.get(l.cliente_id);
    if (!atual || l.atualizado_em > atual.atualizado_em) {
      leadPor.set(l.cliente_id, l);
    }
  }

  const linhas = clientes.map((cliente) => {
    const todas = valem(vendasPor.get(cliente.id) ?? []);
    const fechadas = convertidas(todas);
    const lead = leadPor.get(cliente.id) ?? null;

    const ultimoNegocio =
      todas.length > 0
        ? todas.reduce((max, v) => (v.data_venda > max ? v.data_venda : max), "")
        : null;

    // Última venda também é contato: se ela vendeu depois da última conversa
    // anotada, não faz sentido dizer que está sem falar com a pessoa.
    const ultimoContato = maisRecente(
      cliente.ultima_conversa,
      ultimoNegocio || null,
    );
    const diasSemContato = ultimoContato ? diasEntre(ultimoContato, hoje) : null;

    let situacao: Situacao;
    if (fechadas.length > 0) situacao = "Convertido";
    else if (lead && lead.etapa !== "Perdeu" && lead.etapa !== "Fechou")
      situacao = "No funil";
    else if (lead?.etapa === "Perdeu" || todas.length > 0) situacao = "Perdido";
    else situacao = "Sem movimento";

    return {
      cliente,
      segmentos: [...new Set(fechadas.map((v) => v.segmento))],
      cotas: fechadas.length,
      valorTotal: somar(fechadas),
      valorEstimado: lead?.valor_estimado ?? null,
      ultimoNegocio,
      statusCotas: [...new Set(fechadas.map((v) => v.status))],
      ultimoContato,
      diasSemContato,
      temperatura: temperaturaPor(diasSemContato),
      situacao,
      etapa: lead?.etapa ?? null,
      motivoPerda: lead?.motivo_perda ?? null,
    };
  });

  return linhas.sort((a, b) =>
    a.cliente.nome.localeCompare(b.cliente.nome, "pt-BR"),
  );
}

/**
 * A Carteira: só quem tem venda convertida, na fila de reativação — quem está
 * há mais tempo sem contato aparece primeiro.
 */
export function montarCarteira(
  clientes: Cliente[],
  vendas: Venda[],
  leads: Lead[],
  hoje: string,
): LinhaCarteira[] {
  return montarDiretorio(clientes, vendas, leads, hoje)
    .filter((l) => l.situacao === "Convertido")
    .sort((a, b) =>
      (a.ultimoContato ?? "0000-00-00").localeCompare(
        b.ultimoContato ?? "0000-00-00",
      ),
    );
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
