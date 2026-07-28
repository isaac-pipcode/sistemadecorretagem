# Minhas Vendas — Consórcios

Sistema de gestão de vendas de consórcios para uma consultora da Ademicon em
São João da Boa Vista/SP. Substitui os cadernos de anotação: registra vendas,
acompanha os interessados, mantém a carteira de clientes viva e mostra o quanto
falta para a meta de **R$ 1.000.000 por mês**.

Tudo em português, pensado para celular, com letra grande e botões grandes.

---

## Como entrar no sistema

| | |
|---|---|
| **Endereço** | a URL do projeto na Vercel (veja "Publicar na Vercel" abaixo) |
| **E-mail** | `consultora@minhasvendas.com.br` |
| **Senha inicial** | `Vendas2026!` |

> **Troque a senha no primeiro acesso.** Depois de entrar, toque em
> **Minha conta** (canto superior direito) → **Trocar a senha** → escreva a
> senha nova duas vezes → **Trocar senha**. A senha precisa ter 8 letras ou
> números, no mínimo. Anote-a em lugar seguro: não existe tela pública de
> "esqueci minha senha" (é possível redefinir pelo painel do Supabase, em
> *Authentication → Users*).

Não existe cadastro público. O sistema é de uma usuária só.

---

## As cinco abas

| Aba | Para que serve |
|---|---|
| **Painel** | Quanto vendi no mês e no ano, tíquete médio, dias desde a última venda, gráfico dos últimos 18 meses com a linha da meta, vendas por segmento e a lista **"Para fazer hoje"**. |
| **Funil de vendas** | Quadro com os interessados em 4 colunas: Novo contato → Reunião marcada → Proposta feita → Fechou / Perdeu. No computador dá para arrastar o cartão; no celular use o campo **"Mover para →"**. Ao mover para *Fechou*, o formulário de venda abre já preenchido. Ao mover para *Perdeu*, o sistema pergunta o motivo. |
| **Vendas** | Todas as vendas, com filtros de ano, segmento e situação, busca por nome, total do período e o botão **+ Registrar venda**. Dá para corrigir e apagar qualquer registro. |
| **Carteira** | Um cartão por cliente, do contato mais antigo para o mais novo (fila de reativação). Quem está há mais de 90 dias sem contato fica marcado em vermelho. Botões de WhatsApp, **Registrar conversa** e edição da próxima ação. |
| **Minha semana** | Contadores de contatos, reuniões e propostas com botões **+1**, comparação com os alvos da semana (27 / 11 / 7) e gráfico das últimas 12 semanas. |

O medidor da meta do mês fica no topo, em todas as abas.

### Como as contas são feitas

- "Vendido no mês/ano" soma todas as vendas **menos as marcadas como Inválida**;
  ao lado aparece, em letra menor, o total sem as desistências.
- Tíquete médio = média do valor das vendas dos últimos 12 meses.
- "Dias desde a última venda" fica vermelho acima de 14 dias.
- A semana começa na **segunda-feira**, no fuso de São Paulo.
- Metas: R$ 1.000.000/mês; 27 contatos, 11 reuniões e 7 propostas por semana.
  Ficam na tabela `config` e podem ser mudadas por lá.

---

## Como o sistema é feito

- **Next.js 16 (App Router) + TypeScript**, publicado na **Vercel**.
- **Supabase (Postgres)** para os dados e para o login por e-mail e senha.
- **Recharts** para os gráficos.
- Estilo com Tailwind CSS 4. Sem modo escuro, de propósito.

Pastas principais:

```
db/                     migrations e seed em SQL
src/app/(app)/          as cinco abas + Minha conta
src/app/entrar/         tela de login
src/componentes/        formulários, gráficos, cartões
src/lib/dados.ts        leitura dos dados e todas as contas
src/lib/acoes.ts        gravações (Server Actions)
src/proxy.ts            protege as telas de quem não fez login
```

---

## Variáveis de ambiente

Só duas, ambas públicas (podem aparecer no navegador):

| Variável | O que é |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase, ex.: `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave publicável (*publishable* / *anon*) do mesmo projeto |

Ambas ficam em *Supabase → Project Settings → API*.

Para rodar na sua máquina, copie `.env.example` para `.env.local` e preencha:

```bash
cp .env.example .env.local
npm install
npm run dev     # abre em http://localhost:3000
```

Na Vercel, as mesmas duas variáveis precisam estar em
*Project → Settings → Environment Variables*, nos ambientes **Production**,
**Preview** e **Development**.

---

## Montar o banco do zero

No SQL Editor do Supabase, rode nesta ordem:

1. `db/001_estrutura.sql` — tabelas, índices e RLS ("usuária autenticada acessa
   tudo").
2. `db/002_seed.sql` — as 52 vendas transcritas dos cadernos, as metas e a
   Carteira deduplicada por nome.
3. `db/003_usuaria.sql` — a conta de acesso (troque a senha inicial no arquivo
   antes de rodar, se quiser outra).

Os dados originais das vendas também estão em `db/vendas-caderno.json`.

> Algumas linhas do seed vieram com dúvida de transcrição (valor, cota ou data
> ilegível no caderno). Elas estão anotadas no campo **Observações** e podem ser
> corrigidas direto na aba **Vendas**, no botão **Corrigir**.

---

## Publicar na Vercel

**Primeira publicação**

1. Em [vercel.com/new](https://vercel.com/new), importe este repositório.
2. Framework: *Next.js* (a Vercel detecta sozinha). Não é preciso mudar nada em
   build ou output.
3. Em *Environment Variables*, cadastre `NEXT_PUBLIC_SUPABASE_URL` e
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Clique em **Deploy**.

**Publicar de novo depois de uma mudança (re-deploy)**

- Jeito automático: dê `git push` na branch principal. A Vercel publica sozinha.
- Jeito manual: no painel da Vercel, *Deployments* → nos três pontinhos do
  último deploy → **Redeploy**.
- Pela linha de comando: `npx vercel --prod` dentro da pasta do projeto.

Se mudar alguma variável de ambiente, é preciso **re-deployar** para ela valer.

---

## Conferindo se está tudo certo

Depois de publicar, entre no sistema e confira:

- O Painel, filtrando 2025 na aba Vendas, mostra **R$ 4.415.139,22 em 25 cotas**.
- No gráfico mensal, **novembro de 2025** aparece acima da linha da meta
  (R$ 1.120.000).
- Registrar uma venda de teste muda na hora o Painel, a tabela e o medidor da
  meta; apagar a venda desfaz tudo.
