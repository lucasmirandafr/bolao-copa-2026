import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminUsersList, { type AdminUserRow } from "@/components/AdminUsersList";
import AdminTabs from "@/components/AdminTabs";
import AdminDevPanel from "@/components/AdminDevPanel";
import PageHeader from "@/components/PageHeader";
import { GearIcon } from "@/components/icons";
import type { AppSetting } from "@/lib/types";

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

  const { data: users } = await supabase
    .from("profiles")
    .select("id, username, display_name, is_admin, created_at")
    .order("created_at", { ascending: true })
    .returns<AdminUserRow[]>();

  const { data: settings } = await supabase
    .from("app_settings")
    .select("key, value")
    .returns<AppSetting[]>();

  return (
    <div className="mx-auto w-full max-w-md px-4 py-6">
      <PageHeader
        icon={<GearIcon className="h-7 w-7" />}
        title="Administração"
        subtitle="Gerencie usuários e as regras do bolão."
      />

      <AdminTabs
        usersTab={<AdminUsersList users={users ?? []} currentUserId={user.id} />}
        devTab={<AdminDevPanel settings={settings ?? []} />}
      />
    </div>
  );
}
