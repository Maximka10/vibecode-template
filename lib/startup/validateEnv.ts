/**
 * Logs warnings at cold-start for missing env vars required by Sales-1 features.
 * Import once in any server-side module to surface issues in Vercel logs on boot.
 */

const SALES1_VARS = [
  "TELEGRAM_CHAT_ID",
  "NEXT_PUBLIC_TELEGRAM_BOT_USERNAME",
  "NEXT_PUBLIC_SITE_URL",
] as const;

const missing = SALES1_VARS.filter((v) => !process.env[v]);

if (missing.length > 0) {
  console.warn(
    "[startup] Missing env vars for Sales-1 lead notifications:",
    missing.join(", ")
  );
} else {
  console.log("[startup] Sales-1 env vars OK");
}
