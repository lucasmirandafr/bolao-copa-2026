"use client";

import { useActionState } from "react";
import { updateAppSettings, type AdminState } from "@/lib/actions/admin";
import type { AppSetting } from "@/lib/types";

type Props = {
  settings: AppSetting[];
};

export default function AdminDevPanel({ settings }: Props) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(
    updateAppSettings,
    null
  );

  const getValue = (key: string, fallback: string) =>
    settings.find((s) => s.key === key)?.value ?? fallback;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-bold text-zinc-900">Regras do bolão</h2>
        <p className="mb-3 text-xs text-zinc-500">
          Esses valores controlam diretamente o banco de dados (RLS e cálculo de pontos).
        </p>

        <form
          action={formAction}
          onSubmit={(e) => {
            if (!confirm("Confirma salvar as novas regras do bolão?")) {
              e.preventDefault();
            }
          }}
          className="flex flex-col gap-3"
        >
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Horas de carência para fechar os palpites
            <input
              type="number"
              name="prediction_lock_hours"
              defaultValue={getValue("prediction_lock_hours", "6")}
              min={1}
              step={1}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Pontos por placar exato
            <input
              type="number"
              name="points_exact"
              defaultValue={getValue("points_exact", "10")}
              min={0}
              step={1}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900"
              required
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Pontos por acertar o resultado (vencedor/empate)
            <input
              type="number"
              name="points_result"
              defaultValue={getValue("points_result", "5")}
              min={0}
              step={1}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900"
              required
            />
          </label>

          {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
          {state?.success && <p className="text-xs text-green-600">Salvo com sucesso.</p>}

          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Salvando..." : "Salvar regras"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-bold text-zinc-900">Como o palpite trava</h2>
        <p className="mb-2 text-xs text-zinc-500">
          Política de RLS em <code>predictions</code> (insert/update):
        </p>
        <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-[11px] text-zinc-100">
{`m.status = 'scheduled'
and m.match_date > now()
and m.match_date <= now() + (
  (select value::numeric from app_settings
   where key = 'prediction_lock_hours') * interval '1 hour'
)`}
        </pre>
        <p className="mt-3 text-xs text-zinc-500">
          Depois de <code>confirmed = true</code>, o palpite não pode mais ser editado
          (ver migration <code>0007_lock_confirmed_predictions.sql</code>).
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-bold text-zinc-900">Cálculo dos pontos</h2>
        <p className="mb-2 text-xs text-zinc-500">
          Função <code>calculate_points_for_match</code>, chamada quando um jogo é
          marcado como <code>finished</code>:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-[11px] text-zinc-100">
{`case
  when p.home_score = m.home_score
   and p.away_score = m.away_score
    then points_exact   -- placar exato
  when sign(p.home_score - p.away_score)
     = sign(m.home_score - m.away_score)
    then points_result  -- mesmo vencedor/empate
  else 0
end`}
        </pre>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-bold text-zinc-900">Liberar palpites em jogo já começado</h2>
        <p className="mb-2 text-xs text-zinc-500">
          No card do jogo (página "Jogos"), o admin pode marcar{" "}
          <code>allow_late_predictions</code>. Isso só vale para criar um
          palpite novo (insert) de quem ainda não apostou nesse jogo — a
          política de edição não muda:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-[11px] text-zinc-100">
{`-- insert
m.status = 'scheduled'
and (
  m.allow_late_predictions
  or (
    m.match_date > now()
    and m.match_date <= now() + (
      (select value::numeric from app_settings
       where key = 'prediction_lock_hours') * interval '1 hour'
    )
  )
)`}
        </pre>
        <p className="mt-3 text-xs text-zinc-500">
          Quem já tem palpite no jogo continua só podendo editar dentro da
          janela normal. Migration <code>0012_late_predictions.sql</code>.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-bold text-zinc-900">Pontuação automática</h2>
        <p className="mb-2 text-xs text-zinc-500">
          Quando o admin marca um jogo como "Finalizado" com o placar real, um
          trigger recalcula os pontos de todos os palpites daquele jogo:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-[11px] text-zinc-100">
{`create trigger on_match_result_updated
  after update of status, home_score, away_score
  on matches
  for each row execute function handle_match_finished();

-- handle_match_finished():
if new.status = 'finished'
   and new.home_score is not null
   and new.away_score is not null then
  perform calculate_points_for_match(new.id);
end if;`}
        </pre>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-bold text-zinc-900">Ranking</h2>
        <p className="mb-2 text-xs text-zinc-500">
          View <code>ranking</code>, usada na página "Ranking":
        </p>
        <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-[11px] text-zinc-100">
{`select
  pr.id as user_id,
  pr.display_name,
  pr.username,
  coalesce(sum(p.points), 0) as total_points,
  count(*) filter (where p.points = 10) as total_exact,
  count(*) filter (where p.points = 5) as total_result,
  count(p.id) as total_palpites
from profiles pr
left join predictions p
  on p.user_id = pr.id and p.points is not null
group by pr.id, pr.display_name, pr.username
order by total_points desc, total_exact desc, pr.username asc;`}
        </pre>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-bold text-zinc-900">"Jogo encerrado" nas listas</h2>
        <p className="mb-2 text-xs text-zinc-500">
          Em <code>MatchesList.tsx</code> e <code>MyPredictionsList.tsx</code>, um jogo
          entra no grupo "encerrados" se:
        </p>
        <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-[11px] text-zinc-100">
{`const FINISH_GRACE_MS = 2.5 * 60 * 60 * 1000; // 2h30

function isMatchOver(match, now) {
  if (match.status === "finished") return true;
  return now.getTime() - new Date(match.match_date).getTime() > FINISH_GRACE_MS;
}`}
        </pre>
        <p className="mt-3 text-xs text-zinc-500">
          Esse valor é fixo no código (front-end), diferente das regras acima que vêm
          do banco.
        </p>
      </div>
    </div>
  );
}
