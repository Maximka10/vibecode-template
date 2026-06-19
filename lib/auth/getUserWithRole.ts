import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { User } from "@supabase/supabase-js";

export type Role = "admin" | "client" | null;

export type UserWithRole = {
  user: User;
  role: Role;
};

/**
 * Server-only. Resolves the current session user and their role from the
 * profiles table in a single round-trip pair. Call from Server Components
 * and Route Handlers — never from middleware.
 *
 * Returns null if there is no authenticated session.
 */
export async function getUserWithRole(): Promise<UserWithRole | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (data?.role as Role) ?? null;
  return { user, role };
}
