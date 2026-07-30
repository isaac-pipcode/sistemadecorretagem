-- Cadastrar uma consultora nova.
--
-- NÃO se cadastra mais por SQL. Quem cria a conta é a função
-- `convidar-consultora`, e o motivo é simples: ela sorteia a senha provisória,
-- manda o e-mail de boas-vindas e marca a conta para exigir a troca no
-- primeiro acesso. Inserindo direto aqui, a consultora ficaria sem e-mail,
-- sem saber a senha e sem a troca obrigatória.
--
-- Para cadastrar, rode no seu computador (a chave de serviço está em
-- Supabase → Project Settings → API → service_role):
--
--   curl -X POST \
--     "https://hwwovuawwrfptixzlmhi.supabase.co/functions/v1/convidar-consultora" \
--     -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
--     -H "Content-Type: application/json" \
--     -d '{"nome":"Nome Sobrenome","email":"nome@exemplo.com","cidade":"São Paulo"}'
--
-- Resposta com `"enviado": true` quer dizer que o e-mail saiu. Se vier
-- `"enviado": false`, a conta foi criada do mesmo jeito e a senha vem no
-- campo `senha` — repasse à mão e confira os segredos GMAIL_REMETENTE e
-- GMAIL_SENHA_APP em Supabase → Edge Functions → Secrets.
--
-- O código da função está em supabase/functions/convidar-consultora/index.ts.


-- Quem já está cadastrada, e quem ainda não entrou nenhuma vez:
select c.nome,
       c.cidade,
       u.email,
       (u.raw_user_meta_data ->> 'senha_provisoria')::boolean as senha_provisoria,
       u.last_sign_in_at as ultimo_acesso,
       (select count(*) from vendas v where v.consultora_id = c.id) as vendas
  from consultoras c
  join auth.users u on u.id = c.id
 order by c.criado_em;


-- Reenviar o convite para quem perdeu o e-mail: apague e cadastre de novo
-- SÓ se ela ainda não tiver lançado nada (a linha de cima mostra `vendas`).
-- Isto apaga a consultora e tudo o que é dela, sem volta:
--
--   delete from auth.users where email = 'nome@exemplo.com';
--
-- Se ela já tem vendas lançadas, não apague — defina uma senha nova e marque
-- para trocar no primeiro acesso:
--
--   update auth.users
--      set encrypted_password = extensions.crypt('SenhaNova1', extensions.gen_salt('bf')),
--          raw_user_meta_data = raw_user_meta_data || '{"senha_provisoria": true}'::jsonb,
--          updated_at = now()
--    where email = 'nome@exemplo.com';


-- "Senha incorreta" com a senha certa? Antes de mexer na senha, rode isto.
-- O serviço de login lê as oito colunas abaixo como texto e devolve erro 500
-- se achar NULL — e a tela mostra esse 500 como se fosse senha errada. Conta
-- criada por INSERT à mão nasce com elas em NULL; conta criada pela função
-- `convidar-consultora` nasce certa. A consulta conserta e não estraga nada
-- se já estiver tudo certo:
update auth.users set
  confirmation_token         = coalesce(confirmation_token, ''),
  recovery_token             = coalesce(recovery_token, ''),
  email_change               = coalesce(email_change, ''),
  email_change_token_new     = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  phone_change               = coalesce(phone_change, ''),
  phone_change_token         = coalesce(phone_change_token, ''),
  reauthentication_token     = coalesce(reauthentication_token, '')
where confirmation_token is null
   or recovery_token is null
   or email_change is null
   or email_change_token_new is null
   or email_change_token_current is null
   or phone_change is null
   or phone_change_token is null
   or reauthentication_token is null;
