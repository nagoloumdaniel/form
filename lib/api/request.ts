import { authConfig } from "@/lib/auth/config";

/**
 * Sur Vercel, `x-vercel-forwarded-for` est posé par la plateforme et n'est pas
 * falsifiable par le client, contrairement à `x-forwarded-for`.
 */
export function clientIp(request: Request) {
  const trusted = request.headers.get("x-vercel-forwarded-for");
  if (trusted) return trusted.split(",")[0].trim();

  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || request.headers.get("x-real-ip") || "ip-absente";
}

/** Corps JSON borné en taille et en type, null si l'appel n'est pas conforme. */
export async function readJsonBody(request: Request) {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return null;
  const raw = await request.text().catch(() => "");
  if (!raw || raw.length > authConfig.maxBodyBytes) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}
