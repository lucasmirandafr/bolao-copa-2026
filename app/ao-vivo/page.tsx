import { createClient } from "@/lib/supabase/server";
import { getFlagUrl } from "@/lib/flags";
import { getLiveMatchWithCache, getMatchPredictionsWithCache } from "@/lib/supabase/cache";
import PageHeader from "@/components/PageHeader";
import { LiveIcon } from "@/components/icons";
import type { Match, Prediction } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AoVivoPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const LIVE_WINDOW_HOURS = 3;
  const nowDate = new Date();
  const now = nowDate.toISOString();
  const liveSince = new Date(nowDate.getTime() - LIVE_WINDOW_HOURS * 60 * 60 * 1000).toISOString();

  const match = await getLiveMatchWithCache(now, liveSince);

  const notStarted = match ? new Date(match.match_date).getTime() > nowDate.getTime() : false;

  let predictions: (Prediction & { username: string })[] = [];

  if (match) {
    const matchPredictions = await getMatchPredictionsWithCache(match.id);

    const userIds = matchPredictions.map((p) => p.user_id);
    const { data: profiles } =
      userIds.length > 0
        ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
        : { data: [] };

    const usernameById = new Map((profiles ?? []).map((p) => [p.id, p.display_name as string]));

    predictions = (matchPredictions ?? []).map((p) => ({
      ...p,
      username: usernameById.get(p.user_id) ?? "Jogador",
    }));

    const isFinished = match.status === "finished";
    predictions.sort((a, b) => {
      if (isFinished) {
        const diff = (b.points ?? -1) - (a.points ?? -1);
        if (diff !== 0) return diff;
      }
      return a.username.localeCompare(b.username, "pt-BR");
    });
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <PageHeader
        icon={<LiveIcon className="h-7 w-7" />}
        title="Ao vivo"
        subtitle={
          notStarted
            ? "Próximo jogo agendado."
            : "Palpites de todo mundo para o jogo atual."
        }
      />

      {!match && (
        <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
          Nenhum jogo cadastrado.
        </p>
      )}

      {match && (
        <>
          <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
              <span className="rounded-full bg-zinc-100 px-2 py-1 font-medium">{match.stage}</span>
              <span>{dateFormatter.format(new Date(match.match_date))}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-1 items-center gap-2">
                {getFlagUrl(match.home_team) && (
                  <img
                    src={getFlagUrl(match.home_team)!}
                    alt=""
                    className="h-4 w-6 shrink-0 rounded-sm object-cover"
                  />
                )}
                <span className="text-sm font-semibold leading-tight text-zinc-900">
                  {match.home_team}
                </span>
              </div>

              <span className="shrink-0 text-lg font-bold text-zinc-900">
                {match.home_score ?? "-"} x {match.away_score ?? "-"}
              </span>

              <div className="flex flex-1 items-center justify-end gap-2">
                <span className="text-right text-sm font-semibold leading-tight text-zinc-900">
                  {match.away_team}
                </span>
                {getFlagUrl(match.away_team) && (
                  <img
                    src={getFlagUrl(match.away_team)!}
                    alt=""
                    className="h-4 w-6 shrink-0 rounded-sm object-cover"
                  />
                )}
              </div>
            </div>

            <p className="mt-3 text-center text-xs font-medium text-zinc-400">
              {match.status === "finished"
                ? "Jogo finalizado"
                : notStarted
                  ? `Começa em ${dateFormatter.format(new Date(match.match_date))}`
                  : "Em andamento"}
            </p>
          </div>

          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-400">
            {match.status === "finished" ? "Ranking deste jogo" : "Palpites"}
          </h2>

          {predictions.length === 0 && (
            <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
              {notStarted
                ? "Os palpites aparecerão aqui quando o jogo começar."
                : "Ninguém deu palpite para esse jogo."}
            </p>
          )}

          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {predictions.map((prediction, index) => {
              const isCurrentUser = prediction.user_id === user?.id;
              return (
                <div
                  key={prediction.id}
                  className={`flex items-center justify-between border-b border-zinc-100 px-4 py-3 text-sm last:border-0 ${
                    isCurrentUser ? "bg-green-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {match.status === "finished" && (
                      <span className="w-5 text-xs font-semibold text-zinc-400">{index + 1}º</span>
                    )}
                    <span className="font-medium text-zinc-900">
                      {prediction.username}
                      {isCurrentUser && (
                        <span className="ml-1 text-xs text-green-600">(você)</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900">
                      {prediction.home_score} x {prediction.away_score}
                    </span>
                    {match.status === "finished" && prediction.points !== null && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          prediction.points === 10
                            ? "bg-green-100 text-green-700"
                            : prediction.points === 5
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        +{prediction.points} pts
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
