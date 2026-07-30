-- Estrutura do banco (aplicada no Supabase como migration "estrutura_inicial").
-- Rode este arquivo primeiro; depois rode 002_seed.sql.

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  cidade text default 'São João da Boa Vista',
  ultima_conversa date,
  proxima_acao text,
  proxima_acao_data date,
  indicacoes_pedidas int default 0,
  criado_em timestamptz default now()
);

-- A Carteira é deduplicada por nome, então o nome precisa ser único.
create unique index if not exists clientes_nome_unico on clientes (nome);

create table if not exists vendas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id),
  nome_cliente text not null,          -- redundante de propósito: robustez p/ seed
  segmento text not null check (segmento in ('Imóveis','Motos','Serviços','Agro')),
  -- 'Agro' cobre máquinas agrícolas, tratores, colheitadeiras, implementos e
  -- caminhões; é o segmento-alvo de expansão da consultora (tíquete alto).
  grupo text, cota text,
  valor numeric(12,2) not null,
  data_venda date not null,
  status text not null default 'Ativa'
    check (status in ('Ativa','Desistiu','Contemplada','Inválida')),
  origem text check (origem in ('Indicação','Carteira','Parceria','Prospecção') or origem is null),
  indicado_por text,
  observacoes text,
  criado_em timestamptz default now()
);

create index if not exists vendas_data_idx on vendas (data_venda desc);
create index if not exists vendas_cliente_idx on vendas (cliente_id);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  segmento text,
  valor_estimado numeric(12,2),
  origem text,
  indicado_por text,
  etapa text not null default 'Novo contato'
    check (etapa in ('Novo contato','Reunião marcada','Proposta feita','Fechou','Perdeu')),
  motivo_perda text,
  proximo_retorno date,
  notas text,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

create table if not exists atividade_semanal (
  id uuid primary key default gen_random_uuid(),
  semana_inicio date not null unique,   -- sempre segunda-feira
  contatos int default 0,
  reunioes int default 0,
  propostas int default 0,
  vendas_qtd int default 0,
  vendas_valor numeric(12,2) default 0
);

create table if not exists config (
  chave text primary key,
  valor jsonb
);

-- Histórico de conversas da aba Carteira ("Registrar conversa").
create table if not exists conversas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  data date not null default (now() at time zone 'America/Sao_Paulo')::date,
  nota text,
  criado_em timestamptz default now()
);

create index if not exists conversas_cliente_idx on conversas (cliente_id, data desc);

-- RLS: sistema de uma usuária só. A chave publicável do Supabase fica visível
-- no navegador, então a política não olha só "está autenticado?" — ela confere
-- o e-mail da consultora. Se o e-mail de acesso mudar, mude aqui também.
alter table clientes enable row level security;
alter table vendas enable row level security;
alter table leads enable row level security;
alter table atividade_semanal enable row level security;
alter table config enable row level security;
alter table conversas enable row level security;

do $$
declare t text;
begin
  foreach t in array array['clientes','vendas','leads','atividade_semanal','config','conversas'] loop
    execute format('drop policy if exists %I on %I', 'acesso_consultora_' || t, t);
    execute format(
      'create policy %I on %I for all to authenticated
         using (auth.jwt() ->> ''email'' = ''rosepipano@gmail.com'')
         with check (auth.jwt() ->> ''email'' = ''rosepipano@gmail.com'')',
      'acesso_consultora_' || t, t
    );
  end loop;
end $$;
