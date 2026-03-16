interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "live" | "scheduled" | "ended";
  className?: string;
}

const variantStyles = {
  default: "bg-zinc-800 text-zinc-300",
  live: "bg-red-500/20 text-red-400 animate-pulse",
  scheduled: "bg-blue-500/20 text-blue-400",
  ended: "bg-zinc-800 text-zinc-500",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${variantStyles[variant]} ${className}`}
    >
      {variant === "live" && (
        <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
      )}
      {children}
    </span>
  );
}
