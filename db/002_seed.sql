-- Seed: 52 vendas transcritas dos cadernos da consultora.
insert into config (chave, valor) values
  ('meta_mensal', '1000000'::jsonb),
  ('metas_semanais', '{"contatos":27,"reunioes":11,"propostas":7}'::jsonb)
on conflict (chave) do nothing;

insert into vendas (nome_cliente, segmento, grupo, cota, valor, data_venda, status, observacoes) values
  ('Victor Hugo', 'Serviços', '50', '859', 15055.00, '2025-02-04', 'Ativa', null),
  ('Cesar Paiva', 'Serviços', '60', '749', 15000.00, '2025-04-23', 'Ativa', null),
  ('Silema M.', 'Motos', '1635', '168', 36000.00, '2023-09-14', 'Ativa', null),
  ('Andréia Fred.', 'Motos', '1635', '231', 52000.00, '2023-09-27', 'Contemplada', 'Anotação ''contemplado'' no caderno'),
  ('Gilda M.', 'Motos', '1638', '298', 52000.00, '2023-11-27', 'Ativa', null),
  ('Marta', 'Motos', '1640', '386', 40000.00, '2024-03-05', 'Contemplada', null),
  ('Pri Lombardo', 'Motos', '1660', '765', 100000.00, '2024-12-11', 'Inválida', 'Anotação ''inválido'' no caderno'),
  ('Rose Pipano', 'Motos', '1659', '245', 40000.00, '2025-11-29', 'Ativa', 'Data incerta: 29/11/25 ou 29/01/25 — conferir'),
  ('Adélia', 'Motos', '1660', '645', 120000.00, '2025-04-23', 'Ativa', null),
  ('Castilho', 'Motos', '1602', '472', 197993.69, '2025-07-25', 'Ativa', null),
  ('Valéria Chiochio', 'Motos', '1674', '847', 40000.00, '2025-08-07', 'Ativa', null),
  ('Valentina C.', 'Motos', '1676', '768', 40000.00, '2025-08-07', 'Ativa', null),
  ('José Ilton', 'Motos', '1675', '834', 150000.00, '2025-11-28', 'Ativa', null),
  ('Leandro Cesar', 'Motos', '1703', '372', 50000.00, '2026-03-31', 'Ativa', 'Registro a lápis'),
  ('Rose Pipano', 'Imóveis', '910', '3182', 80000.00, '2023-08-31', 'Ativa', null),
  ('Adriana', 'Imóveis', '910', '4199', 80000.00, '2023-11-03', 'Desistiu', null),
  ('Isaac Pipano', 'Imóveis', '720', '1662', 359405.61, '2024-01-03', 'Contemplada', null),
  ('Pri Lombardo', 'Imóveis', '1010', '2147', 80000.00, '2024-03-03', 'Ativa', null),
  ('Lina Pereira', 'Imóveis', '1030', '3210', 80000.00, '2024-04-05', 'Ativa', null),
  ('Edson Junior', 'Imóveis', '990', '610', 300000.00, '2024-04-25', 'Ativa', null),
  ('Isaac/Patrícia', 'Imóveis', '990', '1809', 300000.00, '2024-04-30', 'Ativa', null),
  ('Vivi Bielsa', 'Imóveis', '1030', '3184', 80000.00, '2024-05-20', 'Ativa', null),
  ('Camila C. Luca', 'Imóveis', '1110', '4801', 100000.00, '2024-10-18', 'Desistiu', null),
  ('Ana Sassaron', 'Imóveis', '1110', '3883', 100000.00, '2024-10-23', 'Ativa', null),
  ('Gabriela Pella', 'Imóveis', '1180', '2291', 200000.00, '2024-11-12', 'Ativa', 'Cota incerta (rasura) — conferir'),
  ('Germinho Pella', 'Imóveis', '1080', '4905', 200000.00, '2024-12-08', 'Ativa', 'Nome de difícil leitura — conferir'),
  ('Valdirene G.', 'Imóveis', '1190', '3924', 80000.00, '2024-12-16', 'Desistiu', null),
  ('Julia Gardz', 'Imóveis', '1020', '436', 105730.00, '2025-01-16', 'Desistiu', null),
  ('Yoris Alves', 'Imóveis', '1040', '4289', 104750.00, '2025-02-05', 'Ativa', null),
  ('Germinho Pella', 'Imóveis', '540', '1666', 132729.67, '2025-02-17', 'Ativa', null),
  ('João Paulo Oliveira', 'Imóveis', '12129', '765', 350000.00, '2025-04-25', 'Ativa', null),
  ('Luciano Martins', 'Imóveis', '1180', '602', 200000.00, '2025-06-10', 'Ativa', null),
  ('Luiz Baltazar', 'Imóveis', '12140', '3818', 80000.00, '2025-07-29', 'Ativa', null),
  ('Eleonora B.H.', 'Imóveis', '12141', '2827', 100000.00, '2025-07-30', 'Desistiu', null),
  ('Greicielle Nonato', 'Imóveis', '12141', '2926', 100000.00, '2025-07-31', 'Ativa', null),
  ('Maralo Martins', 'Imóveis', '1090', '464', 1023800.00, '2025-07-31', 'Ativa', 'VALOR INCERTO: 1.023.800 ou 102.380 — conferir com a consultora'),
  ('Daiane Firmino', 'Imóveis', '1110', '1512', 102380.00, '2025-08-06', 'Ativa', null),
  ('Elias V. Santos', 'Imóveis', '910', '1210', 107169.45, '2025-08-22', 'Desistiu', null),
  ('Adriana Macedo', 'Imóveis', '12147', '2706', 200000.00, '2025-11-10', 'Ativa', null),
  ('Tail Paiva', 'Imóveis', '12147', '291', 200000.00, '2025-11-17', 'Ativa', null),
  ('Carolina Rocha', 'Imóveis', '12148', '713', 450000.00, '2025-11-19', 'Ativa', null),
  ('Fernando Sassaron', 'Imóveis', '12140', '2109', 80000.00, '2025-11-28', 'Ativa', null),
  ('Dy Lourdes', 'Imóveis', '12148', '1686', 350000.00, '2025-12-04', 'Ativa', null),
  ('Adrian Bastos', 'Imóveis', '12163', '205', 80000.00, '2026-01-29', 'Ativa', null),
  ('Imaculada', 'Imóveis', '12162', '3236', 100000.00, '2026-01-29', 'Ativa', 'Cota com rasura — conferir'),
  ('Castilho', 'Imóveis', '12164', '1437', 200000.00, '2026-01-30', 'Ativa', null),
  ('Simone Fukai', 'Imóveis', '12171', '27', 100000.00, '2026-03-04', 'Ativa', null),
  ('Antonia Mora', 'Imóveis', '12172', '2735', 100000.00, '2026-03-18', 'Ativa', null),
  ('Kemilly Vanzela', 'Imóveis', '800', '14', 110531.41, '2025-02-20', 'Ativa', null),
  ('Ketle Amanda', 'Imóveis', '1180', '4801', 100000.00, '2024-10-18', 'Ativa', 'Mesma cota 4801 de Camila (desistiu)? Conferir'),
  ('Pedro Bonamone', 'Imóveis', '12177', '2528', 100000.00, '2026-04-15', 'Ativa', null),
  ('João Pedro Boaventura', 'Imóveis', '12180', '3162', 140000.00, '2026-04-29', 'Ativa', null);

-- Carteira derivada por deduplicação de nome_cliente
insert into clientes (nome)
select distinct nome_cliente from vendas
on conflict (nome) do nothing;

update vendas v set cliente_id = c.id from clientes c where c.nome = v.nome_cliente;
