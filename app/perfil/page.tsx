import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/actions/auth";
import PageHeader from "@/components/PageHeader";
import { UserIcon } from "@/components/icons";

export default async function PerfilPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, username, is_admin, created_at")
    .eq("id", user.id)
    .single();

  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <PageHeader
        icon={<UserIcon className="h-7 w-7" />}
        title="Perfil"
        subtitle="Seus dados de cadastro."
      />

      <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-sm text-zinc-500">Usuário</p>
        <h1 className="text-xl font-bold text-zinc-900">{profile?.display_name}</h1>
        <p className="mt-1 text-sm text-zinc-500">@{profile?.username}</p>
        {createdAt && (
          <p className="mt-1 text-xs text-zinc-400">Cadastrado em {createdAt}</p>
        )}

        {profile?.is_admin && (
          <Link
            href="/admin"
            className="mt-4 block w-full rounded-lg border border-zinc-300 px-4 py-2 text-center text-sm font-semibold text-zinc-700 active:bg-zinc-50"
          >
            Painel administrativo
          </Link>
        )}

        <form action={logout} className="mt-4">
          <button
            type="submit"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 active:bg-zinc-50"
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
