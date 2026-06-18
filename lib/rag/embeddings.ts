const EMBEDDING_DIMENSIONS = 768;

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

function hashToken(token: string): number {
  let hash = 0;
  for (let index = 0; index < token.length; index++) {
    hash = (hash << 5) - hash + token.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}
