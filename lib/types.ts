export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
};

export type Citation = {
  source: string;
  sentence?: string;
  url?: string;
  score?: number;
};

export type SuggestedQuestion = {
  id: string;
  text: string;
};

export type ChatMetadata = {
  citations?: Citation[];
  tier?: "lite" | "enterprise";
  escalated?: boolean;
  rateLimited?: boolean;
};
