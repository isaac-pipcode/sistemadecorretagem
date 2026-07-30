-- Cadastrar uma consultora nova.
--
-- Troque as três linhas marcadas com <<< e rode no SQL Editor do Supabase.
-- O perfil em `consultoras` nasce sozinho (gatilho do 004), e a partir daí
-- ela entra no site com esse e-mail e essa senha e começa com a tela em
-- branco: nenhuma venda, nenhum interessado, nenhum cliente das outras.
--
-- Peça para ela trocar a senha no primeiro acesso, em Minha conta.

do $$
declare
  novo_email  text := 'nome.sobrenome@exemplo.com.br';   -- <<< e-mail
  senha       text := 'TroqueEstaSenha1!';               -- <<< senha inicial
  nome_dela   text := 'Nome Sobrenome';                  -- <<< nome
  nova_id     uuid := gen_random_uuid();
begin
  if exists (select 1 from auth.users where email = novo_email) then
    raise notice 'Já existe conta com o e-mail %. Nada foi feito.', novo_email;
    return;
  end if;

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    raw_app_meta_data, raw_user_meta_data, is_sso_user, is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    nova_id, 'authenticated', 'authenticated', novo_email,
    extensions.crypt(senha, extensions.gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('nome', nome_dela),
    false, false
  );

  insert into auth.identities (
    provider_id, user_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) values (
    nova_id::text, nova_id,
    jsonb_build_object(
      'sub', nova_id::text, 'email', novo_email,
      'email_verified', true, 'phone_verified', false
    ),
    'email', now(), now(), now()
  );

  raise notice 'Conta criada para % (%).', nome_dela, novo_email;
end $$;

-- Confira:
select c.nome, c.cidade, u.email
  from consultoras c join auth.users u on u.id = c.id
 order by c.criado_em;

-- Para apagar uma consultora e tudo o que é dela (sem volta):
--   delete from auth.users where email = 'nome.sobrenome@exemplo.com.br';
