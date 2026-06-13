-- Configurações editáveis pelo admin: janela de palpites e regras de pontuação.

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "Qualquer usuário autenticado pode ver configurações" on public.app_settings;
create policy "Qualquer usuário autenticado pode ver configurações"
  on public.app_settings for select
  to authenticated
  using (true);

drop policy if exists "Admin pode atualizar configurações" on public.app_settings;
create policy "Admin pode atualizar configurações"
  on public.app_settings for update
  to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

create trigger set_app_settings_updated_at
  before update on public.app_settings
  for each row execute procedure extensions.moddatetime (updated_at);

insert into public.app_settings (key, value) values
  ('prediction_lock_hours', '6'),
  ('points_exact', '10'),
  ('points_result', '5')
on conflict (key) do nothing;

-- ---------------------------------------------------------
-- Janela para criar/editar palpites passa a usar app_settings
-- em vez do valor fixo de 6 horas.
-- ---------------------------------------------------------
drop policy if exists "Usuário pode criar palpite na janela de 6h antes do jogo" on public.predictions;
create policy "Usuário pode criar palpite na janela configurável antes do jogo"
  on public.predictions for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.status = 'scheduled'
        and m.match_date > now()
        and m.match_date <= now() + (
          (select value::numeric from public.app_settings where key = 'prediction_lock_hours') * interval '1 hour'
        )
    )
  );

drop policy if exists "Usuário pode editar palpite na janela de 6h antes do jogo" on public.predictions;
create policy "Usuário pode editar palpite na janela configurável antes do jogo"
  on public.predictions for update
  to authenticated
  using (auth.uid() = user_id and confirmed = false)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.status = 'scheduled'
        and m.match_date > now()
        and m.match_date <= now() + (
          (select value::numeric from public.app_settings where key = 'prediction_lock_hours') * interval '1 hour'
        )
    )
  );

-- ---------------------------------------------------------
-- Pontuação passa a usar app_settings (points_exact / points_result)
-- em vez dos valores fixos 10 / 5.
-- ---------------------------------------------------------
create or replace function public.calculate_points_for_match(p_match_id bigint)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  m record;
  v_points_exact int;
  v_points_result int;
begin
  select home_score, away_score, status into m
  from public.matches where id = p_match_id;

  if m.status <> 'finished' or m.home_score is null or m.away_score is null then
    return;
  end if;

  select coalesce((select value::int from public.app_settings where key = 'points_exact'), 10) into v_points_exact;
  select coalesce((select value::int from public.app_settings where key = 'points_result'), 5) into v_points_result;

  update public.predictions p
  set points = case
    when p.home_score = m.home_score and p.away_score = m.away_score then v_points_exact
    when sign(p.home_score - p.away_score) = sign(m.home_score - m.away_score) then v_points_result
    else 0
  end
  where p.match_id = p_match_id;
end;
$$;
