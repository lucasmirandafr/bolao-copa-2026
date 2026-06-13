import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMatchesWithCache } from "@/lib/supabase/cache";
import MyPredictionsList from "@/components/MyPredictionsList";
import PageHeader from "@/components/PageHeader";
import { NotesIcon } from "@/components/icons";
import type { Match, Prediction } from "@/lib/types";

export default async function PalpitesPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    redirect("/login");
  }

  const [{ data: predictions }, matches] = await Promise.all([
    supabase.from("predictions").select("*").eq("user_id", user.id).returns<Prediction[]>(),
    getMatchesWithCache(),
  ]);

  const matchById = new Map((matches ?? []).map((m) => [m.id, m]));

  const myPredictions = (predictions ?? [])
    .map((p) => ({ prediction: p, match: matchById.get(p.match_id) }))
    .filter((p): p is { prediction: Prediction; match: Match } => Boolean(p.match))
    .sort((a, b) => new Date(a.match.match_date).getTime() - new Date(b.match.match_date).getTime());

  const totalPalpites = myPredictions.length;
  const graded = myPredictions.filter(({ prediction }) => prediction.points !== null);
  const totalExact = graded.filter(({ prediction }) => prediction.points === 10).length;
  const totalResult = graded.filter(({ prediction }) => prediction.points === 5).length;
  const totalWrong = graded.filter(({ prediction }) => prediction.points === 0).length;
  const totalPoints = graded.reduce((sum, { prediction }) => sum + (prediction.points ?? 0), 0);
  const aproveitamento = graded.length > 0 ? (totalPoints / (graded.length * 10)) * 100 : 0;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <PageHeader
        icon={<NotesIcon className="h-7 w-7" />}
        title="Meus palpites"
        subtitle="Acompanhe seus palpites e seu desempenho."
      />

      <div className="mb-6 grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center">
          <p className="text-2xl font-bold text-zinc-900">{totalPalpites}</p>
          <p className="text-xs text-zinc-500">palpites</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{totalExact}</p>
          <p className="text-xs text-zinc-500">placares exatos</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{totalResult}</p>
          <p className="text-xs text-zinc-500">resultados certos</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{totalWrong}</p>
          <p className="text-xs text-zinc-500">erros</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center">
          <p className="text-2xl font-bold text-zinc-900">{totalPoints}</p>
          <p className="text-xs text-zinc-500">pontos</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center">
          <p className="text-2xl font-bold text-zinc-900">{aproveitamento.toFixed(0)}%</p>
          <p className="text-xs text-zinc-500">aproveitamento</p>
        </div>
      </div>

      <MyPredictionsList items={myPredictions} />
    </div>
  );
}
