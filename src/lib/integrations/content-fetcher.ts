/**
 * Multi-platform content fetcher for Play Lab.
 *
 * Supports: YouTube, TikTok, Instagram, Pinterest, generic web pages.
 * Strategy: fetch transcript/text content from each platform, falling back
 * to page metadata when full content isn't available.
 */

import * as cheerio from "cheerio";

import { extractVideoId } from "./youtube";

/** Non-critical log for content fetching fallbacks */
function logFetchFallback(source: string, url: string, error?: unknown): void {
  const msg = error instanceof Error ? error.message : String(error ?? "unknown");
  console.warn(`[ContentFetcher] ${source} fallback for ${url}: ${msg}`);
}

// ─── Types ──────────────────────────────────────────────────────

export interface FetchedContent {
  platform: "youtube" | "tiktok" | "instagram" | "pinterest" | "other";
  title: string;
  description: string;
  transcript: string | null;
  fullText: string; // Combined text for Claude extraction
  thumbnailUrl: string | null;
}

// ─── YouTube ────────────────────────────────────────────────────

async function fetchYouTubeContent(url: string): Promise<FetchedContent> {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("Invalid YouTube URL");

  let transcript: string | null = null;
  let title = "";
  let description = "";
  let thumbnailUrl: string | null = null;

  // Try to fetch transcript via youtube-transcript library
  try {
    const { YoutubeTranscript } = await import("youtube-transcript");
    const segments = await YoutubeTranscript.fetchTranscript(videoId);
    transcript = segments.map((s: { text: string }) => s.text).join(" ");
  } catch (err) {
    logFetchFallback("youtube.transcript", url, err);
  }

  // Fetch page metadata via oEmbed (no API key needed)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data = await res.json();
      title = data.title || "";
    }
  } catch (err) {
    logFetchFallback("youtube.oembed", url, err);
  }

  // Fetch page HTML for description
  try {
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Kinloop/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await pageRes.text();
    const descMatch = html.match(/"shortDescription":"(.*?)"/);
    if (descMatch) {
      description = descMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').slice(0, 2000);
    }
    if (!title) {
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      if (titleMatch) title = titleMatch[1].replace(" - YouTube", "").trim();
    }
  } catch (err) {
    logFetchFallback("youtube.page", url, err);
  }

  thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  const fullText = buildFullText(title, description, transcript);

  return {
    platform: "youtube",
    title,
    description,
    transcript,
    fullText,
    thumbnailUrl,
  };
}

// ─── TikTok ─────────────────────────────────────────────────────

async function fetchTikTokContent(url: string): Promise<FetchedContent> {
  let title = "";
  let description = "";

  // TikTok oEmbed API (public, no auth)
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data = await res.json();
      title = data.title || "";
      description = data.author_name ? `By ${data.author_name}` : "";
    }
  } catch (err) {
    logFetchFallback("tiktok.oembed", url, err);
  }

  // Scrape page for additional text
  try {
    const pageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await pageRes.text();
    const $ = cheerio.load(html);

    // TikTok embeds description in meta tags
    const metaDesc =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";
    if (metaDesc && metaDesc.length > description.length) {
      description = metaDesc.slice(0, 2000);
    }
    if (!title) {
      title =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text().replace(" | TikTok", "").trim();
    }
  } catch (err) {
    logFetchFallback("tiktok.page", url, err);
  }

  return {
    platform: "tiktok",
    title,
    description,
    transcript: null, // TikTok doesn't expose transcripts
    fullText: buildFullText(title, description, null),
    thumbnailUrl: null,
  };
}

// ─── Instagram ──────────────────────────────────────────────────

