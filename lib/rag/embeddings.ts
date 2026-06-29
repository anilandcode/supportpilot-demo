const EMBEDDING_DIMENSIONS = 768;

export type EmbeddingProvider = "deterministic" | "local" | "openai" | "google";

export type TextEmbeddingResult = {
  embedding: number[];
  provider: EmbeddingProvider;
  model: string;
  version: string;
  dimensions: number;
  embeddedAt: string;
};

export function createDeterministicEmbedding(text: string): number[] {
  const vector = Array.from({ length: EMBEDDING_DIMENSIONS }, () => 0);
  const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

  for (const token of tokens) {
    const index = Math.abs(hashToken(token)) % EMBEDDING_DIMENSIONS;
    vector[index] += 1;
  }

  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

export function getEmbeddingConfig() {
  const provider = normalizeProvider(process.env.EMBEDDING_PROVIDER);
  const dimensions = normalizeDimensions(process.env.EMBEDDING_DIMENSIONS);
  if (provider === "local") {
    return {
      provider,
      model: process.env.EMBEDDING_MODEL || process.env.LOCAL_EMBEDDING_MODEL || "local-embedding",
      version: process.env.EMBEDDING_VERSION || "local-v1",
      dimensions,
      ready: Boolean(process.env.LOCAL_EMBEDDING_ENDPOINT),
    };
  }
  if (provider === "openai") {
    return {
      provider,
      model: process.env.EMBEDDING_MODEL || process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
      version: process.env.EMBEDDING_VERSION || "openai-v1",
      dimensions,
      ready: Boolean(process.env.OPENAI_API_KEY),
    };
  }
  if (provider === "google") {
    return {
      provider,
      model: process.env.EMBEDDING_MODEL || process.env.GOOGLE_EMBEDDING_MODEL || "text-embedding-004",
      version: process.env.EMBEDDING_VERSION || "google-v1",
      dimensions,
      ready: Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY),
    };
  }
  return {
    provider: "deterministic" as const,
    model: "deterministic-hash",
    version: process.env.EMBEDDING_VERSION || "v1",
    dimensions: EMBEDDING_DIMENSIONS,
    ready: true,
  };
}

export async function createTextEmbedding(text: string): Promise<TextEmbeddingResult> {
  const config = getEmbeddingConfig();
  if (config.provider === "local" && config.ready) {
    const embedding = await embedWithLocalEndpoint(text, config).catch(() => null);
    if (embedding) return embedding;
  }
  if (config.provider === "openai" && config.ready) {
    const embedding = await embedWithOpenAI(text, config).catch(() => null);
    if (embedding) return embedding;
  }
  if (config.provider === "google" && config.ready) {
    const embedding = await embedWithGoogle(text, config).catch(() => null);
    if (embedding) return embedding;
  }
  return deterministicEmbeddingResult(text);
}

export function deterministicEmbeddingResult(text: string): TextEmbeddingResult {
  const config = getEmbeddingConfig();
  return {
    embedding: createDeterministicEmbedding(text),
    provider: "deterministic",
    model: "deterministic-hash",
    version: config.provider === "deterministic" ? config.version : "fallback-v1",
    dimensions: EMBEDDING_DIMENSIONS,
    embeddedAt: new Date().toISOString(),
  };
}

export function embeddingContentHash(content: string) {
  let hash = 0;
  for (let index = 0; index < content.length; index++) {
    hash = (hash << 5) - hash + content.charCodeAt(index);
    hash |= 0;
  }
  return `emb_${Math.abs(hash).toString(36)}`;
}

export function coerceEmbeddingDimensions(values: number[], dimensions = EMBEDDING_DIMENSIONS) {
  const vector = values.slice(0, dimensions);
  while (vector.length < dimensions) vector.push(0);
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

async function embedWithLocalEndpoint(text: string, config: ReturnType<typeof getEmbeddingConfig>): Promise<TextEmbeddingResult | null> {
  const endpoint = process.env.LOCAL_EMBEDDING_ENDPOINT;
  if (!endpoint) return null;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input: text, model: config.model, dimensions: config.dimensions }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const data = await response.json();
  const vector = Array.isArray(data.embedding) ? data.embedding : Array.isArray(data.data?.[0]?.embedding) ? data.data[0].embedding : null;
  if (!vector) return null;
  return embeddingResult(vector, config);
}

async function embedWithOpenAI(text: string, config: ReturnType<typeof getEmbeddingConfig>): Promise<TextEmbeddingResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      model: config.model,
      dimensions: config.dimensions,
    }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const data = await response.json();
  const vector = data?.data?.[0]?.embedding;
  if (!Array.isArray(vector)) return null;
  return embeddingResult(vector, config);
}

async function embedWithGoogle(text: string, config: ReturnType<typeof getEmbeddingConfig>): Promise<TextEmbeddingResult | null> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return null;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.model}:embedContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: { parts: [{ text }] } }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const data = await response.json();
  const vector = data?.embedding?.values;
  if (!Array.isArray(vector)) return null;
  return embeddingResult(vector, config);
}

function embeddingResult(vector: number[], config: ReturnType<typeof getEmbeddingConfig>): TextEmbeddingResult {
  return {
    embedding: coerceEmbeddingDimensions(vector.map(Number), config.dimensions),
    provider: config.provider,
    model: config.model,
    version: config.version,
    dimensions: config.dimensions,
    embeddedAt: new Date().toISOString(),
  };
}

function normalizeProvider(value: string | undefined): EmbeddingProvider {
  if (value === "local" || value === "openai" || value === "google") return value;
  return "deterministic";
}

function normalizeDimensions(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(Math.floor(parsed), EMBEDDING_DIMENSIONS) : EMBEDDING_DIMENSIONS;
}

function hashToken(token: string): number {
  let hash = 0;
  for (let index = 0; index < token.length; index++) {
    hash = (hash << 5) - hash + token.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}
