-- Catálogo de filmes no banco.
--
-- No CP5 os filmes eram um JSON de nove títulos dentro do aplicativo. Com a
-- busca ligada à API do TMDB, o curador pode escolher qualquer filme — e o que
-- ele escolher precisa ficar guardado, senão a rodada seguinte não saberia
-- dizer o nome do que o clube assistiu.
--
-- Os nove filmes do CP4 entram aqui com `poster_url` nulo de propósito: a arte
-- deles está no repositório desde o CP4 e continua sendo usada. Filme novo vem
-- do TMDB e traz a própria URL.

create table if not exists movies (
  id              text primary key,
  title           text    not null,
  year            integer not null,
  genres          text[]  not null default '{}',
  runtime_minutes integer not null default 0,
  streaming       text    not null default '',
  synopsis        text    not null default '',
  poster_url      text,
  created_at      timestamptz not null default now()
);

alter table movies enable row level security;

drop policy if exists prototipo_leitura on movies;
drop policy if exists prototipo_escrita on movies;
create policy prototipo_leitura on movies for select using (true);
create policy prototipo_escrita on movies for all using (true) with check (true);

insert into movies (id, title, year, genres, runtime_minutes, streaming, synopsis, poster_url) values
  ('cidade-de-deus', 'Cidade de Deus', 2002, array['Drama', 'Crime'], 130, 'Netflix', 'Dois garotos crescem na mesma favela do Rio e seguem caminhos opostos: um pega a câmera, o outro pega a arma.', null),
  ('ainda-estou-aqui', 'Ainda Estou Aqui', 2024, array['Drama', 'História'], 137, 'Globoplay', 'Uma família é desfeita por um ato de violência da ditadura, e a mãe sustenta a casa e a memória por décadas.', null),
  ('tropa-de-elite', 'Tropa de Elite', 2007, array['Ação', 'Drama'], 115, 'Netflix', 'Um capitão do BOPE procura quem o substitua enquanto a corrupção aperta de todos os lados.', null),
  ('central-do-brasil', 'Central do Brasil', 1998, array['Drama'], 110, 'Globoplay', 'Uma escrevente de cartas de estação e um menino órfão atravessam o país atrás de um pai que talvez não exista.', null),
  ('cidade-dos-homens', 'Cidade dos Homens', 2007, array['Drama'], 106, 'Globoplay', 'Dois amigos de infância enfrentam a paternidade cedo demais, no meio de uma guerra que não escolheram.', null),
  ('cidade-baixa', 'Cidade Baixa', 2005, array['Drama', 'Romance'], 98, 'Prime Video', 'Dois amigos que dividem tudo descobrem que não conseguem dividir a mesma mulher.', null),
  ('bacurau', 'Bacurau', 2019, array['Drama', 'Faroeste'], 131, 'Prime Video', 'Um povoado do sertão some do mapa, literalmente, e a cidade descobre que virou alvo de uma caçada.', null),
  ('auto-da-compadecida', 'O Auto da Compadecida', 2000, array['Comédia', 'Aventura'], 104, 'Globoplay', 'Dois amarelos do sertão enganam padre, padeiro e cangaceiro até esbarrarem no julgamento final.', null),
  ('que-horas-ela-volta', 'Que Horas Ela Volta?', 2015, array['Drama'], 112, 'Prime Video', 'Uma empregada doméstica vê as regras invisíveis da casa desabarem quando a filha chega para o vestibular.', null)
on conflict (id) do nothing;
