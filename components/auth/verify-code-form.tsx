"use client";

import { Check, Loader2, Pencil, RotateCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useState } from "react";

import { Button, buttonClass } from "@/components/ui/button";
import { CodeInput } from "@/components/ui/code-input";
import { Field } from "@/components/ui/field";
import { IconButton } from "@/components/ui/icon-button";
import { InputWithAction } from "@/components/ui/input-with-action";
import { Notice } from "@/components/ui/notice";
import { TextInput } from "@/components/ui/text-input";
import { useCountdownRedirect } from "@/hooks/use-countdown-redirect";
import { useFormRequest } from "@/hooks/use-form-request";
import { postJson } from "@/lib/api/client";
import { authConfig } from "@/lib/auth/config";
import { forgotPasswordSchema, verifyCodeSchema } from "@/lib/validation/auth";

import { AuthHeading } from "./auth-heading";
import { BackLink } from "./back-link";

const NEXT_STEP = "/new-password";

export function VerifyCodeForm({ initialEmail = "" }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [draft, setDraft] = useState(initialEmail);
  // Sans adresse connue, on démarre directement en saisie.
  const [editing, setEditing] = useState(initialEmail === "");
  const [code, setCode] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useFormRequest({
    schema: verifyCodeSchema,
    submit: (values) => postJson("/api/auth/verify-code", values),
  });

  const onResent = useCallback((values: { email: string }) => {
    setEmail(values.email);
    setDraft(values.email);
    setEditing(false);
    setCode("");
    setSentTo(values.email);
  }, []);

  const resend = useFormRequest({
    schema: forgotPasswordSchema,
    submit: (values) => postJson("/api/auth/forgot-password", values),
    onSuccess: onResent,
  });

  const { remaining, auto } = useCountdownRedirect(NEXT_STEP, 3, form.succeeded);

  const done = form.succeeded;
  const busy = resend.pending;
  const codeLocked = done || busy || editing;
  const codeState = done ? "success" : form.fieldErrors.code ? "error" : "idle";

  const startEditing = () => {
    resend.reset();
    setSentTo(null);
    setDraft(email);
    setEditing(true);
  };

  return (
    <>
      <AuthHeading
        title="Code de vérification"
        description="Saisissez le code reçu par e-mail pour continuer."
      />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.run({ email, code });
        }}
        className="space-y-5"
      >
        <Field
          id="email"
          label="E-mail professionnel"
          error={resend.fieldErrors.email ?? form.fieldErrors.email}
          hint={editing ? "Validez l'adresse pour recevoir un nouveau code." : undefined}
        >
          <InputWithAction
            action={
              done ? null : editing ? (
                <IconButton
                  icon={Check}
                  tone="accent"
                  label="Valider l'adresse et envoyer un nouveau code"
                  pending={busy}
                  onClick={() => void resend.run({ email: draft })}
                />
              ) : (
                <IconButton icon={Pencil} label="Modifier l'adresse" onClick={startEditing} />
              )
            }
          >
            <TextInput
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              enterKeyHint="done"
              maxLength={254}
              className="pr-11"
              disabled={!editing}
              placeholder="prenom.nom@entreprise.fr"
              value={editing ? draft : email}
              invalid={Boolean(resend.fieldErrors.email ?? form.fieldErrors.email)}
              onChange={(event) => {
                setDraft(event.target.value);
                resend.clearFieldError("email");
              }}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                void resend.run({ email: draft });
              }}
            />
          </InputWithAction>
        </Field>

        <Field
          id="code"
          label={`Code à ${authConfig.codeLength} caractères`}
          error={form.fieldErrors.code}
          hint={
            done ? (
              <span className="flex items-center gap-1.5 text-success">
                <Check aria-hidden className="size-3.5" strokeWidth={2.75} />
                Code validé
              </span>
            ) : (
              `Valable ${authConfig.codeTtlMinutes} minutes, une seule fois.`
            )
          }
        >
          <CodeInput
            id="code"
            value={code}
            state={codeState}
            readOnly={done}
            disabled={codeLocked && !done}
            describedBy={form.fieldErrors.code ? "code-error" : "code-hint"}
            onChange={(next) => {
              setCode(next);
              form.clearFieldError("code");
              setSentTo(null);
            }}
          />
        </Field>

        {busy ? (
          <p aria-live="polite" className="flex items-center gap-2.5 text-[13px] text-muted">
            <Loader2 aria-hidden className="size-4 animate-spin" />
            Envoi du nouveau code
          </p>
        ) : null}

        {sentTo && !done ? (
          <Notice tone="info">
            Nouveau code envoyé à <span className="text-ink">{sentTo}</span>.
          </Notice>
        ) : null}

        {resend.globalError ? <Notice tone="error">{resend.globalError}</Notice> : null}
        {form.globalError ? <Notice tone="error">{form.globalError}</Notice> : null}

        {done ? (
          <div className="space-y-3">
            {auto ? (
              <p aria-live="polite" className="flex items-center gap-2.5 text-[13px] text-muted">
                <Loader2 aria-hidden className="size-4 animate-spin" />
                Redirection dans {remaining} seconde{remaining > 1 ? "s" : ""}
              </p>
            ) : null}
            <Link href={NEXT_STEP} className={buttonClass("primary")}>
              Continuer maintenant
            </Link>
          </div>
        ) : (
          <Button type="submit" pending={form.pending} disabled={codeLocked}>
            {form.pending ? "Vérification" : "Vérifier le code"}
          </Button>
        )}
      </form>

      {done ? null : (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line pt-6">
          <BackLink href="/login">Retour à la connexion</BackLink>
          <button
            type="button"
            disabled={busy || editing}
            onClick={() => void resend.run({ email })}
            className="inline-flex items-center gap-1.5 rounded text-[13px] text-muted underline-offset-4 outline-none transition hover:text-ink hover:underline focus-visible:ring-[3px] focus-visible:ring-accent/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline"
          >
            {busy ? (
              <Loader2 aria-hidden className="size-3.5 animate-spin" />
            ) : (
              <RotateCw aria-hidden className="size-3.5" />
            )}
            Recevoir un nouveau code
          </button>
        </div>
      )}
    </>
  );
}
