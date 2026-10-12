import { authConfig } from "./config";

export function normalizeResetCode(value: string) {
  return value.replace(/[^a-z0-9]/gi, "").toUpperCase();
}

/** Affichage lisible du code, par groupes de 3. */
export function formatResetCode(code: string) {
  const { codeGroupSize } = authConfig;
  return (
    normalizeResetCode(code)
      .match(new RegExp(`.{1,${codeGroupSize}}`, "g"))
      ?.join("-") ?? ""
  );
}
