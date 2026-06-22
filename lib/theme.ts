import type { CSSProperties } from "react";
import { theme } from "@/theme.config";

type ThemeStyle = CSSProperties & Record<`--${string}`, string>;

export function getThemeCssVariables(): ThemeStyle {
  const radius = `${theme.radius}px`;
  const mode = theme.mode as "light" | "dark" | "auto";

  return {
    colorScheme: mode === "dark" ? "dark" : mode === "light" ? "light" : "light dark",
    "--font-app": theme.font,
    "--color-background": theme.colors.bg,
    "--color-surface": theme.colors.surface,
    "--color-card": theme.colors.card,
    "--color-card-elevated": "color-mix(in srgb, var(--color-card) 94%, var(--color-foreground))",
    "--color-border": "color-mix(in srgb, var(--color-foreground) 12%, transparent)",
    "--color-border-strong": "color-mix(in srgb, var(--color-foreground) 20%, transparent)",
    "--color-foreground": theme.colors.fg,
    "--color-foreground-2": "color-mix(in srgb, var(--color-foreground) 68%, transparent)",
    "--color-foreground-3": "color-mix(in srgb, var(--color-foreground) 46%, transparent)",
    "--color-accent": theme.colors.accent,
    "--color-accent-hover": `color-mix(in srgb, ${theme.colors.accent} 86%, black)`,
    "--color-accent-soft": `color-mix(in srgb, ${theme.colors.accent} 12%, transparent)`,
    "--color-accent-fg": "#ffffff",
    "--color-bubble-user": theme.colors.bubbleUser,
    "--semantic-status-new": theme.semantic.statusNew,
    "--semantic-status-progress": theme.semantic.statusProgress,
    "--semantic-status-resolved": theme.semantic.statusResolved,
    "--semantic-priority-low": theme.semantic.priorityLow,
    "--semantic-priority-medium": theme.semantic.priorityMedium,
    "--semantic-risk-high": theme.semantic.riskHigh,
    "--semantic-risk-critical": theme.semantic.riskCritical,
    "--semantic-confidence-high": theme.semantic.confidenceHigh,
    "--semantic-confidence-mid": theme.semantic.confidenceMid,
    "--semantic-confidence-low": theme.semantic.confidenceLow,
    "--shadow-enterprise-sm": "0 1px 2px rgba(15, 23, 42, 0.06)",
    "--shadow-enterprise-md": "0 14px 40px rgba(15, 23, 42, 0.10)",
    "--radius-md": `${Math.max(theme.radius - 6, 6)}px`,
    "--radius-lg": radius,
    "--radius-xl": `${theme.radius + 4}px`,
    "--radius-full": "9999px",
    "--background": "var(--color-background)",
    "--surface": "var(--color-surface)",
    "--card": "var(--color-card)",
    "--card-elevated": "var(--color-card-elevated)",
    "--border": "var(--color-border)",
    "--border-strong": "var(--color-border-strong)",
    "--foreground": "var(--color-foreground)",
    "--foreground-2": "var(--color-foreground-2)",
    "--foreground-3": "var(--color-foreground-3)",
    "--accent": "var(--color-accent)",
    "--accent-hover": "var(--color-accent-hover)",
    "--accent-soft": "var(--color-accent-soft)",
    "--accent-fg": "var(--color-accent-fg)",
  };
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export { theme };
