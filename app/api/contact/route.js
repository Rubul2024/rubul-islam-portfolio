import { NextResponse } from "next/server";
import { validateContact } from "@/lib/validation";
import { isDbConfigured } from "@/lib/db";
import { countRecentFromIp, hashIp, markNotified, saveMessage } from "@/lib/messages";
import { site } from "@/lib/site";

/**
 * POST /api/contact
 * 1. Validates the enquiry server-side and filters obvious spam.
 * 2. Saves it to MongoDB — it appears in the admin inbox at /admin/messages.
 * 3. If Resend is configured, also emails a notification (optional; a failed
 *    email never loses the enquiry once it's saved).
 * Responds honestly: it never claims success unless the message was stored or
 * delivered.
 */

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
// Bots post the whole form instantly; even autofill + a click takes a person longer.
// Kept low on purpose: a false positive would silently drop a real enquiry.
const MIN_FILL_MS = 1200;
const memoryHits = new Map();

function memoryRateLimited(key) {
  const now = Date.now();
  const recent = (memoryHits.get(key) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  memoryHits.set(key, recent);
  if (memoryHits.size > 5000) memoryHits.clear();
  return recent.length > MAX_REQUESTS;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
}

async function sendNotification(data, adminUrl) {
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>";
  const subject = `New enquiry: ${data.projectType} — ${data.name}`;
  const lines = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone && `Phone: ${data.phone}`,
    `Topic: ${data.projectType}`,
    data.budget ? `Budget: ${data.budget}` : null,
    data.timeline ? `Timeline: ${data.timeline}` : null,
    "",
    data.message,
    "",
    adminUrl && `Open in admin: ${adminUrl}`,
  ].filter((l) => l !== false && l !== undefined && l !== null);
  const html = `
    <div style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.6;color:#111">
      <p><strong>Name:</strong> ${escapeHtml(data.name)}<br/>
      <strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a><br/>
      ${data.phone ? `<strong>Phone:</strong> ${escapeHtml(data.phone)}<br/>` : ""}
      <strong>Topic:</strong> ${escapeHtml(data.projectType)}
      ${data.budget ? `<br/><strong>Budget:</strong> ${escapeHtml(data.budget)}` : ""}
      ${data.timeline ? `<br/><strong>Timeline:</strong> ${escapeHtml(data.timeline)}` : ""}</p>
      <p style="white-space:pre-wrap">${escapeHtml(data.message)}</p>
      ${adminUrl ? `<p><a href="${escapeHtml(adminUrl)}">Open in the admin inbox →</a></p>` : ""}
    </div>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [process.env.CONTACT_TO_EMAIL],
      reply_to: data.email,
      subject,
      text: lines.join("\n"),
      html,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
}

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ ok: false, message: "Unsupported request format." }, { status: 415 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body." }, { status: 400 });
  }

  // Spam traps → pretend success without storing anything (bots only).
  const honeypotFilled = typeof body?.company === "string" && body.company.trim() !== "";
  const tooFast = typeof body?.elapsed === "number" && body.elapsed < MIN_FILL_MS;
  if (honeypotFilled || tooFast) return NextResponse.json({ ok: true });

  const dbReady = isDbConfigured();
  const emailReady = isEmailConfigured();
  if (!dbReady && !emailReady) {
    return NextResponse.json(
      {
        ok: false,
        code: "not_configured",
        message: "Message delivery is not configured on this site yet. Your message was not sent.",
      },
      { status: 503 },
    );
  }

  const { data, errors, valid } = validateContact(body);
  if (!valid) {
    return NextResponse.json({ ok: false, message: "Please fix the highlighted fields.", errors }, { status: 422 });
  }

  const ip =
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
  const ipHash = hashIp(ip);
  const tooMany = () =>
    NextResponse.json(
      { ok: false, message: "Too many messages in a short time. Please try again later or email me directly." },
      { status: 429 },
    );

  // ── Store in the database (primary) ──
  if (dbReady) {
    let saved;
    try {
      if ((await countRecentFromIp(ipHash, WINDOW_MS)) >= MAX_REQUESTS) return tooMany();
      saved = await saveMessage(data, { ipHash, userAgent: request.headers.get("user-agent") });
    } catch (error) {
      console.error("[contact] Saving failed", error?.message);
      // Fall through to email delivery if that's available.
    }

    if (saved) {
      if (emailReady) {
        try {
          await sendNotification(data, `${site.url}/admin/messages?open=${saved.id}`);
          await markNotified(saved.id);
        } catch (error) {
          console.error("[contact] Notification email failed (message is saved)", error?.message);
        }
      }
      return NextResponse.json({ ok: true });
    }
  }

  // ── Email only (no database, or the database failed) ──
  if (emailReady) {
    if (memoryRateLimited(ipHash)) return tooMany();
    try {
      await sendNotification(data, null);
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error("[contact] Delivery failed", error?.message);
    }
  }

  return NextResponse.json(
    { ok: false, message: "Your message couldn't be sent right now. Please email me directly instead." },
    { status: 502 },
  );
}
