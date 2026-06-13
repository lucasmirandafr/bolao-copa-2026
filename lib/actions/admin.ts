"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { invalidateCache, invalidateCachePrefix } from "@/lib/cache";

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

  invalidateCache("matches:all");
  invalidateCache("ranking:all");
  invalidateCachePrefix("predictions:match:");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/ranking");
  revalidatePath("/perfil");
  revalidatePath("/ao-vivo");
  return { success: true };
}

export async function setMatchLatePredictions(
  _prevState: AdminState,
  formData: FormData
): Promise<AdminState> {
  const matchId = Number(formData.get("match_id"));
  const allowLatePredictions = formData.get("allow_late_predictions") === "on";

  if (!Number.isInteger(matchId)) {
    return { error: "Dados inválidos." };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("matches")
    .update({ allow_late_predictions: allowLatePredictions })
    .eq("id", matchId);

  if (error) {
    return { error: "Não foi possível salvar. Você é administrador?" };
  }

  invalidateCache("matches:all");
  invalidateCache("ranking:all");
  invalidateCachePrefix("predictions:match:");
  revalidatePath("/");
  revalidatePath("/ao-vivo");
  return { success: true };
}

export async function updateUserAccount(
  _prevState: AdminState,
  formData: FormData
): Promise<AdminState> {
  const userId = String(formData.get("user_id") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!userId || !username || !displayName) {
    return { error: "Preencha nome e nick." };
  }

  if (password && password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres." };
  }

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user?.id ?? "")
    .single();

  if (!me?.is_admin) {
    return { error: "Apenas administradores podem editar usuários." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username, display_name: displayName })
    .eq("id", userId);

  if (error) {
    return { error: "Não foi possível salvar o usuário (nick já em uso?)." };
  }

  if (password) {
    try {
      const adminClient = createAdminClient();
      const { error: passwordError } = await adminClient.auth.admin.updateUserById(userId, {
        password,
      });
      if (passwordError) {
        return { error: "Usuário salvo, mas não foi possível alterar a senha." };
      }
    } catch {
      return { error: "Usuário salvo, mas a alteração de senha não está configurada no servidor." };
    }
  }

  revalidatePath("/perfil");
  return { success: true };
}

export async function deleteUserAccount(
  _prevState: AdminState,
  formData: FormData
): Promise<AdminState> {
  const userId = String(formData.get("user_id") ?? "");

  if (!userId) {
    return { error: "Usuário inválido." };
  }

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  if (userId === userData.user?.id) {
    return { error: "Você não pode excluir sua própria conta." };
  }

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user?.id ?? "")
    .single();

  if (!me?.is_admin) {
    return { error: "Apenas administradores podem excluir usuários." };
  }

  try {
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.deleteUser(userId);
    if (error) {
      return { error: "Não foi possível excluir o usuário." };
    }
  } catch {
    return { error: "Exclusão de usuário não está configurada no servidor." };
  }

  revalidatePath("/perfil");
  revalidatePath("/ranking");
  return { success: true };
}

export async function updateAppSettings(
  _prevState: AdminState,
  formData: FormData
): Promise<AdminState> {
  const lockHours = Number(formData.get("prediction_lock_hours"));
  const pointsExact = Number(formData.get("points_exact"));
  const pointsResult = Number(formData.get("points_result"));

  if (
    !Number.isFinite(lockHours) ||
    lockHours <= 0 ||
    !Number.isInteger(pointsExact) ||
    pointsExact < 0 ||
    !Number.isInteger(pointsResult) ||
    pointsResult < 0
  ) {
    return { error: "Valores inválidos." };
  }

  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user?.id ?? "")
    .single();

  if (!me?.is_admin) {
    return { error: "Apenas administradores podem alterar configurações." };
  }

  const updates = [
    { key: "prediction_lock_hours", value: String(lockHours) },
    { key: "points_exact", value: String(pointsExact) },
    { key: "points_result", value: String(pointsResult) },
  ];

  for (const update of updates) {
    const { error } = await supabase
      .from("app_settings")
      .update({ value: update.value })
      .eq("key", update.key);

    if (error) {
      return { error: "Não foi possível salvar as configurações." };
    }
  }

  revalidatePath("/admin");
  return { success: true };
}
