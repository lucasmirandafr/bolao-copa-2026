-- Permite que administradores editem nome/nick de qualquer usuário.

drop policy if exists "Admin pode atualizar perfis" on public.profiles;

create policy "Admin pode atualizar perfis"
  on public.profiles for update
  to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  )
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
