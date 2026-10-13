// Admin session tokens. A session is a signed token stored in an httpOnly
// cookie: base64url(JSON payload) + "." + base64url(HMAC-SHA256 signature).
// Uses Web Crypto only, so it works in route handlers and in proxy.js.
//
// This file has no database access. It verifies the signature and expiry;
// lib/admin.js then checks the token against the current admin account
// (lib/admin-account.js), so changing the password or email signs out
// every other session.

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days, in seconds

const encoder = new TextEncoder();

export const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

/**
 * Bootstrap password hash from the environment. The bcrypt hash contains "$",
 * which .env files expand as variables, so it's written as "\$" there.
 * Accept both forms.
 */
export function getEnvPasswordHash() {
  return (process.env.ADMIN_PASSWORD_HASH || "").replace(/\\\$/g, "$").trim();
}

export function isSessionSecretConfigured() {
  return (process.env.ADMIN_SESSION_SECRET || "").length >= 32;
}

/** Problem with the bootstrap admin credentials in the environment, or null. */
export function getEnvCredentialsIssue() {
  if (!process.env.ADMIN_EMAIL) return "ADMIN_EMAIL is not set.";
  if (!process.env.ADMIN_PASSWORD_HASH) return "ADMIN_PASSWORD_HASH is not set.";
  if (!BCRYPT_HASH.test(getEnvPasswordHash())) {
    return 'ADMIN_PASSWORD_HASH is not a valid bcrypt hash. In .env files every "$" must be written as "\\$" — copy the line exactly as `npm run admin:setup` prints it.';
  }
  return null;
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

/**
 * Short fingerprint of a password hash, stored in the session. A new
 * password gives a new fingerprint, which invalidates older sessions.
 */
export async function passwordFingerprint(passwordHash) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(passwordHash));
  return toBase64Url(new Uint8Array(digest)).slice(0, 16);
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

export async function createSessionToken({ email, passwordHash }) {
  const payload = {
    sub: email.toLowerCase(),
    pv: await passwordFingerprint(passwordHash),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", await getKey(), encoder.encode(body));
  return `${body}.${toBase64Url(new Uint8Array(signature))}`;
}

/**
 * Checks the signature and expiry only. Returns the payload, or null when
 * the token is missing, forged or expired. Server code must also call
 * isSessionCurrent() (see lib/admin.js).
 */
export async function verifySessionToken(token) {
  if (!token || !isSessionSecretConfigured()) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  try {
    const valid = await crypto.subtle.verify("HMAC", await getKey(), fromBase64Url(signature), encoder.encode(body));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
    if (typeof payload.exp !== "number" || payload.exp < Date.now() / 1000) return null;
    if (typeof payload.sub !== "string" || typeof payload.pv !== "string") return null;
    return payload;
  } catch {
    return null;
  }
}

/** True when a verified payload still matches the current admin account. */
export async function isSessionCurrent(payload, account) {
  if (!payload || !account) return false;
  return payload.sub === account.email.toLowerCase() && payload.pv === (await passwordFingerprint(account.passwordHash));
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
