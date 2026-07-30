-- Multi-consultora: cada consultora enxerga só os dados dela.
--
-- Como funciona, em uma frase: toda tabela ganha uma coluna `consultora_id`
-- que já nasce preenchida com quem está logado (`default auth.uid()`), e o RLS
-- só libera as linhas em que essa coluna bate com quem está logado.
--
-- A consequência boa é que o código do site não precisa filtrar nada: um
-- `select * from vendas` já volta só com as vendas da consultora da vez, e um
-- `insert` já sai carimbado com o dono certo. Não existe jeito de esquecer o
-- filtro em uma tela nova — o banco não deixa.
--
-- Rode depois de 001, 002 e 003. Pode rodar de novo sem estragar nada.

-- ------------------------------------------------------------------ perfil

create table if not exists consultoras (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null default 'Consultora',
  cidade text,
  criado_em timestamptz default now()
);

-- O perfil nasce junto com a conta. É `security definer` de propósito: roda
-- com poder de dono, porque quem acabou de se cadastrar ainda não tem sessão
-- para passar pelo RLS. Como não existe política de INSERT em `consultoras`,
-- este gatilho é o único caminho para criar um perfil.
create or replace function public.criar_consultora()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.consultoras (id, nome)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
      initcap(replace(split_part(new.email, '@', 1), '.', ' '))
    )
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists ao_criar_usuaria on auth.users;
create trigger ao_criar_usuaria
  after insert on auth.users
  for each row execute function public.criar_consultora();

-- Perfis para as contas que já existiam antes deste arquivo.
insert into consultoras (id, nome, cidade)
select u.id,
       initcap(replace(split_part(u.email, '@', 1), '.', ' ')),
       'São João da Boa Vista'
  from auth.users u
on conflict (id) do nothing;

-- --------------------------------------------------------------- o dono

do $$
declare
  t text;
  dona uuid;
  tabelas text[] := array[
    'clientes','vendas','leads','atividade_semanal','config','conversas'
  ];
begin
  -- Tudo que já está no banco é da primeira consultora cadastrada.
  select id into dona from consultoras order by criado_em, id limit 1;
  if dona is null then
    raise exception 'Cadastre a conta da consultora (003_usuaria.sql) antes de rodar este arquivo.';
  end if;

  foreach t in array tabelas loop
    execute format('alter table %I add column if not exists consultora_id uuid', t);
    execute format('update %I set consultora_id = $1 where consultora_id is null', t)
      using dona;
    execute format('alter table %I alter column consultora_id set not null', t);
    -- O default é o coração da separação: todo insert sai carimbado sozinho.
    execute format('alter table %I alter column consultora_id set default auth.uid()', t);

    if not exists (
      select 1 from pg_constraint where conname = t || '_consultora_fk'
    ) then
      execute format(
        'alter table %I add constraint %I foreign key (consultora_id)
           references consultoras(id) on delete cascade',
        t, t || '_consultora_fk');
    end if;

    execute format('create index if not exists %I on %I (consultora_id)',
                   t || '_consultora_idx', t);
  end loop;
end $$;

-- ------------------------------------------------- unicidade por consultora

-- Duas consultoras diferentes podem ter um cliente com o mesmo nome, anotar a
-- mesma semana e ter a própria meta. O que era único no sistema inteiro passa
-- a ser único dentro de cada consultora.

drop index if exists clientes_nome_unico;
create unique index if not exists clientes_nome_por_consultora
  on clientes (consultora_id, nome);

alter table atividade_semanal drop constraint if exists atividade_semanal_semana_inicio_key;
create unique index if not exists semana_por_consultora
  on atividade_semanal (consultora_id, semana_inicio);

do $$
begin
  if exists (
    select 1 from pg_constraint
     where conname = 'config_pkey'
       and (select count(*) from unnest(conkey)) = 1
  ) then
    alter table config drop constraint config_pkey;
    alter table config add primary key (consultora_id, chave);
  end if;
end $$;

-- ------------------------------------------------------------------- RLS

alter table consultoras       enable row level security;
alter table clientes          enable row level security;
alter table vendas            enable row level security;
alter table leads             enable row level security;
alter table atividade_semanal enable row level security;
alter table config            enable row level security;
alter table conversas         enable row level security;

do $$
declare
  t text;
  tabelas text[] := array[
    'clientes','vendas','leads','atividade_semanal','config','conversas'
  ];
begin
  foreach t in array tabelas loop
    -- a política antiga conferia o e-mail de uma consultora só
    execute format('drop policy if exists %I on %I', 'acesso_consultora_' || t, t);
    execute format('drop policy if exists %I on %I', 'dados_da_consultora_' || t, t);
    execute format(
      'create policy %I on %I for all to authenticated
         using (consultora_id = (select auth.uid()))
         with check (consultora_id = (select auth.uid()))',
      'dados_da_consultora_' || t, t);
  end loop;
end $$;

-- Cada uma vê e edita só o próprio perfil. Não há política de INSERT nem de
-- DELETE: perfil só nasce pelo gatilho e só some junto com a conta.
drop policy if exists ver_meu_perfil on consultoras;
create policy ver_meu_perfil on consultoras
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists editar_meu_perfil on consultoras;
create policy editar_meu_perfil on consultoras
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
