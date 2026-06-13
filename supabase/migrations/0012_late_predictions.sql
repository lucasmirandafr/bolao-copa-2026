-- Permite que o admin libere palpites em um jogo específico mesmo após
-- o início (ex: jogo já começou mas o admin quer permitir apostas).

alter table public.matches
  add column if not exists allow_late_predictions boolean not null default false;

-- ---------------------------------------------------------
-- Criar palpite: além da janela configurável antes do jogo, também
-- permite quando allow_late_predictions = true (apenas para quem
-- ainda não tem palpite registrado nesse jogo, já que isso é um
-- "insert"), desde que o jogo ainda não tenha sido finalizado.
-- ---------------------------------------------------------
drop policy if exists "Usuário pode criar palpite na janela configurável antes do jogo" on public.predictions;
create policy "Usuário pode criar palpite na janela configurável antes do jogo"
  on public.predictions for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.matches m
      where m.id = match_id
        and m.status = 'scheduled'
        and (
          m.allow_late_predictions
          or (
            m.match_date > now()
            and m.match_date <= now() + (
              (select value::numeric from public.app_settings where key = 'prediction_lock_hours') * interval '1 hour'
            )
          )
        )
    )
  );

-- ---------------------------------------------------------
-- Editar palpite: allow_late_predictions NÃO se aplica aqui — quem já
-- registrou um palpite não pode mais alterá-lo após a janela normal,
-- mesmo que o admin libere o jogo para novos palpites.
-- ---------------------------------------------------------
drop policy if exists "Usuário pode editar palpite na janela configurável antes do jogo" on public.predictions;
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
