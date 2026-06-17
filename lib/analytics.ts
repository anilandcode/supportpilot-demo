import type { Citation } from "@/lib/types";

export type ConversationLog = {
  id: string;
  question: string;
  answered: boolean;
  escalated: boolean;
  rateLimited: boolean;
  citations: Citation[];
  createdAt: string;
};

export type FeedbackLog = {
  messageId: string;
  value: "up" | "down";
  createdAt: string;
};

type AnalyticsStore = {
  conversations: ConversationLog[];
  feedback: FeedbackLog[];
};

const globalForAnalytics = globalThis as typeof globalThis & {
  __supportpilotAnalytics?: AnalyticsStore;
};

const store =
  globalForAnalytics.__supportpilotAnalytics ??
  (globalForAnalytics.__supportpilotAnalytics = {
    conversations: [],
    feedback: [],
  });

export function logConversation(event: Omit<ConversationLog, "id" | "createdAt">) {
  store.conversations.unshift({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...event,
  });

  store.conversations = store.conversations.slice(0, 250);
}

export function logFeedback(event: Omit<FeedbackLog, "createdAt">) {
  const existingIndex = store.feedback.findIndex((item) => item.messageId === event.messageId);
  const next = { ...event, createdAt: new Date().toISOString() };

  if (existingIndex >= 0) {
    store.feedback[existingIndex] = next;
  } else {
    store.feedback.unshift(next);
  }

  store.feedback = store.feedback.slice(0, 250);
}

export function getStatsSnapshot() {
  const conversations = store.conversations;
  const total = conversations.length;
  const escalated = conversations.filter((item) => item.escalated).length;
  const answered = conversations.filter((item) => item.answered).length;
  const rateLimited = conversations.filter((item) => item.rateLimited).length;
  const positive = store.feedback.filter((item) => item.value === "up").length;

  const questionCounts = new Map<string, number>();
  for (const item of conversations) {
    const key = item.question.trim().toLowerCase();
    if (!key) continue;
    questionCounts.set(key, (questionCounts.get(key) ?? 0) + 1);
  }

  const topQuestions = Array.from(questionCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([question, count]) => ({ question, count }));

  return {
    totalConversations: total,
    answered,
    escalated,
    rateLimited,
    deflectionRate: total === 0 ? 0 : Math.round((answered / total) * 100),
    escalationRate: total === 0 ? 0 : Math.round((escalated / total) * 100),
    csat: store.feedback.length === 0 ? null : Math.round((positive / store.feedback.length) * 100),
    topQuestions,
    recent: conversations.slice(0, 8),
  };
}
