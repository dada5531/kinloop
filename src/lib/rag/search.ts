/**
 * RAG search — similarity search over the parenting knowledge corpus.
 *
 * Uses pgvector's cosine similarity to find relevant chunks.
 * Results are injected into the Coach system prompt as context.
 *
 * TODO: Implement vector search.
 * See GitHub Issue #11.
 */

export interface SearchResult {
  id: string;
  content: string;
  source: string;
  category: string;
  similarity: number;
}

export async function searchCorpus(
  query: string,
  options?: {
    limit?: number;
    category?: string;
    minSimilarity?: number;
  },
): Promise<SearchResult[]> {
  // TODO: Generate embedding for query, then search pgvector
  // const embedding = await generateEmbedding(query);
  // const { data } = await supabase.rpc("match_embeddings", {
  //   query_embedding: embedding,
  //   match_threshold: options?.minSimilarity ?? 0.7,
  //   match_count: options?.limit ?? 5,
  // });
  throw new Error("Not implemented — see GitHub Issue #11");
}
