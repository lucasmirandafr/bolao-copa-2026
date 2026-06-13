-- Permite que usuários marcados como admin atualizem o placar/status
-- dos jogos pela própria interface (tela /admin), em vez de precisar
-- usar o Table Editor do Supabase.

create policy "Admin pode atualizar jogos"
  on public.matches for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- Para se tornar admin, rode (substituindo o nickname):
--   update public.profiles set is_admin = true where username = 'seu_nickname';
