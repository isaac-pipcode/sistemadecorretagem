# Minhas Vendas — Consórcios

Sistema de gestão de vendas de consórcios para uma consultora da Ademicon em
São João da Boa Vista/SP. Substitui os cadernos de anotação: registra vendas,
acompanha os interessados, mantém a carteira de clientes viva e mostra o quanto
falta para a meta de **R$ 1.000.000 por mês**.

Tudo em português, pensado para celular, com letra grande e botões grandes.

---

## Como entrar no sistema

O endereço é <https://minhas-vendas-consorcios.vercel.app>. O e-mail e a senha
chegam pelo **e-mail de boas-vindas**, mandado no dia em que a conta é criada.

**No primeiro acesso o sistema pede uma senha nova** e não abre nenhuma tela
antes disso — a senha que veio no e-mail é temporária. Escreva a senha nova
duas vezes e pronto, cai direto no Painel. Depois disso, para trocar de novo:
**Minha conta** (canto superior direito) → **Trocar a senha**.

A senha precisa ter 8 letras ou números, no mínimo. Anote-a em lugar seguro:
não existe tela pública de "esqueci minha senha" (dá para redefinir pelo painel
do Supabase, em *Authentication → Users*, ou pelo SQL no fim do
`db/005_nova_consultora.sql`).

Não existe tela de cadastro público: as contas são criadas por quem administra
o sistema (veja *Uma consultora por conta*, abaixo).

---

## Uma consultora por conta

Cada consultora entra com o e-mail dela e vê **só os dados dela** — as próprias
vendas, os próprios interessados, a própria carteira, as próprias metas. Duas
consultoras podem ter um cliente com o mesmo nome sem uma atrapalhar a outra.

Isso não depende do código do site: cada linha do banco tem uma coluna
`consultora_id` que já nasce preenchida com quem está logado, e o Postgres só
devolve as linhas em que ela bate (*Row Level Security*). Uma tela nova não tem
como esquecer o filtro — mesmo se o código pedisse "todas as vendas", o banco
devolveria só as da consultora da vez.

**Cadastrar uma consultora nova:** uma chamada só, que cria a conta, sorteia a
senha e manda o e-mail de boas-vindas. A chave de serviço está em Supabase →
*Project Settings → API → service_role*:

```bash
curl -X POST \
  "https://hwwovuawwrfptixzlmhi.supabase.co/functions/v1/convidar-consultora" \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Nome Sobrenome","email":"nome@exemplo.com","cidade":"São Paulo"}'
```

Volta `{"ok": true, "enviado": true}` quando o e-mail sai. Se vier
`"enviado": false`, a conta foi criada do mesmo jeito e a senha vem no campo
`senha` — repasse à mão e veja *O e-mail de boas-vindas*, abaixo. Ela entra com
a tela em branco: nenhuma venda, nenhum interessado, nenhum cliente das outras.

Não crie conta por SQL. A senha provisória só existe dentro da função — no
banco fica só o hash dela —, então uma conta criada à mão nasce sem e-mail, sem
senha conhecida e sem a troca obrigatória.

**Apagar uma consultora:** `delete from auth.users where email = '...'` remove
a conta e, junto, tudo o que era dela.

> No Supabase, em *Authentication → Sign In / Providers → Email*, mantenha
> **Allow new users to sign up** desligado. Sem isso qualquer pessoa consegue
> criar uma conta sozinha — não veria dado de ninguém, mas entraria no sistema.
> Com o cadastro desligado, só entra quem você cadastrar.

---

## O e-mail de boas-vindas

Toda consultora cadastrada recebe, na hora, um e-mail com o endereço do site, o
e-mail de acesso e a senha temporária, avisando que o sistema vai pedir uma
senha nova logo na entrada. Quem monta e manda esse e-mail é a função
`supabase/functions/convidar-consultora/index.ts` — o texto do e-mail está lá
dentro, em `corpoDoEmail`, e é lá que se muda a redação.

O envio sai pelo Gmail de vocês, com uma **senha de app** do Google (não é a
senha normal da conta — é um código de 16 letras que serve só para isso, e que
pode ser revogado sem mexer na senha de verdade). Para ligar:

1. Na Conta do Google que vai enviar, ative a verificação em duas etapas.
2. Vá em <https://myaccount.google.com/apppasswords>, crie uma senha de app com
   o nome `Minhas Vendas` e copie as 16 letras.
3. No Supabase, em *Edge Functions → Secrets*, cadastre:

| Segredo | Valor |
|---|---|
| `GMAIL_REMETENTE` | o Gmail que envia, ex.: `corretora@gmail.com` |
| `GMAIL_SENHA_APP` | as 16 letras da senha de app |
| `ENDERECO_SISTEMA` | `https://minhas-vendas-consorcios.vercel.app` |

Enquanto esses segredos não existirem, o cadastro continua funcionando: a conta
é criada, a resposta volta com `"enviado": false` e traz a senha no campo
`senha`, para repassar por WhatsApp. Ninguém fica sem conta por causa do
e-mail.

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

## Identidade visual

A interface segue a marca da Ademicon: **vermelho institucional sobre branco**,
com grafite como cor de apoio.

| Uso | Cor |
|---|---|
| Vermelho da marca (faixa do topo, botão principal, números em alerta) | `#c4161c` |
| Vermelho escuro (degradê da faixa, borda do botão) | `#8e0f14` |
| Grafite de apoio (segunda série dos gráficos, etiquetas neutras) | `#344054` |
| Fundo da tela | `#f6f3f3` |
| Texto | `#1a1414` / `#5a4d4d` |

