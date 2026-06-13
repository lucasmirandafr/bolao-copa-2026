import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente com service_role key, usado apenas em server actions para
 * operações administrativas (ex: trocar a senha de outro usuário).
 * Requer a env var SUPABASE_SERVICE_ROLE_KEY (NUNCA expor no client).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
