import { getCached } from "@/lib/cache";
import { createClient } from "@/lib/supabase/server";
import type { Match, Prediction, RankingRow } from "@/lib/types";

const CACHE_TTL_SECONDS = 10;

export async function getMatchesWithCache() {
  return getCached<Match[]>("matches:all", CACHE_TTL_SECONDS, async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("matches")
      .select("*")
      .order("match_date", { ascending: true });
    return data ?? [];
  });
}

export async function getRankingWithCache() {
  return getCached<RankingRow[]>("ranking:all", CACHE_TTL_SECONDS, async () => {
    const supabase = await createClient();
    const { data } = await supabase.from("ranking").select("*");
    return data ?? [];
  });
}

export async function getLiveMatchWithCache(now: string, liveSince: string) {
  return getCached<Match | null>(
    `live-match:${Math.floor(new Date(now).getTime() / (60 * 1000))}`,
    CACHE_TTL_SECONDS,
    async () => {
      const supabase = await createClient();
      const { data: liveMatches } = await supabase
        .from("matches")
        .select("*")
        .lte("match_date", now)
        .gte("match_date", liveSince)
        .neq("status", "finished")
        .order("match_date", { ascending: false })
        .limit(1)
        .returns<Match[]>();

      if (liveMatches?.length) {
        return liveMatches[0];
      }

      const { data: nextMatches } = await supabase
        .from("matches")
        .select("*")
        .gt("match_date", now)
        .order("match_date", { ascending: true })
        .limit(1)
        .returns<Match[]>();

      return nextMatches?.[0] ?? null;
    }
  );
}

export async function getMatchPredictionsWithCache(matchId: number) {
  return getCached<Prediction[]>(`predictions:match:${matchId}`, CACHE_TTL_SECONDS, async () => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("predictions")
      .select("*")
      .eq("match_id", matchId)
      .returns<Prediction[]>();
    return data ?? [];
  });
}
