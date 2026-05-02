const QUESTIONS = [
  "How much does Pro cost?",
  "Do you integrate with GitHub?",
  "What's your refund policy?",
  "Is my data secure?",
];

type SuggestedQuestionsProps = {
  onSelect: (q: string) => void;
};

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 px-4 pb-3">
      {QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="rounded-full border border-border bg-panel px-4 py-2 text-sm text-foreground-2 hover:bg-accent-soft hover:text-accent hover:border-accent/30 transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
