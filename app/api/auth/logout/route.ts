import { ok } from "@/lib/api/errors";
import { clearSession } from "@/lib/auth/session";
import { clearResetCookies } from "@/lib/auth/ticket-cookie";

export async function POST() {
  return clearResetCookies(clearSession(ok("Déconnexion réussie.")));
}
