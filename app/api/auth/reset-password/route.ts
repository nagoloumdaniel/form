import { sql } from "drizzle-orm";

import { badRequest, fail, invalid, ok, tooMany, unexpected } from "@/lib/api/errors";
import { clientIp, readJsonBody } from "@/lib/api/request";
import { authConfig } from "@/lib/auth/config";
import { consumeRateLimit } from "@/lib/auth/throttle";
import { hashResetTicket } from "@/lib/auth/code";
import { hashPassword } from "@/lib/auth/password";
import { clearResetCookies, readTicket } from "@/lib/auth/ticket-cookie";
import { getDb } from "@/lib/db";
import { newPasswordSchema } from "@/lib/validation/auth";

function expired() {
  return clearResetCookies(
    fail(401, "Votre code n'est plus valable. Recommencez depuis la demande de code."),
  );
}

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    if (body === null) return badRequest();

    const parsed = newPasswordSchema.safeParse(body);
    if (!parsed.success) return invalid(parsed.error);

    const byIp = await consumeRateLimit(`reset:ip:${clientIp(request)}`, authConfig.limits.resetIp);
    if (!byIp.allowed) return tooMany(byIp.retryAfter);

    const ticket = await readTicket();
    if (!ticket) return expired();

    const db = getDb();
    const passwordHash = await hashPassword(parsed.data.password);

    // Ticket consommé et mot de passe écrit dans la même instruction, donc tout ou rien.
    const result = await db.execute(sql`
      with consumed as (
        update password_reset_codes
        set used_at = now()
        where ticket_hash = ${hashResetTicket(ticket)}
          and used_at is null
          and ticket_expires_at > now()
        returning user_id
      )
      update users
      set password_hash = ${passwordHash}
      where id in (select user_id from consumed)
      returning id
    `);

    if (result.rows.length === 0) return expired();

    return clearResetCookies(ok("Mot de passe mis à jour. Vous pouvez vous connecter."));
  } catch (error) {
    return unexpected(error);
  }
}
