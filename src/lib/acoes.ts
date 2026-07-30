"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { criarClienteServidor, exigirUsuaria } from "@/lib/supabase/servidor";
import { brParaIso, digitos, hojeIso, moedaParaNumero } from "@/lib/formato";
import {
  ETAPAS,
  ORIGENS,
  SEGMENTOS,
  STATUS_VENDA,
  type Etapa,
  type Origem,
  type Segmento,
  type StatusVenda,
} from "@/lib/tipos";

export type Resultado = { ok: boolean; mensagem: string };

const OK = (mensagem = ""): Resultado => ({ ok: true, mensagem });
const ERRO = (mensagem: string): Resultado => ({ ok: false, mensagem });

function texto(formData: FormData, campo: string): string {
  return String(formData.get(campo) ?? "").trim();
}

function textoOuNulo(formData: FormData, campo: string): string | null {
  const valor = texto(formData, campo);
  return valor === "" ? null : valor;
}

function dataOuNulo(formData: FormData, campo: string): string | null {
  const valor = texto(formData, campo);
  return valor === "" ? null : brParaIso(valor);
}

function atualizarTelas() {
  revalidatePath("/", "layout");
}

/** Garante que o cliente exista na Carteira e devolve o id dele. */
async function garantirCliente(
  supabase: Awaited<ReturnType<typeof criarClienteServidor>>,
  nome: string,
  telefone?: string | null,
): Promise<string | null> {
  if (!nome) return null;

  const { data: existente } = await supabase
    .from("clientes")
    .select("id, telefone")
    .eq("nome", nome)
    .maybeSingle();

  if (existente) {
    if (telefone && !existente.telefone) {
      await supabase
        .from("clientes")
        .update({ telefone })
        .eq("id", existente.id);
    }
    return existente.id;
  }

  const { data: novo, error } = await supabase
    .from("clientes")
    .insert({ nome, telefone: telefone ?? null })
    .select("id")
    .single();
  if (error) return null;
  return novo.id;
}

// ---------------------------------------------------------------- acesso

export async function entrar(
  _anterior: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  const email = texto(formData, "email").toLowerCase();
  const senha = texto(formData, "senha");
  if (!email || !senha) return ERRO("Preencha o e-mail e a senha.");

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) return ERRO("E-mail ou senha incorretos. Tente de novo.");

  redirect("/");
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/entrar");
}

export async function salvarPerfil(
  _anterior: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  const { supabase, user } = await exigirUsuaria();

  const nome = texto(formData, "nome");
  if (nome.length < 2) return ERRO("Escreva o seu nome.");

  const { error } = await supabase
    .from("consultoras")
    .update({ nome, cidade: textoOuNulo(formData, "cidade") })
    .eq("id", user.id);

  if (error) return ERRO("Não deu para salvar o nome. Tente de novo.");

  atualizarTelas();
  return OK("Nome salvo!");
}

/**
 * Troca a senha e derruba a marca de senha provisória — é ela que o proxy lê
 * para prender a usuária em /trocar-senha no primeiro acesso.
 */
async function aplicarSenha(formData: FormData): Promise<Resultado> {
  const nova = texto(formData, "senha");
  const confirmacao = texto(formData, "confirmacao");
  if (nova.length < 8)
    return ERRO("A senha nova precisa ter 8 letras ou mais.");
  if (nova !== confirmacao) return ERRO("As duas senhas não são iguais.");

  const { supabase } = await exigirUsuaria();
  const { error } = await supabase.auth.updateUser({
    password: nova,
    data: { senha_provisoria: false },
  });
  if (error) {
    return ERRO(
      error.message.includes("different from the old")
        ? "Escolha uma senha diferente da que veio no e-mail."
        : "Não deu para trocar a senha. Tente de novo.",
    );
  }
  return OK("Senha trocada!");
}

export async function trocarSenha(
  _anterior: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  return aplicarSenha(formData);
}

/** Primeiro acesso: troca a senha e já leva para o Painel. */
export async function definirPrimeiraSenha(
  _anterior: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  const resultado = await aplicarSenha(formData);
  if (!resultado.ok) return resultado;

  atualizarTelas();
  redirect("/");
}

// ---------------------------------------------------------------- vendas

