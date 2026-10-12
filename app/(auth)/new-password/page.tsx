import type { Metadata } from "next";

import { NewPasswordForm } from "@/components/auth/new-password-form";

export const metadata: Metadata = {
  title: "Nouveau mot de passe | Espace entreprise",
  description: "Choisissez votre nouveau mot de passe.",
};

export default function NewPasswordPage() {
  return <NewPasswordForm />;
}
