"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { invalidateCache, invalidateCachePrefix } from "@/lib/cache";

export type PredictionState = { error?: string; success?: boolean } | null;

export async function savePrediction(
  _prevState: PredictionState,
  formData: FormData
): Promise<PredictionState> {
  const matchId = Number(formData.get("match_id"));
  const homeScore = Number(formData.get("home_score"));
  const awayScore = Number(formData.get("away_score"));

  if (
    !Number.isInteger(matchId) ||
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0
  ) {
    return { error: "Placar inválido." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Você precisa estar logado." };
  }

  const { data: existing } = await supabase
    .from("predictions")
    .select("confirmed")
    .eq("user_id", userData.user.id)
    .eq("match_id", matchId)
    .maybeSingle();

  if (existing?.confirmed) {
    return { error: "Palpite já confirmado, não pode ser editado." };
  }

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: userData.user.id,
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      confirmed: false,
    },
    { onConflict: "user_id,match_id" }
  );

  if (error) {
    return { error: "O jogo já começou ou houve um erro ao salvar o palpite." };
  }

  invalidateCache("matches:all");
  invalidateCachePrefix("predictions:match:");
  revalidatePath("/");
  revalidatePath("/perfil");
  return { success: true };
}

export async function confirmPrediction(
  _prevState: PredictionState,
  formData: FormData
): Promise<PredictionState> {
  const matchId = Number(formData.get("match_id"));

  if (!Number.isInteger(matchId)) {
    return { error: "Palpite inválido." };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return { error: "Você precisa estar logado." };
  }

  const { error } = await supabase
    .from("predictions")
    .update({ confirmed: true })
    .eq("user_id", userData.user.id)
    .eq("match_id", matchId);

  if (error) {
    return { error: "O jogo já começou ou houve um erro ao confirmar o palpite." };
  }

  invalidateCache("matches:all");
  invalidateCache("ranking:all");
  invalidateCachePrefix("predictions:match:");
  revalidatePath("/");
  revalidatePath("/perfil");
  return { success: true };
}
