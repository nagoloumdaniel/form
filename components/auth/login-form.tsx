"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { PasswordInput } from "@/components/ui/password-input";
import { TextInput } from "@/components/ui/text-input";
import { useFormRequest } from "@/hooks/use-form-request";
import { postJson } from "@/lib/api/client";
import { loginSchema } from "@/lib/validation/auth";

import { AuthHeading } from "./auth-heading";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const form = useFormRequest({
    schema: loginSchema,
    submit: (values) => postJson("/api/auth/login", values),
  });

  useEffect(() => {
    if (form.succeeded) window.location.replace("/dashboard");
  }, [form.succeeded]);

  if (form.succeeded) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-10 flex min-h-dvh w-full items-center justify-center gap-2.5 bg-paper text-[13px] text-muted"
      >
        <Loader2 aria-hidden className="size-4 animate-spin" />
        Ouverture de votre tableau de bord…
      </div>
    );
  }

  return (
    <>
      <AuthHeading title="Connexion" description="Accédez à l'espace de votre entreprise." />

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.run({ email, password, remember });
        }}
        className="space-y-5"
      >
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

        <Field
          id="password"
          label="Mot de passe"
          error={form.fieldErrors.password}
          action={
            <Link
              href="/forgot-password"
              className="rounded text-[13px] text-muted underline-offset-4 outline-none transition hover:text-ink hover:underline focus-visible:ring-[3px] focus-visible:ring-accent/30"
            >
              Mot de passe oublié
            </Link>
          }
        >
          <PasswordInput
            id="password"
            name="password"
            autoComplete="current-password"
            maxLength={200}
            placeholder="••••••••••"
            value={password}
            invalid={Boolean(form.fieldErrors.password)}
            aria-describedby={form.fieldErrors.password ? "password-error" : undefined}
            onChange={(event) => {
              setPassword(event.target.value);
              form.clearFieldError("password");
            }}
          />
        </Field>

        <Checkbox
          id="remember"
          label="Rester connecté sur cet appareil"
          checked={remember}
          onCheckedChange={(checked) => setRemember(checked === true)}
        />

        {form.globalError ? <Notice tone="error">{form.globalError}</Notice> : null}

        <Button type="submit" pending={form.pending}>
          {form.pending ? "Vérification" : "Se connecter"}
        </Button>
      </form>

      <p className="mt-8 border-t border-line pt-6 text-[13px] leading-relaxed text-muted">
        Pas encore de compte ? Votre administrateur crée les accès depuis le tableau de bord.
      </p>
    </>
  );
}
