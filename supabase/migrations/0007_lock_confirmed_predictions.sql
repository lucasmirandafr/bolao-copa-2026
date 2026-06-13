-- Palpites confirmados não podem mais ser editados pelo usuário.

drop policy if exists "Usuário pode editar palpite na janela de 6h antes do jogo" on public.predictions;

create policy "Usuário pode editar palpite na janela de 6h antes do jogo"
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
        and m.match_date <= now() + interval '6 hours'
    )
  );
