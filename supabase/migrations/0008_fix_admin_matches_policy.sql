-- A migration 0005 tentava criar a coluna "is_admin" novamente (ela já existia
-- desde a 0001), o que faz o `alter table add column` falhar e impede que o
-- restante daquela migration seja aplicado — incluindo a policy abaixo, que
-- permite que admins atualizem o placar/status dos jogos pela tela /admin.

drop policy if exists "Admin pode atualizar jogos" on public.matches;

create policy "Admin pode atualizar jogos"
  on public.matches for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
