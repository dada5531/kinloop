/**
 * RAG search — similarity search over the parenting knowledge corpus.
 *
 * Uses pgvector's cosine similarity via the match_corpus RPC.
 * Results are injected into the Coach system prompt as context.
 */

import { getAdminClient } from "@/lib/supabase/admin";

import { generateEmbedding } from "./embed";

export interface SearchResult {
  id: string;
  content: string;
  source: string;
  source_url: string | null;
  category: string | null;
  similarity: number;
}

/**
 * Search the tips corpus for relevant parenting knowledge.
 */
export async function searchTipsCorpus(
  query: string,
  options?: {
    limit?: number;
    category?: string;
    ageBucket?: string;
    minSimilarity?: number;
  },
): Promise<SearchResult[]> {
  try {
    const embedding = await generateEmbedding(query);
    const supabase = getAdminClient();

    const { data, error } = await supabase.rpc("match_corpus", {
      query_embedding: JSON.stringify(embedding),
      match_threshold: options?.minSimilarity ?? 0.5,
      match_count: options?.limit ?? 5,
      filter_category: options?.category ?? null,
      filter_age_bucket: options?.ageBucket ?? null,
      corpus_table: "tips",
    });

    if (error) {
      console.error("[RAG Search] Tips corpus error:", error);
      return [];
    }

    return (data as SearchResult[]) || [];
  } catch (err) {
    console.error("[RAG Search] Failed:", err);
    return [];
  }
}

/**
 * Search the activities corpus for relevant activity ideas.
 */
export async function searchActivitiesCorpus(
  query: string,
  options?: {
    limit?: number;
    category?: string;
    minSimilarity?: number;
  },
): Promise<SearchResult[]> {
  try {
    const embedding = await generateEmbedding(query);
    const supabase = getAdminClient();

    const { data, error } = await supabase.rpc("match_corpus", {
      query_embedding: JSON.stringify(embedding),
      match_threshold: options?.minSimilarity ?? 0.5,
      match_count: options?.limit ?? 5,
      filter_category: options?.category ?? null,
      filter_age_bucket: null,
      corpus_table: "activities",
    });

    if (error) {
      console.error("[RAG Search] Activities corpus error:", error);
      return [];
    }

    return (data as SearchResult[]) || [];
  } catch (err) {
    console.error("[RAG Search] Failed:", err);
    return [];
  }
}

/**
 * Combined search across both corpora — used by the Coach chat for context injection.
 */
export async function searchAllCorpora(
  query: string,
  options?: {
    limit?: number;
    ageBucket?: string;
    minSimilarity?: number;
  },
): Promise<{ tips: SearchResult[]; activities: SearchResult[] }> {
  const [tips, activities] = await Promise.all([
    searchTipsCorpus(query, {
      limit: options?.limit ?? 3,
      ageBucket: options?.ageBucket,
      minSimilarity: options?.minSimilarity,
    }),
    searchActivitiesCorpus(query, {
      limit: options?.limit ?? 2,
      minSimilarity: options?.minSimilarity,
    }),
  ]);

  return { tips, activities };
}