export async function salvarVenda(
  _anterior: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  const { supabase } = await exigirUsuaria();

  const id = textoOuNulo(formData, "id");
  const nome = texto(formData, "nome_cliente");
  const segmento = texto(formData, "segmento") as Segmento;
  const valor = moedaParaNumero(texto(formData, "valor"));
  const data = dataOuNulo(formData, "data_venda");
  const status = (texto(formData, "status") || "Ativa") as StatusVenda;
  const origem = textoOuNulo(formData, "origem") as Origem | null;

  if (!nome) return ERRO("Escreva o nome do cliente.");
  if (!SEGMENTOS.includes(segmento)) return ERRO("Escolha o segmento.");
  if (!(valor > 0)) return ERRO("Escreva o valor da cota.");
  if (!data) return ERRO("Escreva a data no formato dia/mês/ano.");
  if (!STATUS_VENDA.includes(status)) return ERRO("Escolha a situação.");
  if (origem && !ORIGENS.includes(origem)) return ERRO("Origem inválida.");

  const clienteId = await garantirCliente(
    supabase,
    nome,
    textoOuNulo(formData, "telefone"),
  );

  const registro = {
    cliente_id: clienteId,
    nome_cliente: nome,
    segmento,
    grupo: textoOuNulo(formData, "grupo"),
    cota: textoOuNulo(formData, "cota"),
    valor,
    data_venda: data,
    status,
    origem,
    indicado_por: textoOuNulo(formData, "indicado_por"),
    observacoes: textoOuNulo(formData, "observacoes"),
  };

  const { error } = id
    ? await supabase.from("vendas").update(registro).eq("id", id)
    : await supabase.from("vendas").insert(registro);

  if (error) return ERRO(`Não deu para salvar: ${error.message}`);

  atualizarTelas();
  return OK(id ? "Venda corrigida!" : "Venda registrada!");
}

export async function excluirVenda(formData: FormData): Promise<void> {
  const { supabase } = await exigirUsuaria();
  const id = texto(formData, "id");
  if (id) await supabase.from("vendas").delete().eq("id", id);
  atualizarTelas();
}

// ---------------------------------------------------------------- funil

export async function salvarLead(
  _anterior: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  const { supabase } = await exigirUsuaria();

  const id = textoOuNulo(formData, "id");
  const nome = texto(formData, "nome");
  if (!nome) return ERRO("Escreva o nome do interessado.");

  const etapa = (texto(formData, "etapa") || "Novo contato") as Etapa;
  if (!ETAPAS.includes(etapa)) return ERRO("Etapa inválida.");

  const valorTexto = texto(formData, "valor_estimado");
  const registro = {
    nome,
    telefone: textoOuNulo(formData, "telefone"),
    segmento: textoOuNulo(formData, "segmento"),
    valor_estimado: valorTexto ? moedaParaNumero(valorTexto) : null,
    origem: textoOuNulo(formData, "origem"),
    indicado_por: textoOuNulo(formData, "indicado_por"),
    etapa,
    proximo_retorno: dataOuNulo(formData, "proximo_retorno"),
    notas: textoOuNulo(formData, "notas"),
    atualizado_em: new Date().toISOString(),
  };

  const { error } = id
    ? await supabase.from("leads").update(registro).eq("id", id)
    : await supabase.from("leads").insert(registro);

  if (error) return ERRO(`Não deu para salvar: ${error.message}`);

  atualizarTelas();
  return OK(id ? "Interessado atualizado!" : "Interessado anotado!");
}

/** Move o cartão de coluna. "Perdeu" exige motivo; "Fechou" é tratado à parte. */
export async function moverLead(formData: FormData): Promise<void> {
  const { supabase } = await exigirUsuaria();
  const id = texto(formData, "id");
  const etapa = texto(formData, "etapa") as Etapa;
  if (!id || !ETAPAS.includes(etapa)) return;

  await supabase
    .from("leads")
    .update({
      etapa,
      motivo_perda:
        etapa === "Perdeu" ? textoOuNulo(formData, "motivo_perda") : null,
      atualizado_em: new Date().toISOString(),
    })
    .eq("id", id);

  atualizarTelas();
}

export async function excluirLead(formData: FormData): Promise<void> {
  const { supabase } = await exigirUsuaria();
  const id = texto(formData, "id");
  if (id) await supabase.from("leads").delete().eq("id", id);
  atualizarTelas();
}

/**
 * Fecha o interessado: registra a venda com os dados que já estavam no cartão
 * e marca o lead como "Fechou" — sem redigitar nada.
 */
