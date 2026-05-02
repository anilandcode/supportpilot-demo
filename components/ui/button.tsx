import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
  asChild?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-full transition-colors disabled:opacity-50 disabled:pointer-events-none",
        size === "md" && "h-10 px-5 text-sm",
        size === "sm" && "h-8 px-4 text-xs",
        variant === "primary" &&
          "bg-accent text-accent-fg hover:bg-[color-mix(in_srgb,var(--color-accent)_85%,black)]",
        variant === "outline" &&
          "border border-border text-foreground bg-transparent hover:bg-[color-mix(in_srgb,var(--color-foreground)_6%,transparent)]",
        variant === "ghost" &&
          "text-foreground bg-transparent hover:bg-[color-mix(in_srgb,var(--color-foreground)_6%,transparent)]",
        className
      )}
      {...props}
    />
  );
}
