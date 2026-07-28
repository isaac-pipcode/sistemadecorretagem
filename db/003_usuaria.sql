-- Cria a conta de acesso da consultora (sistema de uma usuária só).
-- Rode no SQL Editor do Supabase, com a senha inicial que você quiser.
-- A troca de senha depois é feita pela própria tela "Minha conta" do sistema.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
)
select
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'consultora@minhasvendas.com.br',
  extensions.crypt('Vendas2026!', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"nome":"Consultora Ademicon"}'::jsonb,
  false, false
where not exists (
  select 1 from auth.users where email = 'consultora@minhasvendas.com.br'
);

insert into auth.identities (
  provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at
)
select
  u.id::text, u.id,
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true, 'phone_verified', false),
  'email', now(), now(), now()
from auth.users u
where u.email = 'consultora@minhasvendas.com.br'
  and not exists (
    select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
  );
