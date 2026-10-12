import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Espace entreprise",
  description: "Recevez un code pour réinitialiser votre mot de passe.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
