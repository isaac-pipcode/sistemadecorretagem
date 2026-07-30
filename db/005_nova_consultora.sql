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
