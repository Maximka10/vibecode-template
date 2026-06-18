import { createAdminClient } from "./admin";
export async function getUserRole(userId: string): Promise<string | null> { const admin = createAdminClient(); const { data } = await admin.from("profiles").select("role").eq("id", userId).single(); return data?.role ?? null; }
