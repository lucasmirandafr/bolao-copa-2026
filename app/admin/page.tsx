import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminMatchRow from "@/components/AdminMatchRow";
import type { Match } from "@/lib/types";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { data: matches } = await supabase
    .from("matches")
    .select("*")
    .order("match_date", { ascending: true })
    .returns<Match[]>();

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <h1 className="mb-1 text-xl font-bold text-zinc-900">Administração</h1>
      <p className="mb-4 text-sm text-zinc-500">
        Atualize o placar e marque o jogo como finalizado para calcular os pontos.
      </p>

      <div className="flex flex-col gap-3">
        {(matches ?? []).map((match) => (
          <AdminMatchRow key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
