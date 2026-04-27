/**
 * Embedding helper for the Coach RAG pipeline.
 *
 * Uses Voyage AI (voyage-3-lite) to generate 1024-dimensional embeddings.
 * Stored in Supabase pgvector for similarity search.
 */

const VOYAGE_API_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3-lite";
const EMBEDDING_DIM = 1024;

function getApiKey(): string {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) {
    throw new Error("VOYAGE_API_KEY is not set. Get one at https://dash.voyageai.com/api-keys");
  }
  return key;
}

interface VoyageResponse {
  data: Array<{ embedding: number[] }>;
  usage: { total_tokens: number };
}

/**
 * Generate a single embedding vector for a text string.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const key = getApiKey();

  const response = await fetch(VOYAGE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: [text.slice(0, 8000)], // Voyage has a token limit; truncate long texts
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Voyage API error (${response.status}): ${err}`);
  }

  const result: VoyageResponse = await response.json();
  return result.data[0].embedding;
}

/**
 * Generate embeddings for multiple texts in a single batch call.
 * Voyage supports up to 128 texts per batch.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const key = getApiKey();

  // Voyage batch limit is 128 texts
  const BATCH_SIZE = 128;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE).map((t) => t.slice(0, 8000));

    const response = await fetch(VOYAGE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: VOYAGE_MODEL,
        input: batch,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Voyage API error (${response.status}): ${err}`);
    }

    const result: VoyageResponse = await response.json();
    allEmbeddings.push(...result.data.map((d) => d.embedding));
  }

  return allEmbeddings;
}

export { EMBEDDING_DIM, VOYAGE_MODEL };
