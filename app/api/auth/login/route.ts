import { badRequest, invalid, ok, tooMany, unexpected } from "@/lib/api/errors";
import { clientIp, readJsonBody } from "@/lib/api/request";
import { authConfig } from "@/lib/auth/config";
import { consumeRateLimit } from "@/lib/auth/throttle";
import { loginSchema } from "@/lib/validation/auth";

/** Aucune session n'est ouverte, l'endpoint valide la saisie et confirme la réception. */
export async function POST(request: Request) {
  try {
    const body = await readJsonBody(request);
    if (body === null) return badRequest();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return invalid(parsed.error);

    const byIp = await consumeRateLimit(`login:ip:${clientIp(request)}`, authConfig.limits.loginIp);
    if (!byIp.allowed) return tooMany(byIp.retryAfter);

    return ok("Identifiants reçus.");
  } catch (error) {
    return unexpected(error);
  }
}
