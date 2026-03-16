import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-sm",
  secondary:
    "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-700",
  ghost: "text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
