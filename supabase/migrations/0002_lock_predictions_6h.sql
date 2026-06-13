-- Palpites só ficam disponíveis na janela de 6 horas antes do início do jogo
-- (antes disso o jogo aparece bloqueado/indisponível para palpite).

drop policy if exists "Usuário pode criar palpite antes do jogo começar" on public.predictions;
drop policy if exists "Usuário pode editar palpite antes do jogo começar" on public.predictions;
drop policy if exists "Usuário pode criar palpite até 6h antes do jogo" on public.predictions;
drop policy if exists "Usuário pode editar palpite até 6h antes do jogo" on public.predictions;

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
