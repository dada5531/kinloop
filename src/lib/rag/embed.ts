/**
 * Embedding helper for the Coach RAG pipeline.
 *
 * Uses Voyage AI (voyage-3) to generate 1024-dimensional embeddings.
 * Stored in Supabase pgvector for similarity search.
 *
 * TODO: Implement embedding generation.
 * See GitHub Issue #10.
 */

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!process.env.VOYAGE_API_KEY) {
    throw new Error("VOYAGE_API_KEY is not set. Get one at https://www.voyageai.com");
  }

  // TODO: Call Voyage AI API
  // const response = await fetch("https://api.voyageai.com/v1/embeddings", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     model: "voyage-3",
  //     input: [text],
  //   }),
  // });
  // return response.data[0].embedding;

  throw new Error("Not implemented — see GitHub Issue #10");
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // TODO: Batch embedding generation
  throw new Error("Not implemented — see GitHub Issue #10");
}
