export type ApiResponse = {
  ok: boolean;
  status: number;
  message: string;
  fieldErrors?: Record<string, string>;
};

export async function postJson(url: string, body: unknown): Promise<ApiResponse> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = (await response.json().catch(() => ({}))) as Partial<ApiResponse>;
    return {
      ok: response.ok,
      status: response.status,
      message: payload.message ?? "Une erreur est survenue. Réessayez dans un instant.",
      fieldErrors: payload.fieldErrors,
    };
  } catch {
    return { ok: false, status: 0, message: "Serveur inaccessible. Vérifiez votre connexion." };
  }
}
