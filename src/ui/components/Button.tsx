import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "success" | "error";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-primary text-on-primary shadow-button",
  secondary: "bg-secondary text-on-secondary shadow-button",
  success: "bg-success text-on-success shadow-button",
  error: "bg-error text-on-error shadow-button",
};

export function Button({ variant = "primary", className = "", ...rest }: ButtonProps) {
  return (
    <button
      data-variant={variant}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3",
        "font-display font-bold uppercase tracking-wide",
        "transition active:translate-y-1 active:shadow-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:translate-y-0",
        VARIANTS[variant],
        className,
      ].join(" ")}
      {...rest}
    />
  );
}
