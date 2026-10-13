// Admin session handling. A session is a signed token stored in an httpOnly
// cookie: base64url(JSON payload) + "." + base64url(HMAC-SHA256 signature).
// Uses Web Crypto only, so it works in route handlers and in proxy.js.

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

const encoder = new TextEncoder();

const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * The bcrypt hash contains "$", which .env files expand as variables, so the
 * README asks for it to be written as "\$". Accept both forms.
 */
export function getPasswordHash() {
  return (process.env.ADMIN_PASSWORD_HASH || "").replace(/\\\$/g, "$").trim();
}

/** Explains what is wrong with the admin configuration, or returns null when it's usable. */
export function getAuthIssue() {
  if (!process.env.ADMIN_EMAIL) return "ADMIN_EMAIL is not set.";
  if (!process.env.ADMIN_PASSWORD_HASH) return "ADMIN_PASSWORD_HASH is not set.";
  if (!BCRYPT_HASH.test(getPasswordHash())) {
    return 'ADMIN_PASSWORD_HASH is not a valid bcrypt hash. In .env files every "$" must be written as "\\$" — copy the line exactly as `npm run admin:setup` prints it.';
  }
  if ((process.env.ADMIN_SESSION_SECRET || "").length < 32) return "ADMIN_SESSION_SECRET must be at least 32 characters.";
  return null;
}

export function isAuthConfigured() {
  return getAuthIssue() === null;
}

/**
 * Short fingerprint of the password hash, stored in the session. Changing the
 * password changes it, which signs out every existing session.
 */
async function passwordFingerprint() {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(getPasswordHash()));
  return toBase64Url(new Uint8Array(digest)).slice(0, 16);
}

function toBase64Url(bytes) {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64 + "=".repeat((4 - (base64.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.ADMIN_SESSION_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(email) {
  const payload = { sub: email, pv: await passwordFingerprint(), exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/** Returns the session payload, or null when the token is missing, forged or expired. */
export async function verifySessionToken(token) {
  if (!token || !isAuthConfigured()) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const valid = await crypto.subtle.verify(
      "HMAC",
      await getKey(),
      fromBase64Url(signature),
      encoder.encode(body),
    );
    if (!valid) return null;

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    if (payload.sub !== process.env.ADMIN_EMAIL) return null;
    if (payload.pv !== (await passwordFingerprint())) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieOptions(maxAge = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  };
}