export async function fecharLead(
  _anterior: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  const leadId = texto(formData, "lead_id");
  const resultado = await salvarVenda(null, formData);
  if (!resultado.ok) return resultado;

  if (leadId) {
    const { supabase } = await exigirUsuaria();
    await supabase
      .from("leads")
      .update({
        etapa: "Fechou",
        motivo_perda: null,
        atualizado_em: new Date().toISOString(),
      })
      .eq("id", leadId);
    atualizarTelas();
  }

  return OK("Venda registrada e interessado marcado como Fechou!");
}

// ---------------------------------------------------------------- carteira

export async function salvarCliente(
  _anterior: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  const { supabase } = await exigirUsuaria();
  const id = texto(formData, "id");
  if (!id) return ERRO("Cliente não encontrado.");

  const indicacoesTexto = texto(formData, "indicacoes_pedidas");
  const { error } = await supabase
    .from("clientes")
    .update({
      telefone: textoOuNulo(formData, "telefone"),
      proxima_acao: textoOuNulo(formData, "proxima_acao"),
      proxima_acao_data: dataOuNulo(formData, "proxima_acao_data"),
      indicacoes_pedidas: indicacoesTexto
        ? Math.max(0, Number(digitos(indicacoesTexto)) || 0)
        : 0,
    })
    .eq("id", id);

  if (error) return ERRO(`Não deu para salvar: ${error.message}`);

  atualizarTelas();
  return OK("Cliente atualizado!");
}

export async function registrarConversa(
  _anterior: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  const { supabase } = await exigirUsuaria();
  const clienteId = texto(formData, "cliente_id");
  if (!clienteId) return ERRO("Cliente não encontrado.");

  const hoje = hojeIso();
  const nota = textoOuNulo(formData, "nota");

  const { error } = await supabase
    .from("conversas")
    .insert({ cliente_id: clienteId, data: hoje, nota });
  if (error) return ERRO(`Não deu para salvar: ${error.message}`);

  await supabase
    .from("clientes")
    .update({ ultima_conversa: hoje })
    .eq("id", clienteId);

  atualizarTelas();
  return OK("Conversa registrada!");
}

// ---------------------------------------------------------------- semana

async function semanaAtualOuNova(
  supabase: Awaited<ReturnType<typeof criarClienteServidor>>,
  semanaInicio: string,
) {
  const { data } = await supabase
    .from("atividade_semanal")
    .select("*")
    .eq("semana_inicio", semanaInicio)
    .maybeSingle();
  if (data) return data;

  const { data: nova } = await supabase
    .from("atividade_semanal")
    .insert({ semana_inicio: semanaInicio })
    .select("*")
    .single();
  return nova;
}

const CAMPOS_SEMANA = ["contatos", "reunioes", "propostas"] as const;
type CampoSemana = (typeof CAMPOS_SEMANA)[number];

/** Botões "+1" da aba Minha semana. */
export async function somarAtividade(formData: FormData): Promise<void> {
  const { supabase } = await exigirUsuaria();
  const campo = texto(formData, "campo") as CampoSemana;
  const semanaInicio = texto(formData, "semana_inicio");
  const passo = Number(texto(formData, "passo") || "1");
  if (!CAMPOS_SEMANA.includes(campo) || !semanaInicio) return;

  const registro = await semanaAtualOuNova(supabase, semanaInicio);
  if (!registro) return;

  const atual = Number(registro[campo] ?? 0);
  await supabase
    .from("atividade_semanal")
    .update({ [campo]: Math.max(0, atual + passo) })
    .eq("id", registro.id);

  atualizarTelas();
}

export async function salvarSemana(
  _anterior: Resultado | null,
  formData: FormData,
): Promise<Resultado> {
  const { supabase } = await exigirUsuaria();
  const semanaInicio = texto(formData, "semana_inicio");
  if (!semanaInicio) return ERRO("Semana não encontrada.");

  const registro = await semanaAtualOuNova(supabase, semanaInicio);
  if (!registro) return ERRO("Não deu para abrir a semana.");

  const inteiro = (campo: string) =>
    Math.max(0, Number(digitos(texto(formData, campo))) || 0);

  const { error } = await supabase
    .from("atividade_semanal")
    .update({
      contatos: inteiro("contatos"),
      reunioes: inteiro("reunioes"),
      propostas: inteiro("propostas"),
    })
    .eq("id", registro.id);

  if (error) return ERRO(`Não deu para salvar: ${error.message}`);

  atualizarTelas();
  return OK("Semana salva!");
}