Todas as cores saem do bloco `@theme` no topo de `src/app/globals.css` — para
acertar o tom exato do manual da marca, **mude só aquele bloco** e o sistema
inteiro acompanha (cabeçalho, botões, gráficos, etiquetas).

O selo do cabeçalho é uma versão simplificada do símbolo (telhado branco em
quadrado vermelho), desenhada em SVG dentro de `src/componentes/marca.tsx`.
Quando tiver o arquivo oficial do logotipo, salve como `public/ademicon.svg` e
troque o `<Selo />` por `<img src="/ademicon.svg" alt="" />` — é a única
mudança necessária.

Contraste conferido em todas as combinações (WCAG AA): branco sobre o vermelho
da marca e vermelho da marca sobre branco ficam em 5,9:1; o texto de leitura,
em 16,4:1.

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

Na Vercel não é preciso cadastrar nada: as duas ficam no arquivo
`.env.production`, que **está versionado de propósito**. São chaves
*publicáveis* — o Next.js as embute no JavaScript do navegador, então já são
visíveis para qualquer visitante; não são segredo. O que protege os dados é o
login mais o RLS do banco.

Se preferir cadastrá-las em *Project → Settings → Environment Variables*
(Production, Preview e Development), os valores do painel têm prioridade sobre
o arquivo.

> A chave de serviço (*service_role*) do Supabase **nunca** pode ir para o
> repositório nem para o navegador: ela ignora o RLS. O site não usa essa chave
> em lugar nenhum. Quem usa é a função `convidar-consultora`, que roda dentro
> do Supabase e recebe a chave pronta do próprio ambiente — e é a mesma chave
> que autoriza quem chama a função, por isso ela só sai do painel do Supabase
> na hora de cadastrar alguém.

---

## Montar o banco do zero

No SQL Editor do Supabase, rode **nesta ordem** (a do 004 importa: ele carimba
como sendo da primeira consultora tudo o que já estiver no banco):

1. `db/001_estrutura.sql` — tabelas e índices.
2. `db/002_seed.sql` — as 52 vendas transcritas dos cadernos, as metas e a
   Carteira deduplicada por nome.
3. `db/003_usuaria.sql` — a conta de acesso (troque a senha inicial no arquivo
   antes de rodar, se quiser outra).
4. `db/004_multi_consultora.sql` — separa os dados por consultora. Pode ser
   rodado de novo quando quiser, sem estragar nada.

Consultora nova não entra por SQL: quem cadastra é a função
`convidar-consultora` (veja *Uma consultora por conta*). O
`db/005_nova_consultora.sql` serve para conferir quem já está cadastrada e para
redefinir senha quando alguém perde o e-mail.

Os dados originais das vendas também estão em `db/vendas-caderno.json`.

> Algumas linhas do seed vieram com dúvida de transcrição (valor, cota ou data
> ilegível no caderno). Elas estão anotadas no campo **Observações** e podem ser
> corrigidas direto na aba **Vendas**, no botão **Corrigir**.

---

## Publicar na Vercel

O projeto está publicado em <https://minhas-vendas-consorcios.vercel.app>
(time `pipcode`, projeto `minhas-vendas-consorcios`) e o repositório
`isaac-pipcode/sistemadecorretagem` está ligado à Vercel.

**Como publicar uma mudança**

`git push` na branch `main`. A Vercel compila e publica sozinha, em uns dois
minutos. Push em qualquer outra branch gera um *preview* (endereço próprio,
sem mexer no que está no ar).

Se precisar publicar sem push: painel → *Deployments* → três pontinhos do
último deploy → **Redeploy**.

**Quem pode abrir o endereço**

A *Vercel Authentication* (a trava que exigia conta na Vercel para abrir o
site) está **desligada** neste projeto. Tem que estar: quem usa o sistema não
tem conta na Vercel. A porta de entrada é o login do próprio sistema, e o RLS
do banco garante que cada consultora só enxergue os dados dela.

Fica em *Settings → Deployment Protection*, caso queira conferir.

**O repositório é público**

`isaac-pipcode/sistemadecorretagem` é um repositório público, e as duas chaves
do Supabase estão nele. É seguro *porque* são chaves publicáveis: elas só dão
acesso a quem consegue fazer login, e o RLS limita cada login aos dados da
própria consultora. Duas coisas seguem valendo:

- **Nunca** comitar a chave de serviço (*service_role*) — essa ignora o RLS.
- Manter **Allow new users to sign up** desligado no Supabase
  (*Authentication → Sign In / Providers → Email*). Com o repositório público,
  qualquer pessoa consegue as chaves; o que impede alguém de criar uma conta é
  esse botão. Mesmo criando, não veria dado de ninguém — mas entraria.

Se preferir fechar o repositório, nada quebra: a Vercel continua publicando
igual.

---

## Conferindo se está tudo certo

Depois de publicar, entre no sistema e confira:

- O Painel, filtrando 2025 na aba Vendas, mostra **R$ 4.415.139,22 em 25 cotas**.
- No gráfico mensal, **novembro de 2025** aparece acima da linha da meta
  (R$ 1.120.000).
- Registrar uma venda de teste muda na hora o Painel, a tabela e o medidor da
  meta; apagar a venda desfaz tudo.
