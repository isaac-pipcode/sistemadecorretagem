/**
 * Cadastra uma consultora e manda o e-mail de boas-vindas.
 *
 * É o único caminho para criar uma conta: a senha provisória só existe aqui,
 * dentro desta função — o banco guarda apenas o hash dela. Criar a conta por
 * fora daqui deixa a consultora sem o e-mail e sem saber a senha.
 *
 * Chamada:
 *   curl -X POST "$SUPABASE_URL/functions/v1/convidar-consultora" \
 *     -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
 *     -H "Content-Type: application/json" \
 *     -d '{"nome":"Nome Sobrenome","email":"nome@exemplo.com","cidade":"São Paulo"}'
 *
 * Segredos usados (Supabase → Edge Functions → Secrets):
 *   GMAIL_REMETENTE  — o Gmail que envia, ex.: corretora@gmail.com
 *   GMAIL_SENHA_APP  — senha de app de 16 letras gerada na conta Google
 *   ENDERECO_SISTEMA — endereço do site, ex.: https://minhas-vendas.vercel.app
 *
 * Sem os dois primeiros a conta é criada do mesmo jeito e a senha volta na
 * resposta, para repassar à mão.
 */

import { createClient } from "jsr:@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

/** Sem i/I, l/L, O/o, 0 e 1: some a dúvida na hora de digitar do papel. */
const ALFABETO = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function gerarSenha(digitos = 8): string {
  const bytes = new Uint32Array(digitos);
  crypto.getRandomValues(bytes);
  const senha = [...bytes].map((b) => ALFABETO[b % ALFABETO.length]).join("");

  // Tem que sair com letra e número — se não saiu, sorteia de novo.
  return /[0-9]/.test(senha) && /[a-zA-Z]/.test(senha)
    ? senha
    : gerarSenha(digitos);
}

