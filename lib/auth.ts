import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  await syncProfile(user);
  return user;
}

export async function syncProfile(user: NonNullable<Awaited<ReturnType<typeof getUser>>>) {
  const admin = createAdminClient();
  const metadata = user.user_metadata ?? {};

  await admin.from("profiles").upsert({
    id: user.id,
    email: user.email,
    name: metadata.full_name ?? metadata.name ?? user.email?.split("@")[0] ?? "Sin nombre",
    avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
    updated_at: new Date().toISOString(),
  });
}
