import { createClient } from "@/lib/supabase/server";
import RankingTable from "@/components/RankingTable";
import type { RankingRow } from "@/lib/types";

export default async function RankingPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const { data: ranking } = await supabase
    .from("ranking")
    .select("*")
    .returns<RankingRow[]>();

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="mb-1 text-xl font-bold text-zinc-900">Ranking</h1>
      <p className="mb-4 text-sm text-zinc-500">Classificação geral do bolão.</p>

      <RankingTable rows={ranking ?? []} currentUserId={userData.user?.id} />
    </div>
  );
}
