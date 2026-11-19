import { SELLER, SELLER_SENDERS } from "../seller";
import { appTypeLabel, buildPitch, formatPrice } from "./sales";
import type { Job, Listing } from "./types";

export interface EmailDraft {
  to: string;
  from: string;
  subject: string;
  body: string;
}

export class EmailError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "EmailError";
  }
}

const ADDRESS = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Deterministic draft built from listing + build data, so nothing is invented. */
export function composeOfferEmail(
  listing: Listing,
  job: Job,
  offerUrl: string,
  to = "",
  from: string = SELLER.email
): EmailDraft {
  const price = formatPrice(listing);
  const lines = [
    "Hi,",
    "",
    `“${listing.title}” is a finished ${appTypeLabel(job)} you can own and rebrand — ${price}.`,
    "",
    listing.summary,
    "",
    "What you get:",
    ...buildPitch(listing, job).map((line) => `• ${line}`),
    "",
    `Live demo: ${offerUrl}`,
    "",
    "Reply to this email and I’ll walk you through the handover: source files, ZIP export and a 30-minute walkthrough.",
    "",
    SELLER.name,
    SELLER.location,
    `${SELLER.email} · WhatsApp ${SELLER.whatsapp}`,
    SELLER.linkedin,
  ];

  return {
    to: to.trim(),
    from,
    subject: `“${listing.title}” — ${price} · ready-to-own app`,
    body: lines.join("\n"),
  };
}

export function validateEmail(input: unknown): { ok: true; value: EmailDraft } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Invalid email draft." };
  const raw = input as Record<string, unknown>;
  const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

  const to = text(raw.to);
  const from = text(raw.from);
  const subject = text(raw.subject);
  const body = text(raw.body);

  if (!(SELLER_SENDERS as readonly string[]).includes(from)) {
    return { ok: false, error: `Send from ${SELLER_SENDERS.join(" or ")}.` };
  }
  if (!ADDRESS.test(to) || to.length > 160) return { ok: false, error: "Add a valid buyer email address." };
  if (!subject || subject.length > 160) return { ok: false, error: "Subject must be 1–160 characters." };
  if (body.length < 10 || body.length > 4000) return { ok: false, error: "Message must be 10–4000 characters." };

  return { ok: true, value: { to, from, subject, body } };
}

/**
 * Sends through Hostinger SMTP. Only called after the seller approves the draft
 * in the UI; without SMTP_PASS the studio refuses instead of pretending.
 */
export async function sendEmail(
  draft: EmailDraft,
  env: Record<string, string | undefined> = process.env
): Promise<{ from: string; to: string; subject: string }> {
  const pass = env.SMTP_PASS?.trim();
  if (!pass) {
    throw new EmailError(
      "Email is not configured. Add SMTP_PASS (the Hostinger mailbox password) and restart the studio.",
      503
    );
  }

  const host = env.SMTP_HOST?.trim() || "smtp.hostinger.com";
  const port = Number(env.SMTP_PORT) || 465;
  const user = env.SMTP_USER?.trim() || SELLER.email;

  const { default: nodemailer } = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  try {
    await transport.sendMail({
      from: `${SELLER.name} <${draft.from}>`,
      to: draft.to,
      replyTo: draft.from,
      subject: draft.subject,
      text: draft.body,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown SMTP error";
    throw new EmailError(`Hostinger rejected the message: ${detail}`, 502);
  } finally {
    transport.close();
  }

  return { from: draft.from, to: draft.to, subject: draft.subject };
}
