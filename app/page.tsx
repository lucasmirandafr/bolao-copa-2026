import { createClient } from "@/lib/supabase/server";
import { getMatchesWithCache } from "@/lib/supabase/cache";
import MatchesList from "@/components/MatchesList";
import PageHeader from "@/components/PageHeader";
import { BallIcon } from "@/components/icons";
import type { Match, Prediction } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const matches = await getMatchesWithCache();

  const { data: predictions } = user
    ? await supabase.from("predictions").select("*").eq("user_id", user.id)
    : { data: null };

  const { data: profile } = user
    ? await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
    : { data: null };

  const isAdmin = !!profile?.is_admin;

  const predictionsByMatch = new Map<number, Prediction>(
    (predictions ?? []).map((p) => [p.match_id, p])
  );

  const items = ((matches ?? []) as Match[]).map((match) => ({
    match,
    prediction: predictionsByMatch.get(match.id) ?? null,
  }));

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <PageHeader
        icon={<BallIcon className="h-7 w-7" />}
        title="Jogos"
        subtitle="Dê seu palpite antes do início de cada jogo."
      />

      <MatchesList items={items} isAdmin={isAdmin} />
    </div>
  );
}
