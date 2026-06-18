import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
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

  if (provider === "openai") {
    return process.env.OPENAI_API_KEY
      ? { ready: true }
      : { ready: false, reason: "OPENAI_API_KEY is not configured." };
  }

  return process.env.ANTHROPIC_API_KEY
    ? { ready: true }
    : { ready: false, reason: "ANTHROPIC_API_KEY is not configured." };
}

export function getLanguageModel(): LanguageModel {
  const provider = getProviderName();

  if (provider === "openai") return openai(process.env.OPENAI_MODEL || "gpt-4o-mini");
  if (provider === "anthropic") return anthropic(process.env.ANTHROPIC_MODEL || "claude-3-5-haiku-latest");
  return google(process.env.GOOGLE_MODEL || "gemini-2.5-flash");
}
