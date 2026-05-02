import { Button } from "@/components/ui/button";

const CALENDLY_URL = "https://calendly.com/anilpervaiz/15min";

type EscalationButtonProps = {
  /** Compact text-only variant for use inside the error banner */
  inline?: boolean;
};

export function EscalationButton({ inline }: EscalationButtonProps) {
  const open = () => window.open(CALENDLY_URL, "_blank", "noopener,noreferrer");

  if (inline) {
    return (
      <button
        onClick={open}
        className="text-xs font-medium underline underline-offset-2 hover:no-underline text-red-700 dark:text-red-400"
        aria-label="Book a call with a human support agent"
      >
        Book a call
      </button>
    );
  }

  return (
    <div className="flex justify-center px-4 pb-3">
      <Button
        variant="outline"
        size="sm"
        onClick={open}
        aria-label="Book a 15-minute call with a human support agent"
      >
        <span aria-hidden>💬</span>
        Talk to a human
      </Button>
    </div>
  );
}
