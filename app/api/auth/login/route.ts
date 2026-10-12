import { eq } from "drizzle-orm";

import { badRequest, fail, invalid, ok, tooMany, unexpected } from "@/lib/api/errors";
import { clientIp, readJsonBody } from "@/lib/api/request";
import { authConfig } from "@/lib/auth/config";
import { consumeRateLimit } from "@/lib/auth/throttle";
import { attachSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { getDb, schema } from "@/lib/db";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    if (body === null) return badRequest();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return invalid(parsed.error);

    const byIp = await consumeRateLimit(`login:ip:${clientIp(request)}`, authConfig.limits.loginIp);
    if (!byIp.allowed) return tooMany(byIp.retryAfter);

    const { email, password, remember } = parsed.data;
    const db = getDb();
    const [user] = await db
      .select({ id: schema.users.id, passwordHash: schema.users.passwordHash })
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);

    const valid = user ? await verifyPassword(password, user.passwordHash) : false;
    if (!valid) {
      return fail(401, "E-mail ou mot de passe incorrect.", {
        password: "E-mail ou mot de passe incorrect.",
      });
    }

    return attachSession(ok("Connexion réussie."), user.id, remember ?? false);
  } catch (error) {
    return unexpected(error);
  }
}
