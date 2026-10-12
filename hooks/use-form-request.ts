"use client";

import { useCallback, useRef, useState } from "react";
import type { ZodType } from "zod";

import type { ApiResponse } from "@/lib/api/client";

type Status = "idle" | "pending" | "error" | "success";

type Options<TValues> = {
  schema: ZodType<TValues>;
  submit: (values: TValues) => Promise<ApiResponse>;
  onSuccess?: (values: TValues) => void;
};

/** Validation Zod côté client puis appel réseau, avec erreurs par champ. */
export function useFormRequest<TValues>({ schema, submit, onSuccess }: Options<TValues>) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const pending = useRef(false);
  const [httpStatus, setHttpStatus] = useState(0);

  const run = useCallback(
    async (raw: unknown) => {
      if (pending.current) return;
      const parsed = schema.safeParse(raw);

      if (!parsed.success) {
        const errors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path[0];
          if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
        }
        setFieldErrors(errors);
        setMessage(null);
        setStatus("error");
        return;
      }

      setFieldErrors({});
      setMessage(null);
      setStatus("pending");
      pending.current = true;

      const result = await submit(parsed.data);
      pending.current = false;
      setHttpStatus(result.status);
      setMessage(result.message);
      setFieldErrors(result.fieldErrors ?? {});
      setStatus(result.ok ? "success" : "error");
      if (result.ok) onSuccess?.(parsed.data);
    },
    [schema, submit, onSuccess],
  );

  const clearFieldError = useCallback((name: string) => {
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setMessage(null);
    setFieldErrors({});
    setHttpStatus(0);
  }, []);

  return {
    run,
    reset,
    status,
    httpStatus,
    message,
    fieldErrors,
    // Une erreur de champ s'affiche sous le champ, jamais en double dans le bandeau.
    globalError:
      status === "error" && Object.keys(fieldErrors).length === 0 ? (message ?? null) : null,
    clearFieldError,
    pending: status === "pending",
    succeeded: status === "success",
  };
}
