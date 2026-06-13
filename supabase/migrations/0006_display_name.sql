-- =========================================================
-- Remove o e-mail do cadastro: agora o usuário informa apenas
-- um "Nome de exibição" (mostrado no ranking/perfil) e um
-- "Nickname" (usado para fazer login). Internamente o Supabase
-- Auth ainda exige um e-mail, então geramos um e-mail sintético
-- a partir do nickname (ex: "fulano@bolao.local").
-- =========================================================

alter table public.profiles
  add column display_name text;

update public.profiles
  set display_name = username
  where display_name is null;

alter table public.profiles
  alter column display_name set not null;

-- Atualiza o trigger de criação de perfil para preencher display_name.
create or replace function public.handle_new_user()
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

-- Atualiza a view de ranking para expor o nome de exibição.
-- (drop + create porque a ordem/nome das colunas mudou)
drop view if exists public.ranking;

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

-- Para se tornar admin, rode (substituindo o nickname):
--   update public.profiles set is_admin = true where username = 'seu_nickname';
