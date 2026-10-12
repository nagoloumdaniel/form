import { Check } from "lucide-react";

import { authConfig } from "@/lib/auth/config";
import { cn } from "@/lib/utils";

const rules = [
  {
    label: `${authConfig.minPasswordLength} caractères`,
    test: (value: string) => value.length >= authConfig.minPasswordLength,
  },
  { label: "un chiffre", test: (value: string) => /\d/.test(value) },
];

export function PasswordRules({ value }: { value: string }) {
  return (
    <>
      <span className="sr-only">
        {authConfig.minPasswordLength} caractères minimum, dont un chiffre.
      </span>
      <ul aria-hidden className="flex flex-wrap gap-x-4 gap-y-1.5">
      {rules.map((rule) => {
        const done = rule.test(value);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5 text-[13px] transition-colors",
              done ? "text-success" : "text-muted",
            )}
          >
            <Check
              aria-hidden
              strokeWidth={done ? 2.75 : 2}
              className={cn("size-3.5 transition-opacity", done ? "opacity-100" : "opacity-40")}
            />
            {rule.label}
          </li>
        );
      })}
      </ul>
    </>
  );
}
