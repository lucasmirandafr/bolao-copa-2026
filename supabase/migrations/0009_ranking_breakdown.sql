-- Adiciona a contagem de "acertou o resultado" (vitória/empate, +5 pts)
-- à view de ranking, para detalhar o desempenho de cada jogador.

drop view if exists public.ranking;

create view public.ranking as
select
  pr.id as user_id,
  pr.display_name,
  pr.username,
  coalesce(sum(p.points), 0)::bigint as total_points,
  count(*) filter (where p.points = 10) as total_exact,
  count(*) filter (where p.points = 5) as total_result,
  count(p.id) as total_palpites
from public.profiles pr
left join public.predictions p on p.user_id = pr.id and p.points is not null
group by pr.id, pr.display_name, pr.username
order by total_points desc, total_exact desc, pr.username asc;

grant select on public.ranking to authenticated;
