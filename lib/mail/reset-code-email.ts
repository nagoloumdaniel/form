import { authConfig } from "@/lib/auth/config";
import { formatResetCode } from "@/lib/auth/code-format";

export function resetCodeEmail(code: string, resetUrl: string) {
  const display = formatResetCode(code);

  const text = [
    "Voici votre code de réinitialisation :",
    display,
    `Il est valable ${authConfig.codeTtlMinutes} minutes et ne fonctionne qu'une fois.`,
    `Saisie du code : ${resetUrl}`,
    "Si vous n'avez pas fait cette demande, ignorez ce message.",
  ].join("\n\n");

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:32px 16px;background:#fbfbfa;font-family:'Helvetica Neue',Arial,sans-serif;color:#16181c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">
      <tr>
        <td style="padding-bottom:24px;font-size:13px;color:#646a73;">Espace entreprise</td>
      </tr>
      <tr>
        <td style="font-size:20px;font-weight:600;padding-bottom:8px;">Votre code de réinitialisation</td>
      </tr>
      <tr>
        <td style="font-size:15px;line-height:1.6;color:#646a73;padding-bottom:24px;">
          Saisissez ce code pour choisir un nouveau mot de passe. Il expire dans ${authConfig.codeTtlMinutes} minutes.
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:24px;">
          <div style="border:1px solid #e4e4e1;border-radius:10px;background:#ffffff;padding:20px;text-align:center;font-size:30px;font-weight:600;letter-spacing:6px;">
            ${display}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:28px;">
          <a href="${resetUrl}" style="display:inline-block;background:#243b6b;color:#ffffff;text-decoration:none;font-size:15px;font-weight:500;padding:12px 20px;border-radius:8px;">
            Saisir le code
          </a>
        </td>
      </tr>
      <tr>
        <td style="border-top:1px solid #e4e4e1;padding-top:16px;font-size:13px;line-height:1.6;color:#646a73;">
          Vous n'avez pas fait cette demande ? Ignorez ce message, votre mot de passe reste inchangé.
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject: "Votre code de réinitialisation", html, text };
}
