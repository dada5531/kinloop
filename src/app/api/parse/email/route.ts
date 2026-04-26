import { NextRequest, NextResponse } from "next/server";

import { parseEmailFile, formatEmailForExtraction } from "@/lib/parsers/email-parser";
import type { ParsedAttachment } from "@/lib/parsers/email-parser";

/**
 * POST /api/parse/email
 *
 * Accepts: multipart/form-data with a single `file` field (.msg or .eml)
 * Returns: { email: ParsedEmail, extractionText: string, attachments: AttachmentMeta[] }
 *
 * The client can then:
 *   1. Send extractionText to /api/extract/scheduler for the email body
 *   2. Send each attachment back to the appropriate extraction endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name;
    const ext = filename.toLowerCase().split(".").pop();

    if (ext !== "msg" && ext !== "eml") {
      return NextResponse.json(
        { error: `Unsupported format: .${ext}. Supported: .msg, .eml` },
        { status: 400 },
      );
    }

    // Read file into buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the email
    const parsed = await parseEmailFile(buffer, filename);

    // Format for extraction
    const extractionText = formatEmailForExtraction(parsed);

    // Return attachment metadata (not the binary content — that stays server-side)
    const attachmentMeta = parsed.attachments.map((att: ParsedAttachment, i: number) => ({
      index: i,
      filename: att.filename,
      contentType: att.contentType,
      size: att.size,
    }));

    return NextResponse.json({
      email: {
        subject: parsed.subject,
        from: parsed.from,
        to: parsed.to,
        date: parsed.date,
        bodyText: parsed.bodyText.substring(0, 5000), // Truncate for response
        hasHtml: !!parsed.bodyHtml,
      },
      extractionText,
      attachments: attachmentMeta,
    });
  } catch (error) {
    console.error("[Email Parse] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse email file" },
      { status: 500 },
    );
  }
}
