-- Leads e Carteira passam a olhar a mesma lista de pessoas.
--
-- Antes: `clientes` nascia das vendas e `leads` do funil, sem se falarem. Quem
-- comprou em 2023 existia só como cliente; quem está no funil existe só como
-- lead. Não dava para ver "todo mundo" em lugar nenhum.
--
-- Depois: `clientes` é a lista de PESSOAS — é ela que a aba Leads mostra de A a
-- Z. `leads` continua sendo a passagem pelo funil, agora apontando para a
-- pessoa. A Carteira vira um recorte: só quem tem venda Ativa ou Contemplada.
--
-- Rode uma vez no SQL Editor. Pode rodar de novo sem estragar nada.

alter table leads
  add column if not exists cliente_id uuid references clientes(id) on delete set null;

create index if not exists leads_cliente_idx on leads (cliente_id);


-- 1) Lead que já tem cliente com o mesmo nome: liga nos dois.
--    A comparação ignora maiúsculas e espaços nas pontas — "Maria Silva" e
--    "maria silva " são a mesma pessoa para quem digitou.
update leads l
   set cliente_id = c.id
  from clientes c
 where l.cliente_id is null
   and c.consultora_id = l.consultora_id
   and lower(btrim(c.nome)) = lower(btrim(l.nome));


-- 2) Lead sem cliente nenhum: cria a pessoa e liga.
--    O distinct on evita dois leads do mesmo nome criarem dois clientes — o
--    índice único (consultora_id, nome) recusaria o segundo.
with candidatos as (
  select distinct on (l.consultora_id, lower(btrim(l.nome)))
         l.consultora_id,
         btrim(l.nome) as nome,
         l.telefone
    from leads l
   where l.cliente_id is null
   order by l.consultora_id, lower(btrim(l.nome)), l.atualizado_em desc
),
novos as (
  insert into clientes (consultora_id, nome, telefone)
  select consultora_id, nome, telefone from candidatos
  on conflict (consultora_id, nome) do nothing
  returning id, consultora_id, nome
)
update leads l
   set cliente_id = n.id
  from novos n
 where l.cliente_id is null
   and n.consultora_id = l.consultora_id
   and lower(btrim(n.nome)) = lower(btrim(l.nome));


-- 3) Sobra do passo 2: leads cujo cliente foi criado por outro lead homônimo.
update leads l
   set cliente_id = c.id
  from clientes c
 where l.cliente_id is null
   and c.consultora_id = l.consultora_id
   and lower(btrim(c.nome)) = lower(btrim(l.nome));


-- Confira: ninguém pode sobrar sem pessoa.
select (select count(*) from clientes)                            as pessoas,
       (select count(*) from leads)                               as leads,
       (select count(*) from leads where cliente_id is null)       as leads_soltos,
       (select count(distinct c.id)
          from clientes c
          join vendas v on v.cliente_id = c.id
         where v.status in ('Ativa','Contemplada'))                as na_carteira;