async function fetchInstagramContent(url: string): Promise<FetchedContent> {
  let title = "";
  let description = "";

  // Instagram oEmbed (public)
  try {
    const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(10000) });
    if (res.ok) {
      const data = await res.json();
      title = data.title || data.author_name || "";
      // Instagram oEmbed doesn't return caption, just author
    }
  } catch (err) {
    logFetchFallback("instagram.oembed", url, err);
  }

  // Scrape page for caption text
  try {
    const pageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await pageRes.text();
    const $ = cheerio.load(html);

    const metaDesc =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";
    if (metaDesc) {
      description = metaDesc.slice(0, 2000);
    }
    if (!title) {
      title =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text().replace(" • Instagram", "").trim();
    }
  } catch (err) {
    logFetchFallback("instagram.page", url, err);
  }

  return {
    platform: "instagram",
    title,
    description,
    transcript: null,
    fullText: buildFullText(title, description, null),
    thumbnailUrl: null,
  };
}

// ─── Pinterest ──────────────────────────────────────────────────

async function fetchPinterestContent(url: string): Promise<FetchedContent> {
  let title = "";
  let description = "";

  try {
    const pageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await pageRes.text();
    const $ = cheerio.load(html);

    title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text().replace(" | Pinterest", "").trim();
    description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    // Pinterest pins often have rich structured data
    const ldJson = $('script[type="application/ld+json"]').text();
    if (ldJson) {
      try {
        const ld = JSON.parse(ldJson);
        if (ld.description && ld.description.length > description.length) {
          description = ld.description;
        }
        if (ld.name && !title) title = ld.name;
      } catch (err) {
        logFetchFallback("pinterest.jsonld", url, err);
      }
    }
  } catch (err) {
    logFetchFallback("pinterest.page", url, err);
  }

  return {
    platform: "pinterest",
    title,
    description: description.slice(0, 2000),
    transcript: null,
    fullText: buildFullText(title, description, null),
    thumbnailUrl: null,
  };
}

// ─── Generic Web ────────────────────────────────────────────────

async function fetchGenericWebContent(url: string): Promise<FetchedContent> {
  let title = "";
  let description = "";
  let bodyText = "";

  try {
    const pageRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(15000),
    });
    const html = await pageRes.text();
    const $ = cheerio.load(html);

    title = $('meta[property="og:title"]').attr("content") || $("title").text().trim();
    description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    // Extract main content text
    $("script, style, nav, header, footer, aside, .sidebar, .ad, .advertisement").remove();
    const article = $("article").text().trim();
    const main = $("main").text().trim();
    bodyText = (article || main || $("body").text().trim()).replace(/\s+/g, " ").slice(0, 5000);
  } catch (err) {
    logFetchFallback("generic.page", url, err);
  }

  return {
    platform: "other",
    title,
    description: description.slice(0, 2000),
    transcript: null,
    fullText: buildFullText(title, description, bodyText || null),
    thumbnailUrl: null,
  };
}

// ─── Platform Detection ─────────────────────────────────────────

export function detectPlatform(
  url: string,
): "youtube" | "tiktok" | "instagram" | "pinterest" | "other" {
  if (!url) return "other";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("tiktok.com")) return "tiktok";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("pinterest.com") || url.includes("pin.it")) return "pinterest";
  return "other";
}

// ─── Main Entry Point ───────────────────────────────────────────

export async function fetchContentFromUrl(url: string): Promise<FetchedContent> {
  const platform = detectPlatform(url);

  switch (platform) {
    case "youtube":
      return fetchYouTubeContent(url);
    case "tiktok":
      return fetchTikTokContent(url);
    case "instagram":
      return fetchInstagramContent(url);
    case "pinterest":
      return fetchPinterestContent(url);
    default:
      return fetchGenericWebContent(url);
  }
}

// ─── Helpers ────────────────────────────────────────────────────

function buildFullText(
  title: string,
  description: string,
  transcriptOrBody: string | null,
): string {
  const parts: string[] = [];
  if (title) parts.push(`Title: ${title}`);
  if (description) parts.push(`Description: ${description}`);
  if (transcriptOrBody) parts.push(`Content:\n${transcriptOrBody}`);
  return parts.join("\n\n") || "No content could be extracted.";
}
