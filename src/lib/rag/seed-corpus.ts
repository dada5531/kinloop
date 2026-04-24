/**
 * Seed the parenting knowledge corpus into pgvector.
 *
 * Sources:
 *   - AAP (American Academy of Pediatrics) guidelines
 *   - "The Whole-Brain Child" by Daniel J. Siegel & Tina Payne Bryson
 *   - "How to Talk So Kids Will Listen" by Adele Faber & Elaine Mazlish
 *   - "No-Drama Discipline" by Daniel J. Siegel & Tina Payne Bryson
 *   - "Cribsheet" by Emily Oster
 *   - CDC developmental milestones
 *
 * Target: 100 starter chunks covering ages 0-8.
 *
 * Run with: npx tsx src/lib/rag/seed-corpus.ts
 *
 * TODO: Implement corpus seeding.
 * See GitHub Issue #10.
 */

const CORPUS_CHUNKS = [
  // TODO: Add 100 parenting knowledge chunks
  // Each chunk should be ~200-500 words, focused on a single topic.
  // Format: { content, source, category }
];

async function seedCorpus() {
  // TODO: For each chunk:
  // 1. Generate embedding with Voyage AI
  // 2. Insert into Supabase embeddings table
  throw new Error("Not implemented — see GitHub Issue #10");
}

// Allow running as a script
if (require.main === module) {
  seedCorpus().catch(console.error);
}
