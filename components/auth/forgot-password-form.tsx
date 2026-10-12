"use client";

import { Loader2, MailCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button, buttonClass } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Honeypot } from "@/components/ui/honeypot";
import { Notice } from "@/components/ui/notice";
import { TextInput } from "@/components/ui/text-input";
import { useCountdownRedirect } from "@/hooks/use-countdown-redirect";
import { useFormRequest } from "@/hooks/use-form-request";
import { postJson } from "@/lib/api/client";
import { authConfig } from "@/lib/auth/config";
import { forgotPasswordSchema } from "@/lib/validation/auth";

import { AuthHeading } from "./auth-heading";
import { BackLink } from "./back-link";
import { Confirmation } from "./confirmation";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");

  const form = useFormRequest({
    schema: forgotPasswordSchema,
    submit: (values) => postJson("/api/auth/forgot-password", values),
  });

  const nextStep = "/verify-code";
  const { remaining, auto } = useCountdownRedirect(nextStep, 3, form.succeeded);

  if (form.succeeded) {
    return (
      <Confirmation
        icon={MailCheck}
        title="Code envoyé"
        description={form.message ?? "Consultez votre boîte de réception."}
      >
        {auto ? (
          <p aria-live="polite" className="flex items-center gap-2.5 text-[13px] text-muted">
            <Loader2 aria-hidden className="size-4 animate-spin" />
            Redirection dans {remaining} seconde{remaining > 1 ? "s" : ""}
          </p>
        ) : null}
        <Link href={nextStep} className={buttonClass("primary")}>
          Saisir le code
        </Link>
        <Button variant="quiet" onClick={form.reset}>
          Changer d&apos;adresse
        </Button>
      </Confirmation>
    );
  }

  return (
    <>
      <AuthHeading
        title="Mot de passe oublié"
        description={`Nous envoyons un code à ${authConfig.codeLength} caractères à votre adresse professionnelle.`}
      />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.run({ email, company });
        }}
        className="relative space-y-5"
      >
        <Honeypot value={company} onChange={setCompany} />
        <Field id="email" label="E-mail professionnel" error={form.fieldErrors.email}>
          <TextInput
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="next"
            maxLength={254}
            autoFocus
            placeholder="prenom.nom@entreprise.fr"
            value={email}
            invalid={Boolean(form.fieldErrors.email)}
            aria-describedby={form.fieldErrors.email ? "email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              form.clearFieldError("email");
            }}
          />
        </Field>

        {form.globalError ? <Notice tone="error">{form.globalError}</Notice> : null}

        <Button type="submit" pending={form.pending}>
          {form.pending ? "Envoi" : "Envoyer le code"}
        </Button>
      </form>

      <div className="mt-8 border-t border-line pt-6">
        <BackLink href="/login">Retour à la connexion</BackLink>
      </div>
    </>
  );
}
