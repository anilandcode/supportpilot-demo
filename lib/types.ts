export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

export type Citation = {
  source: string;
  sentence: string;
};

export type SuggestedQuestion = {
  id: string;
  text: string;
};
