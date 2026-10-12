import type { Metadata } from "next";
import { Suspense } from "react";

import { VerifyCodeForm } from "@/components/auth/verify-code-form";
import { readEmail } from "@/lib/auth/ticket-cookie";
import { FormSkeleton } from "@/components/auth/form-skeleton";

export const metadata: Metadata = {
  title: "Code de vérification | Espace entreprise",
  description: "Saisissez le code reçu par e-mail.",
};

type SearchParams = PageProps<"/verify-code">["searchParams"];

export default function VerifyCodePage({ searchParams }: PageProps<"/verify-code">) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <PrefilledForm searchParams={searchParams} />
    </Suspense>
  );
}

async function PrefilledForm({ searchParams }: { searchParams: SearchParams }) {
  const { email } = await searchParams;
  const initialEmail = (await readEmail()) || (typeof email === "string" ? email : "");
  return <VerifyCodeForm key={initialEmail} initialEmail={initialEmail} />;
}
