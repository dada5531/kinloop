/**
 * Tip — saved from Coach conversations or the parenting knowledge corpus.
 */
export interface Tip {
  id: string;
  userId: string;
  childId: string | null;
  content: string;
  source: string; // Book title, article URL, or "Coach conversation"
  category: string;
  savedAt: string;
}

/**
 * Coach conversation and message types.
 */
export interface CoachConversation {
  id: string;
  userId: string;
  childId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CoachMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  sources: CoachSource[] | null;
  createdAt: string;
}

export interface CoachSource {
  title: string;
  author: string;
  excerpt: string;
  relevanceScore: number;
}

/**
 * Embedding record for RAG in the Coach quadrant.
 */
export interface Embedding {
  id: string;
  content: string;
  source: string;
  category: string;
  embedding: number[]; // vector(1024) from Voyage AI
  metadata: Record<string, unknown>;
  createdAt: string;
}
