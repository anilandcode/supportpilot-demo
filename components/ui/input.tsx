import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-foreground-2",
        "focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
