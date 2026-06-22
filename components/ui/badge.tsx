import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "accent" | "success" | "error" | "warning" | "info" | "semantic";
  dotClassName?: string;
};

export function Badge({ className, variant = "default", dotClassName, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        variant === "default" &&
          "bg-accent-soft text-accent border border-[color-mix(in_srgb,var(--color-accent)_20%,transparent)]",
        variant === "accent" && "bg-accent text-accent-fg",
        variant === "success" &&
          "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/40",
        variant === "error" &&
          "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/40",
        variant === "warning" &&
          "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40",
        variant === "info" &&
          "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/40",
        variant === "semantic" && "border",
        className
      )}
      {...props}
    >
      {dotClassName && <span className={cn("h-1.5 w-1.5 rounded-full", dotClassName)} aria-hidden />}
      {children}
    </span>
  );
}
