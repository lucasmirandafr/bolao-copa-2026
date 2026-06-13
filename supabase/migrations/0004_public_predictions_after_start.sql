-- Permite que qualquer usuário autenticado veja os palpites de todos
-- para um jogo que já começou (usado na tela "Ao vivo").
-- A política de select existente ("Usuário vê os próprios palpites")
-- continua valendo e é combinada com OR a esta nova política.

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
