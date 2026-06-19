import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  const insert = await admin
    .from("orders")
    .insert({
      user_id: "5315fac0-8e7f-4978-8c29-dba44fce44ae",
      template_id: "debug",
      template_name: "debug",
      total_price: 1,
      status: "new",
    })
    .select()
    .single();

  return Response.json({ error: insert.error, data: insert.data });
}