function json(corpo: unknown, status = 200): Response {
  return new Response(JSON.stringify(corpo), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function corpoDoEmail(nome: string, email: string, senha: string, site: string) {
  const primeiroNome = nome.split(" ")[0];

  const texto = `Oi, ${primeiroNome}!

Sua conta no Minhas Vendas já está pronta. É onde suas vendas de consórcio
somam sozinhas: painel do mês, funil dos interessados, carteira de clientes e
a rotina da semana, tudo em uma tela só.

Para entrar:

  Endereço: ${site}
  E-mail:   ${email}
  Senha:    ${senha}

Essa senha é temporária. No primeiro acesso o sistema pede para você criar uma
senha só sua — sem isso ele não abre. Escolha uma com 8 letras ou números, no
mínimo, e anote em um lugar seguro.

O que você anota aqui é só seu. Nenhuma outra consultora enxerga suas vendas,
seus interessados ou seus clientes.

Bom trabalho!`;

  const escapar = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const html = `<!doctype html>
<html lang="pt-BR"><body style="margin:0;padding:24px;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18181b">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e4e4e7">
    <div style="background:#c4161c;padding:24px">
      <p style="margin:0;font-size:24px;font-weight:800;color:#fff;line-height:1.2">Minhas Vendas</p>
      <p style="margin:2px 0 0;font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.85)">Ademicon</p>
    </div>
    <div style="padding:24px">
      <p style="margin:0 0 16px;font-size:20px;font-weight:800">Oi, ${escapar(primeiroNome)}!</p>
      <p style="margin:0 0 16px;font-size:16px;line-height:1.5">
        Sua conta já está pronta. É onde suas vendas de consórcio somam sozinhas:
        painel do mês, funil dos interessados, carteira de clientes e a rotina da
        semana, tudo em uma tela só.
      </p>
      <table style="width:100%;border-collapse:collapse;background:#fafafa;border:1px solid #e4e4e7;border-radius:12px;margin:0 0 16px">
        <tr><td style="padding:12px 14px;font-size:14px;color:#52525b">E-mail</td>
            <td style="padding:12px 14px;font-size:16px;font-weight:700;text-align:right">${escapar(email)}</td></tr>
        <tr><td style="padding:12px 14px;font-size:14px;color:#52525b;border-top:1px solid #e4e4e7">Senha temporária</td>
            <td style="padding:12px 14px;font-size:20px;font-weight:800;text-align:right;font-family:ui-monospace,Menlo,Consolas,monospace;border-top:1px solid #e4e4e7">${escapar(senha)}</td></tr>
      </table>
      <p style="margin:0 0 20px;text-align:center">
        <a href="${escapar(site)}" style="display:inline-block;background:#c4161c;color:#fff;font-size:17px;font-weight:800;text-decoration:none;padding:14px 28px;border-radius:9999px">Entrar no sistema</a>
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.5;background:#fef2f2;border-left:4px solid #c4161c;padding:12px 14px;border-radius:0 8px 8px 0">
        <strong>Essa senha é temporária.</strong> No primeiro acesso o sistema pede
        para você criar uma senha só sua — sem isso ele não abre.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.5;color:#52525b">
        O que você anota aqui é só seu. Nenhuma outra consultora enxerga suas
        vendas, seus interessados ou seus clientes.
      </p>
    </div>
  </div>
</body></html>`;

  return { texto, html };
}

async function enviarEmail(para: string, nome: string, senha: string) {
  const remetente = Deno.env.get("GMAIL_REMETENTE");
  const senhaApp = Deno.env.get("GMAIL_SENHA_APP");
  const site =
    Deno.env.get("ENDERECO_SISTEMA") ??
    "https://minhas-vendas-consorcios.vercel.app";

  if (!remetente || !senhaApp) {
    return { enviado: false, motivo: "GMAIL_REMETENTE/GMAIL_SENHA_APP ausentes" };
  }

  const { texto, html } = corpoDoEmail(nome, para, senha, site);
  const cliente = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: { username: remetente, password: senhaApp.replace(/\s/g, "") },
    },
  });

  try {
    await cliente.send({
      from: `Minhas Vendas <${remetente}>`,
      to: para,
      subject: "Sua conta no Minhas Vendas está pronta",
      content: texto,
      html,
    });
    return { enviado: true };
  } catch (erro) {
    return { enviado: false, motivo: String(erro) };
  } finally {
    await cliente.close().catch(() => {});
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ erro: "Use POST." }, 405);

  const chaveServico = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const token = req.headers.get("Authorization")?.replace("Bearer ", "").trim();
  if (token !== chaveServico) {
    return json({ erro: "Precisa da chave de serviço." }, 401);
  }

  let corpo: { nome?: string; email?: string; cidade?: string };
  try {
    corpo = await req.json();
  } catch {
    return json({ erro: "Corpo inválido." }, 400);
  }

  const nome = corpo.nome?.trim() ?? "";
  const email = corpo.email?.trim().toLowerCase() ?? "";
  const cidade = corpo.cidade?.trim() || null;

  if (nome.length < 2) return json({ erro: "Falta o nome." }, 400);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ erro: "E-mail inválido." }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    chaveServico,
    { auth: { persistSession: false } },
  );

  const senha = gerarSenha();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { nome, senha_provisoria: true },
  });

  if (error || !data.user) {
    const jaExiste = error?.message?.includes("already been registered");
    return json(
      { erro: jaExiste ? `Já existe conta com ${email}.` : error?.message },
      jaExiste ? 409 : 500,
    );
  }

  // O gatilho do 004 já criou o perfil; a cidade é o que falta.
  if (cidade) {
    await admin.from("consultoras").update({ cidade }).eq("id", data.user.id);
  }

  const envio = await enviarEmail(email, nome, senha);

  return json({
    ok: true,
    id: data.user.id,
    nome,
    email,
    enviado: envio.enviado,
    // Só volta na resposta quando o e-mail não saiu — aí alguém precisa
    // repassar a senha à mão.
    senha: envio.enviado ? undefined : senha,
    motivo: envio.enviado ? undefined : envio.motivo,
  });
});
