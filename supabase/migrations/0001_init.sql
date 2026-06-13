-- =========================================================
-- Bolão Copa do Mundo 2026 - schema inicial
-- Rode este script no SQL Editor do seu projeto Supabase.
--
-- Regras de pontuação (ajuste aqui se quiser mudar):
--   - Placar exato (gols casa e fora corretos): 10 pontos
--   - Resultado certo (vitória/empate/derrota) mas placar errado: 5 pontos
--   - Resultado errado: 0 pontos
-- =========================================================

create extension if not exists moddatetime schema extensions;

-- ---------------------------------------------------------
-- Tabela: profiles
-- Um registro por usuário autenticado, criado automaticamente.
-- ---------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Qualquer usuário autenticado pode ver perfis"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Usuário pode atualizar o próprio perfil"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Cria automaticamente um profile quando um novo usuário se cadastra.
-- O username/display_name vêm de raw_user_meta_data (definidos no signUp).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------
-- Tabela: matches
-- Lista de jogos da Copa. Resultado preenchido manualmente
-- pelo administrador (Table Editor do Supabase) após o jogo.
-- ---------------------------------------------------------
create table public.matches (
  id bigint generated always as identity primary key,
  stage text not null,
  home_team text not null,
  away_team text not null,
  match_date timestamptz not null,
  home_score int,
  away_score int,
  status text not null default 'scheduled' check (status in ('scheduled', 'finished')),
  created_at timestamptz not null default now()
);

alter table public.matches enable row level security;

create policy "Qualquer usuário autenticado pode ver os jogos"
  on public.matches for select
  to authenticated
  using (true);

create policy "Admin pode atualizar jogos"
  on public.matches for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- ---------------------------------------------------------
-- Tabela: predictions
-- Palpites dos usuários para cada jogo.
-- ---------------------------------------------------------
create table public.predictions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  match_id bigint not null references public.matches (id) on delete cascade,
  home_score int not null check (home_score >= 0),
  away_score int not null check (away_score >= 0),
  points int,
  confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);

alter table public.predictions enable row level security;

create policy "Usuário vê os próprios palpites"
  on public.predictions for select
  to authenticated
  using (auth.uid() = user_id);

-- Palpites de outros usuários ficam visíveis publicamente (para usuários
-- autenticados) assim que o jogo começa - usado na tela "Ao vivo".
create policy "Palpites visíveis após o início do jogo"
  on public.predictions for select
  to authenticated
  using (
    exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.match_date <= now()
    )
  );

create policy "Usuário pode criar palpite na janela de 6h antes do jogo"
  on public.predictions for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.status = 'scheduled'
        and m.match_date > now()
        and m.match_date <= now() + interval '6 hours'
    )
  );

create policy "Usuário pode editar palpite na janela de 6h antes do jogo"
  on public.predictions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.status = 'scheduled'
        and m.match_date > now()
        and m.match_date <= now() + interval '6 hours'
    )
  );

create trigger set_predictions_updated_at
  before update on public.predictions
  for each row execute procedure extensions.moddatetime (updated_at);

-- ---------------------------------------------------------
-- Pontuação automática
-- Quando um jogo é marcado como 'finished' com placar definido,
-- recalcula os pontos de todos os palpites daquele jogo.
-- ---------------------------------------------------------
create function public.calculate_points_for_match(p_match_id bigint)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  m record;
begin
  select home_score, away_score, status into m
  from public.matches where id = p_match_id;

  if m.status <> 'finished' or m.home_score is null or m.away_score is null then
    return;
  end if;

  update public.predictions p
  set points = case
    -- placar exato
    when p.home_score = m.home_score and p.away_score = m.away_score then 10
    -- mesmo resultado (vitória casa / vitória fora / empate)
    when sign(p.home_score - p.away_score) = sign(m.home_score - m.away_score) then 5
    else 0
  end
  where p.match_id = p_match_id;
end;
$$;

create function public.handle_match_finished()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.status = 'finished' and new.home_score is not null and new.away_score is not null then
    perform public.calculate_points_for_match(new.id);
  end if;
  return new;
end;
$$;

create trigger on_match_result_updated
  after update of status, home_score, away_score on public.matches
  for each row execute procedure public.handle_match_finished();

-- ---------------------------------------------------------
-- View: ranking
-- Soma de pontos por usuário, ordenada do maior para o menor.
-- ---------------------------------------------------------
create view public.ranking as
select
  pr.id as user_id,
  pr.display_name,
  pr.username,
  coalesce(sum(p.points), 0)::bigint as total_points,
  count(*) filter (where p.points = 10) as total_exact,
  count(p.id) as total_palpites
from public.profiles pr
left join public.predictions p on p.user_id = pr.id and p.points is not null
group by pr.id, pr.display_name, pr.username
order by total_points desc, total_exact desc, pr.username asc;

grant select on public.ranking to authenticated;
