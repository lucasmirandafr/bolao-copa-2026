"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AdminState = { error?: string; success?: boolean } | null;

export async function updateMatchResult(
  _prevState: AdminState,
  formData: FormData
): Promise<AdminState> {
  const matchId = Number(formData.get("match_id"));
  const homeScore = Number(formData.get("home_score"));
  const awayScore = Number(formData.get("away_score"));
  const status = String(formData.get("status") ?? "scheduled");

  if (
    !Number.isInteger(matchId) ||
    !Number.isInteger(homeScore) ||
    !Number.isInteger(awayScore) ||
    homeScore < 0 ||
    awayScore < 0 ||
    (status !== "scheduled" && status !== "finished")
  ) {
    return { error: "Dados inválidos." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("matches")
    .update({ home_score: homeScore, away_score: awayScore, status })
    .eq("id", matchId);

  if (error) {
    return { error: "Não foi possível salvar o resultado. Você é administrador?" };
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/perfil");
  revalidatePath("/ao-vivo");
  return { success: true };
}
