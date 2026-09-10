-- =============================================================================
-- Claquete · esquema do banco
--
-- Rode este arquivo inteiro no SQL Editor do Supabase, uma vez, ao criar o
-- projeto. Ele cria as tabelas, libera o acesso do aplicativo e popula o clube
-- de demonstração com a mesma temporada que está em src/data/mock/club.json.
--
-- O catálogo de filmes não fica aqui de propósito: a partir do CP6 ele vem da
-- API pública do TMDB, então guardá-lo agora seria criar uma tabela para jogar
-- fora depois.
-- =============================================================================

-- ------------------------------------------------------------------ tabelas --

create table if not exists clubs (
  id            text primary key,
  name          text not null,
  invite_code   text not null unique,
  season_number int  not null default 1,
  total_rounds  int  not null default 8,
  -- ordem do rodízio: a rodada N é curada por rotation[((N - 1) % tamanho) + 1]
  rotation      text[] not null,
  created_at    timestamptz not null default now()
);

create table if not exists members (
  id        text primary key,
  club_id   text not null references clubs (id) on delete cascade,
  name      text not null,
  initials  text not null,
  color     text not null,
  join_order int  not null
);

create table if not exists rounds (
  club_id       text not null references clubs (id) on delete cascade,
  number        int  not null check (number > 0),
  curator_id    text not null references members (id),
  movie_id      text,
  session_at    timestamptz,
  pick_deadline timestamptz not null,
  status        text not null
                check (status in ('awaiting_pick', 'awaiting_session', 'voting', 'closed')),
  primary key (club_id, number)
);

create table if not exists votes (
  club_id      text not null,
  round_number int  not null,
  member_id    text not null references members (id),
  score        int  not null check (score between 0 and 10),
  review       text not null default '',
  created_at   timestamptz not null default now(),
  -- um voto por pessoa por rodada: é a regra que o placar depende
  primary key (club_id, round_number, member_id),
  foreign key (club_id, round_number) references rounds (club_id, number) on delete cascade
);

create index if not exists votes_por_rodada on votes (club_id, round_number);

-- ------------------------------------------------------------------ acesso --
-- O protótipo do CP5 não tem login: o aplicativo fala com o banco usando a
-- chave anônima. As políticas abaixo liberam leitura e escrita para essa chave.
-- No CP6, com autenticação, elas passam a checar se quem escreve é membro do
-- clube — por isso o RLS já fica ligado desde agora.

alter table clubs   enable row level security;
alter table members enable row level security;
alter table rounds  enable row level security;
alter table votes   enable row level security;

do $$
declare t text;
begin
  foreach t in array array['clubs', 'members', 'rounds', 'votes'] loop
    execute format('drop policy if exists prototipo_leitura on %I', t);
    execute format('drop policy if exists prototipo_escrita on %I', t);
    execute format('create policy prototipo_leitura on %I for select using (true)', t);
    execute format('create policy prototipo_escrita on %I for all using (true) with check (true)', t);
  end loop;
end $$;

-- ------------------------------------------------------- clube de exemplo --

insert into clubs (id, name, invite_code, season_number, total_rounds, rotation)
values (
  'clube-cinema-da-galera',
  'Cinema da Galera',
  'GALERA-7X2',
  1,
  8,
  array['marina', 'bia', 'joao', 'gabriel', 'felipe']
)
on conflict (id) do update
  set name = excluded.name, rotation = excluded.rotation;

insert into members (id, club_id, name, initials, color, join_order) values
  ('marina',  'clube-cinema-da-galera', 'Marina',  'M', '#E23E57', 1),
  ('bia',     'clube-cinema-da-galera', 'Bia',     'B', '#4ADE80', 2),
  ('joao',    'clube-cinema-da-galera', 'João',    'J', '#8B5CF6', 3),
  ('gabriel', 'clube-cinema-da-galera', 'Gabriel', 'G', '#FFC53D', 4),
  ('felipe',  'clube-cinema-da-galera', 'Felipe',  'F', '#3A3A46', 5)
on conflict (id) do nothing;

insert into rounds (club_id, number, curator_id, movie_id, session_at, pick_deadline, status) values
  ('clube-cinema-da-galera', 1, 'marina',  'ainda-estou-aqui',  '2026-08-09 20:00+00', '2026-08-07 23:59+00', 'closed'),
  ('clube-cinema-da-galera', 2, 'bia',     'central-do-brasil', '2026-08-16 20:00+00', '2026-08-14 23:59+00', 'closed'),
  ('clube-cinema-da-galera', 3, 'joao',    'tropa-de-elite',    '2026-08-23 20:00+00', '2026-08-21 23:59+00', 'closed'),
  ('clube-cinema-da-galera', 4, 'gabriel', 'cidade-de-deus',    '2026-08-30 20:00+00', '2026-08-28 23:59+00', 'closed'),
  ('clube-cinema-da-galera', 5, 'felipe',  null,                null,                  '2026-09-11 23:59+00', 'awaiting_pick')
on conflict (club_id, number) do nothing;

insert into votes (club_id, round_number, member_id, score, review) values
  ('clube-cinema-da-galera', 1, 'marina',  10, 'Escolhi porque precisava ser visto em grupo.'),
  ('clube-cinema-da-galera', 1, 'bia',      9, 'Saí do sofá sem conseguir falar.'),
  ('clube-cinema-da-galera', 1, 'joao',     9, 'A atuação carrega o filme inteiro.'),
  ('clube-cinema-da-galera', 1, 'gabriel',  9, 'Pesado, mas necessário.'),
  ('clube-cinema-da-galera', 1, 'felipe',   9, 'Melhor abertura de temporada possível.'),
  ('clube-cinema-da-galera', 2, 'bia',      9, 'Clássico que envelheceu bem.'),
  ('clube-cinema-da-galera', 2, 'marina',   8, 'O final me pegou de surpresa.'),
  ('clube-cinema-da-galera', 2, 'joao',     9, 'A Fernanda Montenegro não erra.'),
  ('clube-cinema-da-galera', 2, 'gabriel',  8, 'Arrasta um pouco no meio.'),
  ('clube-cinema-da-galera', 2, 'felipe',   8, 'Nunca tinha visto. Valeu.'),
  ('clube-cinema-da-galera', 3, 'joao',     8, 'Escolha óbvia, e óbvia por um motivo.'),
  ('clube-cinema-da-galera', 3, 'marina',   7, 'Bom, mas não é meu tipo de filme.'),
  ('clube-cinema-da-galera', 3, 'bia',      8, 'Ritmo absurdo do começo ao fim.'),
  ('clube-cinema-da-galera', 3, 'gabriel',  8, 'O roteiro é melhor do que lembravam.'),
  ('clube-cinema-da-galera', 3, 'felipe',   7, 'Já tinha visto três vezes.'),
  ('clube-cinema-da-galera', 4, 'gabriel',  9, 'Eu avisei que valia a pena.'),
  ('clube-cinema-da-galera', 4, 'marina',   9, 'Melhor coisa que vi no clube até agora.'),
  ('clube-cinema-da-galera', 4, 'bia',      8, 'A fotografia é absurda, mas é pesado.'),
  ('clube-cinema-da-galera', 4, 'joao',     8, 'Dormi no meio, culpa minha.'),
  ('clube-cinema-da-galera', 4, 'felipe',   7, 'Já tinha visto e valeu de novo.')
on conflict (club_id, round_number, member_id) do nothing;
