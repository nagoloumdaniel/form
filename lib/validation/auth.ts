import { z } from "zod";

import { normalizeResetCode } from "@/lib/auth/code-format";
import { authConfig } from "@/lib/auth/config";

const email = z
  .string()
  .trim()
  .max(254, { message: "Adresse trop longue." })
  .toLowerCase()
  .pipe(z.email({ message: "Cette adresse ne ressemble pas à une adresse e-mail." }));

const code = z
  .string()
  .transform(normalizeResetCode)
  .refine((value) => value.length === authConfig.codeLength, {
    message: `Le code contient ${authConfig.codeLength} caractères.`,
  });

const newPassword = z
  .string()
  .min(authConfig.minPasswordLength, {
    message: `Au moins ${authConfig.minPasswordLength} caractères.`,
  })
  .max(200, { message: "Mot de passe trop long." })
  .refine((value) => /\d/.test(value), { message: "Ajoutez au moins un chiffre." });

export const loginSchema = z.object({
  email,
  password: z.string().min(1, { message: "Entrez votre mot de passe." }),
  remember: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({ email, company: z.string().optional() });

export const verifyCodeSchema = z.object({ email, code });

export const newPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les deux mots de passe sont différents.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
