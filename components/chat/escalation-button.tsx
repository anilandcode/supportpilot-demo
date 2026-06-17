import { Button } from "@/components/ui/button";
import { theme } from "@/lib/theme";

type EscalationButtonProps = {
  /** Compact text-only variant for use inside the error banner */
  inline?: boolean;
};

export function EscalationButton({ inline }: EscalationButtonProps) {
  const open = () => window.open(theme.escalation.url, "_blank", "noopener,noreferrer");

  if (inline) {
    return (
      <button
        onClick={open}
        className="text-xs font-medium underline underline-offset-2 hover:no-underline text-red-700 dark:text-red-400"
        aria-label={theme.escalation.label}
      >
        {theme.escalation.label}
      </button>
    );
  }

  return (
    <div className="flex justify-center px-4 pb-3">
      <Button
        variant="outline"
        size="sm"
        onClick={open}
        aria-label={theme.escalation.label}
      >
        {theme.escalation.label}
      </Button>
    </div>
  );
}
