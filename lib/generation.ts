import { google } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type ProviderName = "google" | "openai" | "anthropic";

export function getProviderName(): ProviderName {
  const configured = process.env.LLM_PROVIDER?.toLowerCase();
  if (configured === "openai" || configured === "anthropic") return configured;
  return "google";
}

export function getModelReadiness(): { ready: boolean; reason?: string } {
  const provider = getProviderName();

  if (provider === "google") {
    const hasKey = Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY);
    return hasKey
      ? { ready: true }
      : { ready: false, reason: "GOOGLE_GENERATIVE_AI_API_KEY is not configured." };
  }

  return {
    ready: false,
    reason: `${provider} is selected, but this demo installs only the Google provider by default.`,
  };
}

export function getLanguageModel(): LanguageModel {
  const provider = getProviderName();

  if (provider !== "google") {
    throw new Error(`${provider} provider package is not installed in this demo.`);
  }

  return google(process.env.GOOGLE_MODEL || "gemini-2.5-flash");
}
