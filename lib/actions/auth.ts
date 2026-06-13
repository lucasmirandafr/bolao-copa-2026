"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error: string } | null;

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// O Supabase Auth exige um e-mail; geramos um sintético a partir do nickname
// já que o app não pede e-mail no cadastro/login.
function emailFromUsername(username: string): string {
  return `${username.toLowerCase()}@bolao.local`;
}

export async function login(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: emailFromUsername(username),
    password,
  });

  if (error) {
    return { error: "Nickname ou senha inválidos." };
  }

  redirect("/");
}

export async function signup(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const username = String(formData.get("username") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!USERNAME_REGEX.test(username)) {
    return {
      error: "O nickname deve ter de 3 a 20 caracteres (letras, números ou _).",
    };
  }
  if (displayName.length < 2) {
    return { error: "O nome de exibição precisa ter pelo menos 2 caracteres." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: emailFromUsername(username),
    password,
    options: { data: { username, display_name: displayName } },
  });

  if (error) {
    console.error("signup error:", error);
    if (
      error.message.toLowerCase().includes("already") ||
      error.code === "23505" ||
      error.message.toLowerCase().includes("duplicate")
    ) {
      return { error: "Esse nickname já está em uso." };
    }
    return { error: `Não foi possível criar a conta: ${error.message}` };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
