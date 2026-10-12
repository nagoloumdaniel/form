import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion | Espace entreprise",
  description: "Connectez-vous à l'espace de votre entreprise.",
};

export default function LoginPage() {
  return <LoginForm />;
}
