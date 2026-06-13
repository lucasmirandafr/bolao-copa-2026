import { createClient } from "@/lib/supabase/server";
import MatchCard from "@/components/MatchCard";
import type { Match, Prediction } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: true });

  const { data: predictions } = user
    ? await supabase.from("predictions").select("*").eq("user_id", user.id)
    : { data: null };

  const predictionsByMatch = new Map<number, Prediction>(
    (predictions ?? []).map((p) => [p.match_id, p])
  );

  const dayFormatter = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });

  const groups = new Map<string, Match[]>();
  for (const match of (matches ?? []) as Match[]) {
    const day = dayFormatter.format(new Date(match.match_date));
    const list = groups.get(day) ?? [];
    list.push(match);
    groups.set(day, list);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="mb-1 text-xl font-bold text-zinc-900">Jogos</h1>
      <p className="mb-4 text-sm text-zinc-500">Dê seu palpite antes do início de cada jogo.</p>

      {groups.size === 0 && (
        <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
          Nenhum jogo cadastrado ainda.
        </p>
      )}

      <div className="flex flex-col gap-6">
        {Array.from(groups.entries()).map(([day, dayMatches]) => (
          <section key={day}>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-400">
              {day}
            </h2>
            <div className="flex flex-col gap-3">
              {dayMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={predictionsByMatch.get(match.id) ?? null}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
