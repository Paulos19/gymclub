import { z } from "zod";

// =========================================================================
// Regras de Senha Forte
// Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial
// =========================================================================
export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter no mínimo 8 caracteres.")
  .regex(/[A-Z]/, "A senha deve conter ao menos uma letra maiúscula.")
  .regex(/[a-z]/, "A senha deve conter ao menos uma letra minúscula.")
  .regex(/[0-9]/, "A senha deve conter ao menos um número.")
  .regex(/[^A-Za-z0-9]/, "A senha deve conter ao menos um caractere especial (!@#$...).");

// =========================================================================
// Schema de Login
// =========================================================================
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "O e-mail é obrigatório.")
    .email("Insira um endereço de e-mail válido."),
  password: z
    .string()
    .min(1, "A senha é obrigatória."),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// =========================================================================
// Schema de Cadastro / Registro
// =========================================================================
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "O nome deve conter pelo menos 2 caracteres.")
      .max(60, "O nome não pode exceder 60 caracteres."),
    email: z
      .string()
      .min(1, "O e-mail é obrigatório.")
      .email("Insira um endereço de e-mail válido."),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, "A confirmação de senha é obrigatória."),
    targetGoal: z
      .enum(["HIPERTROFIA", "EMAGRECIMENTO", "FORCA", "CONDICIONAMENTO"])
      .default("HIPERTROFIA"),
    currentWeight: z.string().optional(),
    height: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// =========================================================================
// Helper de Força da Senha (0 a 4)
// =========================================================================
export interface PasswordStrength {
  score: number; // 0 a 4
  label: "Muito Fraca" | "Fraca" | "Média" | "Forte" | "Excelente";
  color: string;
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  const labels: PasswordStrength["label"][] = [
    "Muito Fraca",
    "Fraca",
    "Média",
    "Forte",
    "Excelente",
  ];

  const colors = [
    "#EF4444", // Vermelho
    "#F97316", // Laranja
    "#FAB03B", // Âmbar
    "#38BDF8", // Cyan
    "#D2FB4C", // Verde Neon
  ];

  return {
    score,
    label: labels[score],
    color: colors[score],
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
  };
}
