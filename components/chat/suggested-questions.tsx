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
          className="rounded-full border border-border bg-transparent px-3 py-1.5 text-[13px] text-foreground-2 hover:border-accent hover:text-accent transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
