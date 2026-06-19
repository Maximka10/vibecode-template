import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/role";
import { transitionOrder, type OrderAction, type ActorRole } from "@/lib/orders/orderWorkflow";

const VALID_ACTIONS = new Set<OrderAction>([
  "CONFIRM_PAYMENT",
  "START_WORK",
  "REQUEST_CLIENT_INPUT",
  "RESUME_WORK",
  "COMPLETE_ORDER",
  "REOPEN_ORDER",
  "CANCEL_ORDER",
]);

export async function POST(req: NextRequest) {
  console.log("[POST /api/orders/transition] received request");

  // 1. Authenticate
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.warn("[POST /api/orders/transition] unauthenticated request");
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  console.log("[POST /api/orders/transition] actor userId:", user.id);

  // 2. Resolve role
  const role = await getUserRole(user.id);
  if (!role) {
    console.warn("[POST /api/orders/transition] no role found for userId:", user.id);
    return NextResponse.json({ ok: false, error: "User has no role" }, { status: 403 });
  }
  console.log("[POST /api/orders/transition] actor role:", role);

  // 3. Parse + validate body
  let body: { orderId?: unknown; action?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const { orderId, action } = body;

  if (typeof orderId !== "string" || !orderId) {
    return NextResponse.json({ ok: false, error: "orderId is required" }, { status: 400 });
  }
  if (typeof action !== "string" || !VALID_ACTIONS.has(action as OrderAction)) {
    return NextResponse.json(
      { ok: false, error: `action must be one of: ${[...VALID_ACTIONS].join(", ")}` },
      { status: 400 }
    );
  }

  // 4. Delegate entirely to workflow engine
  const result = await transitionOrder({
    orderId,
    action: action as OrderAction,
    actorId: user.id,
    actorRole: role as ActorRole,
  });

  if (!result.ok) {
    const httpStatus =
      result.code === "FORBIDDEN" ? 403
      : result.code === "NOT_FOUND" ? 404
      : result.code === "INVALID_TRANSITION" ? 422
      : 500;
    return NextResponse.json(result, { status: httpStatus });
  }

  return NextResponse.json(result);
}
