/**
 * YouTube integration.
 *
 * Purpose: Fetch video metadata and transcripts for Play Lab activity extraction.
 * Auth: API key (YOUTUBE_API_KEY) for metadata; transcript via youtube-transcript library.
 * Rate limits: 10,000 units/day (YouTube Data API v3)
 * Fallback: If transcript unavailable, use video title + description for extraction.
 *
 * TODO: Implement transcript fetching.
 * See GitHub Issue #8.
 */

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchVideoTranscript(videoId: string): Promise<string> {
  // TODO: Implement with youtube-transcript or YouTube Data API captions
  throw new Error("Not implemented — see GitHub Issue #8");
}

export async function fetchVideoMetadata(videoId: string): Promise<{
  title: string;
  description: string;
  channelTitle: string;
  duration: string;
}> {
  // TODO: Implement with YouTube Data API v3
  throw new Error("Not implemented — see GitHub Issue #8");
}
