import { createClient } from "@/lib/supabase/server";
import { getRankingWithCache } from "@/lib/supabase/cache";
import RankingTable from "@/components/RankingTable";
import PageHeader from "@/components/PageHeader";
import { TrophyIcon } from "@/components/icons";
import type { RankingRow } from "@/lib/types";

export default async function RankingPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const ranking = await getRankingWithCache();

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <PageHeader
        icon={<TrophyIcon className="h-7 w-7" />}
        title="Ranking"
        subtitle="Classificação geral do bolão."
      />

      <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 text-xs">
        <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-zinc-400">
          Como funciona a pontuação
        </h2>
        <ul className="flex flex-col gap-1.5 text-zinc-600">
          <li className="flex flex-nowrap items-center gap-1.5">
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
              ✓ Cravou
            </span>
            <span>
              Acertou o placar exato:{" "}
              <span className="font-semibold text-zinc-900">+10 pts</span>
            </span>
          </li>
          <li className="flex flex-nowrap items-center gap-1.5">
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-yellow-100 px-1.5 py-0.5 text-[10px] font-semibold text-yellow-700">
              ≈ Resultado
            </span>
            <span>
              Acertou o vencedor, mas não o placar:{" "}
              <span className="font-semibold text-zinc-900">+5 pts</span>
            </span>
          </li>
          <li className="flex flex-nowrap items-center gap-1.5">
            <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
              ✗ Errou
            </span>
            <span>
              Errou o resultado:{" "}
              <span className="font-semibold text-zinc-900">0 pts</span>
            </span>
          </li>
        </ul>
        <p className="mt-3 text-[11px] text-zinc-500">
          <span className="font-semibold">Palpites</span>, <span className="font-semibold">acertos</span>{" "}
          e <span className="font-semibold">exatas</span> mostram quantos palpites já foram
          feitos, quantos acertaram o resultado e quantos cravaram o placar exato.
        </p>
      </div>

      <RankingTable rows={ranking ?? []} currentUserId={userData.user?.id} />
    </div>
  );
}
