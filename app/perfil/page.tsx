import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import type { Match, Prediction, RankingRow } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function PerfilPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: predictions }, { data: matches }, { data: ranking }] =
    await Promise.all([
      supabase.from("profiles").select("display_name, is_admin").eq("id", user.id).single(),
      supabase
        .from("predictions")
        .select("*")
        .eq("user_id", user.id)
        .returns<Prediction[]>(),
      supabase.from("matches").select("*").order("match_date", { ascending: true }).returns<Match[]>(),
      supabase.from("ranking").select("*").returns<RankingRow[]>(),
    ]);

  const matchById = new Map((matches ?? []).map((m) => [m.id, m]));
  const myRanking = (ranking ?? []).find((r) => r.user_id === user.id);
  const position = (ranking ?? []).findIndex((r) => r.user_id === user.id);

  const myPredictions = (predictions ?? [])
    .map((p) => ({ prediction: p, match: matchById.get(p.match_id) }))
    .filter((p): p is { prediction: Prediction; match: Match } => Boolean(p.match))
    .sort((a, b) => new Date(a.match.match_date).getTime() - new Date(b.match.match_date).getTime());

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-500">Jogador</p>
        <h1 className="text-xl font-bold text-zinc-900">{profile?.display_name}</h1>

        <div className="mt-4 flex gap-4">
          <div>
            <p className="text-2xl font-bold text-green-600">{myRanking?.total_points ?? 0}</p>
            <p className="text-xs text-zinc-500">pontos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{myRanking?.total_exact ?? 0}</p>
            <p className="text-xs text-zinc-500">placares exatos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">
              {position >= 0 ? `${position + 1}º` : "-"}
            </p>
            <p className="text-xs text-zinc-500">posição</p>
          </div>
        </div>

        {profile?.is_admin && (
          <Link
            href="/admin"
            className="mt-4 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-semibold text-zinc-700 active:bg-zinc-50"
          >
            Painel administrativo
          </Link>
        )}

        <form action={logout} className="mt-4">
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 active:bg-zinc-50"
          >
            Sair
          </button>
        </form>
      </div>

      <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-zinc-400">
        Meus palpites
      </h2>

      {myPredictions.length === 0 && (
        <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">
          Você ainda não deu nenhum palpite.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {myPredictions.map(({ prediction, match }) => (
          <div
            key={prediction.id}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium text-zinc-900">
                {match.home_team} x {match.away_team}
              </p>
              <p className="text-xs text-zinc-500">{dateFormatter.format(new Date(match.match_date))}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-zinc-900">
                {prediction.home_score} x {prediction.away_score}
              </p>
              {prediction.points !== null && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    prediction.points === 10
                      ? "bg-green-100 text-green-700"
                      : prediction.points === 5
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-600"
                  }`}
                >
                  {prediction.points === 10 ? "✓ Cravou" : prediction.points === 5 ? "≈ Resultado" : "✗ Errou"}
                  {" · "}+{prediction.points} pts
                </span>
              )}
              {match.status === "finished" && prediction.points === null && (
                <p className="text-xs text-zinc-400">Aguardando cálculo</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
