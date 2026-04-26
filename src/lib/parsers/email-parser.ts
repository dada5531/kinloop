/**
 * Email parser for .msg (Outlook) and .eml (universal) files.
 *
 * Uses @kenjiuno/msgreader for .msg and mailparser for .eml.
 * Extracts: subject, from, to, date, plain body, html body, and all attachments.
 */

import MsgReader from "@kenjiuno/msgreader";
import { simpleParser, type ParsedMail, type Attachment } from "mailparser";

export interface ParsedEmail {
  subject: string;
  from: string;
  to: string;
  date: string | null;
  bodyText: string;
  bodyHtml: string | null;
  attachments: ParsedAttachment[];
}

export interface ParsedAttachment {
  filename: string;
  contentType: string;
  content: Buffer;
  size: number;
}

/**
 * Parse an .eml file from a Buffer.
 */
export async function parseEml(buffer: Buffer): Promise<ParsedEmail> {
  const parsed: ParsedMail = await simpleParser(buffer);

  const attachments: ParsedAttachment[] = (parsed.attachments || []).map((att: Attachment) => ({
    filename: att.filename || "attachment",
    contentType: att.contentType || "application/octet-stream",
    content: Buffer.from(att.content),
    size: att.size || att.content.length,
  }));

  return {
    subject: parsed.subject || "(no subject)",
    from: parsed.from?.text || "",
    to: parsed.to
      ? Array.isArray(parsed.to)
        ? parsed.to.map((a) => a.text).join(", ")
        : parsed.to.text
      : "",
    date: parsed.date ? parsed.date.toISOString() : null,
    bodyText: parsed.text || "",
    bodyHtml: parsed.html || null,
    attachments,
  };
}

/**
 * Parse an .msg (Outlook) file from a Buffer.
 */
export async function parseMsg(buffer: Buffer): Promise<ParsedEmail> {
  const reader = new MsgReader(buffer.buffer as ArrayBuffer);
  const fileData = reader.getFileData();

  // Extract attachments
  const attachments: ParsedAttachment[] = [];
  if (fileData.attachments && fileData.attachments.length > 0) {
    for (let i = 0; i < fileData.attachments.length; i++) {
      const attData = reader.getAttachment(i);
      if (attData && attData.content) {
        const att = fileData.attachments[i];
        attachments.push({
          filename: att.fileName || att.name || `attachment-${i}`,
          contentType:
            (att as unknown as { mimeType?: string }).mimeType || "application/octet-stream",
          content: Buffer.from(attData.content),
          size: attData.content.length,
        });
      }
    }
  }

  return {
    subject: fileData.subject || "(no subject)",
    from: fileData.senderEmail || fileData.senderName || "",
    to:
      fileData.recipients
        ?.map((r: { name?: string; email?: string }) => r.email || r.name || "")
        .join(", ") || "",
    date: fileData.messageDeliveryTime || fileData.clientSubmitTime || null,
    bodyText: fileData.body || "",
    bodyHtml: fileData.bodyHtml || null,
    attachments,
  };
}

/**
 * Parse an email file (auto-detect format from filename).
 */
export async function parseEmailFile(buffer: Buffer, filename: string): Promise<ParsedEmail> {
  const ext = filename.toLowerCase().split(".").pop();

  if (ext === "msg") {
    return parseMsg(buffer);
  } else if (ext === "eml") {
    return parseEml(buffer);
  } else {
    throw new Error(`Unsupported email format: .${ext}. Supported: .msg, .eml`);
  }
}

/**
 * Format a parsed email into a structured text block for Claude extraction.
 * This replaces raw text with a structured envelope that gives Claude
 * better context about the communication.
 */
export function formatEmailForExtraction(email: ParsedEmail): string {
  const parts: string[] = [];

  parts.push(`--- EMAIL ---`);
  parts.push(`Subject: ${email.subject}`);
  parts.push(`From: ${email.from}`);
  parts.push(`To: ${email.to}`);
  if (email.date) {
    parts.push(`Date: ${email.date}`);
  }
  parts.push(`---`);
  parts.push(``);

  // Prefer plain text body, fall back to HTML stripped of tags
  if (email.bodyText) {
    parts.push(email.bodyText);
  } else if (email.bodyHtml) {
    // Simple HTML tag stripping for extraction
    parts.push(
      email.bodyHtml
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    );
  }

  if (email.attachments.length > 0) {
    parts.push(``);
    parts.push(`--- ATTACHMENTS (${email.attachments.length}) ---`);
    email.attachments.forEach((att, i) => {
      parts.push(
        `${i + 1}. ${att.filename} (${att.contentType}, ${Math.round(att.size / 1024)}KB)`,
      );
    });
  }

  return parts.join("\n");
}
