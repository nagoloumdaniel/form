"use client";

import { KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { Button, buttonClass } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordRules } from "@/components/ui/password-rules";
import { useCountdownRedirect } from "@/hooks/use-countdown-redirect";
import { useFormRequest } from "@/hooks/use-form-request";
import { postJson } from "@/lib/api/client";
import { newPasswordSchema } from "@/lib/validation/auth";

import { AuthHeading } from "./auth-heading";
import { BackLink } from "./back-link";
import { Confirmation } from "./confirmation";

export function NewPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Un ticket périmé vide la saisie et ramène au début, aucun écran mort.
  const onFailure = useCallback(() => {
    setPassword("");
    setConfirmPassword("");
  }, []);

  const form = useFormRequest({
    schema: newPasswordSchema,
    submit: async (values) => {
      const result = await postJson("/api/auth/reset-password", values);
      if (result.status === 401) onFailure();
      return result;
    },
  });

  const expired = form.httpStatus === 401;
  const { remaining, auto } = useCountdownRedirect("/forgot-password", 4, expired);

  if (form.succeeded) {
    return (
      <Confirmation
        icon={KeyRound}
        title="Mot de passe mis à jour"
        description="Votre nouveau mot de passe est actif. Le code reçu ne fonctionne plus."
      >
        <Link href="/login" className={buttonClass("primary")}>
          Aller à la connexion
        </Link>
      </Confirmation>
    );
  }

  return (
    <>
      <AuthHeading
        title="Nouveau mot de passe"
        description="Dernière étape, choisissez votre mot de passe."
      />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.run({ password, confirmPassword });
        }}
        className="space-y-5"
      >
        <Field
          id="password"
          label="Mot de passe"
          error={form.fieldErrors.password}
          hint={<PasswordRules value={password} />}
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            maxLength={200}
            autoFocus
            value={password}
            invalid={Boolean(form.fieldErrors.password)}
            aria-describedby={form.fieldErrors.password ? "password-error" : "password-hint"}
            onChange={(event) => {
              setPassword(event.target.value);
              form.clearFieldError("password");
            }}
          />
        </Field>

        <Field id="confirmPassword" label="Confirmation" error={form.fieldErrors.confirmPassword}>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            maxLength={200}
            placeholder="Retapez le mot de passe"
            value={confirmPassword}
            invalid={Boolean(form.fieldErrors.confirmPassword)}
            aria-describedby={form.fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              form.clearFieldError("confirmPassword");
            }}
          />
        </Field>

        {form.globalError ? (
          <Notice tone="error">
            {form.globalError}{" "}
            {expired && auto ? (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 aria-hidden className="size-3.5 animate-spin" />
                Retour à la demande de code dans {remaining} seconde{remaining > 1 ? "s" : ""}
              </span>
            ) : (
              <Link href="/forgot-password" className="underline underline-offset-4">
                Demander un code
              </Link>
            )}
          </Notice>
        ) : null}

        <Button type="submit" pending={form.pending} disabled={expired}>
          {form.pending ? "Enregistrement" : "Enregistrer le mot de passe"}
        </Button>
      </form>

      <div className="mt-8 border-t border-line pt-6">
        <BackLink href="/verify-code">Revenir au code</BackLink>
      </div>
    </>
  );
}
