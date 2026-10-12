"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";

import { cn } from "@/lib/utils";

import { fieldStateClass, inputClass } from "./field";

type PasswordInputProps = ComponentProps<"input"> & { invalid?: boolean };

export function PasswordInput({ className, invalid, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        aria-invalid={invalid || undefined}
        className={cn(inputClass, fieldStateClass(invalid), "pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-muted outline-none transition hover:text-ink focus-visible:ring-[3px] focus-visible:ring-accent/30"
      >
        <Icon aria-hidden className="size-4" />
      </button>
    </div>
  );
}
