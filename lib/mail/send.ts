import { Resend } from "resend";

import { appUrl } from "@/lib/auth/config";
import { formatResetCode } from "@/lib/auth/code-format";

import { resetCodeEmail } from "./reset-code-email";

export async function sendResetCode(email: string, code: string) {
  const resetUrl = `${appUrl()}/verify-code`;
  const { subject, html, text } = resetCodeEmail(code, resetUrl);
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // Hors production, le code reste visible dans la console serveur.
    if (process.env.NODE_ENV === "production") {
      console.error("[reset] RESEND_API_KEY manquante, aucun code envoyé");
    } else {
      console.info(`[reset] ${email} -> ${formatResetCode(code)} (${resetUrl})`);
    }
    return { delivered: false as const };
  }

  const { error } = await new Resend(apiKey).emails.send({
    from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
    to: email,
    subject,
    html,
    text,
  });

  if (error) {
    console.error("[reset] envoi impossible", error);
    return { delivered: false as const };
  }

  return { delivered: true as const };
}
