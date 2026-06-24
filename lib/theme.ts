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
    "--brand-primary": "#6D56FF",
    "--brand-primary-hover": "#5842E6",
    "--brand-primary-dark": "#30247A",
    "--brand-primary-soft": "#F4F2FF",
    "--brand-secondary": "#F86EBC",
    "--brand-secondary-soft": "#FFF1F8",
    "--brand-warm": "#FFB24A",
    "--brand-warm-deep": "#F97316",
    "--brand-dark": "#08090D",
    "--semantic-status-new": theme.semantic.statusNew,
    "--semantic-status-progress": theme.semantic.statusProgress,
    "--semantic-status-waiting": "#F59E0B",
    "--semantic-status-resolved": theme.semantic.statusResolved,
    "--semantic-priority-low": theme.semantic.priorityLow,
    "--semantic-priority-medium": theme.semantic.priorityMedium,
    "--semantic-priority-high": "#F97316",
    "--semantic-risk-high": theme.semantic.riskHigh,
    "--semantic-risk-critical": theme.semantic.riskCritical,
    "--semantic-confidence-high": theme.semantic.confidenceHigh,
    "--semantic-confidence-mid": theme.semantic.confidenceMid,
    "--semantic-confidence-low": theme.semantic.confidenceLow,
    "--badge-new-bg": "#EEF2FF",
    "--badge-new-border": "#C7D2FE",
    "--badge-new-text": "#3730A3",
    "--badge-progress-bg": "#EFF6FF",
    "--badge-progress-border": "#BFDBFE",
    "--badge-progress-text": "#1D4ED8",
    "--badge-waiting-bg": "#FFFBEB",
    "--badge-waiting-border": "#FDE68A",
    "--badge-waiting-text": "#92400E",
    "--badge-success-bg": "#ECFDF5",
    "--badge-success-border": "#A7F3D0",
    "--badge-success-text": "#047857",
    "--badge-danger-bg": "#FEF2F2",
    "--badge-danger-border": "#FECACA",
    "--badge-danger-text": "#B91C1C",
    "--badge-critical-border": "#FCA5A5",
    "--badge-neutral-bg": "#F8FAFC",
    "--badge-neutral-border": "#E2E8F0",
    "--badge-neutral-text": "#475569",
    "--hero-gradient": "radial-gradient(circle at 18% 12%, rgba(255,178,74,.45), transparent 28%), radial-gradient(circle at 72% 8%, rgba(248,110,188,.30), transparent 32%), radial-gradient(circle at 50% 48%, rgba(109,86,255,.38), transparent 42%), linear-gradient(135deg, #FFF7ED 0%, #F4F2FF 42%, #EEF2FF 100%)",
    "--dark-gradient": "radial-gradient(circle at 18% 10%, rgba(109,86,255,.35), transparent 30%), radial-gradient(circle at 82% 12%, rgba(255,178,74,.22), transparent 26%), linear-gradient(180deg, #0B0D12 0%, #08090D 100%)",
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
