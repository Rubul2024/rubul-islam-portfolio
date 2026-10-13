import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { BCRYPT_HASH, getEnvPasswordHash } from "@/lib/auth";
import { site } from "@/lib/site";

export { PASSWORD_MIN_LENGTH, checkNewPassword } from "@/lib/password-rules";

// The admin account (name, email, password hash) lives in MongoDB so it can
// be changed from the admin panel's Profile page.
//
// Until the first save, the account comes from the environment variables
// ADMIN_EMAIL + ADMIN_PASSWORD_HASH (set with `npm run admin:setup`). The
// first profile or password change copies it into the database; from then
// on the database is the source of truth.

const COLLECTION = "admin_account";
const ID = "admin";

/** Account from the environment, or null if it isn't fully configured. */
function envAccount() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const passwordHash = getEnvPasswordHash();
  if (!email || !BCRYPT_HASH.test(passwordHash)) return null;
  return { email, name: site.name, passwordHash, passwordChangedAt: null, updatedAt: null, source: "env" };
}

/**
 * The current admin account, or null when none is configured anywhere.
 * Throws if the database is configured but unreachable — callers must not
 * silently fall back to the (possibly older) environment password then.
 */
export async function getAdminAccount() {
  if (isDbConfigured()) {
    const doc = await (await getDb()).collection(COLLECTION).findOne({ _id: ID });
    if (doc) {
      return {
        email: doc.email,
        name: doc.name || site.name,
        passwordHash: doc.passwordHash,
        passwordChangedAt: doc.passwordChangedAt ?? null,
        updatedAt: doc.updatedAt ?? null,
        source: "db",
      };
    }
  }
  return envAccount();
}

/**
 * Creates or updates the stored account. Pass only the fields to change;
 * the rest are kept (or copied from the environment on the first save).
 */
export async function saveAdminAccount(changes) {
  if (!isDbConfigured()) throw new Error("Profile changes need the database (MONGODB_URI).");
  const current = await getAdminAccount();
  if (!current) throw new Error("No admin account is configured.");

  const now = new Date();
  const next = {
    email: (changes.email ?? current.email).trim().toLowerCase(),
    name: (changes.name ?? current.name).trim(),
    passwordHash: changes.passwordHash ?? current.passwordHash,
    passwordChangedAt: changes.passwordHash ? now : current.passwordChangedAt,
    updatedAt: now,
  };
  await (await getDb()).collection(COLLECTION).updateOne({ _id: ID }, { $set: next }, { upsert: true });
  return { ...next, source: "db" };
}

/** Public, safe-to-send view of the account (no password hash). */
export function publicAccount(account) {
  return {
    name: account.name,
    email: account.email,
    passwordChangedAt: account.passwordChangedAt ? new Date(account.passwordChangedAt).toISOString() : null,
    updatedAt: account.updatedAt ? new Date(account.updatedAt).toISOString() : null,
    source: account.source,
  };
}
