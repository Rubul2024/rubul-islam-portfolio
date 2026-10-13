import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";

// Failed admin sign-ins, per IP. Stored in MongoDB so the limit holds across
// serverless instances (in-memory counters reset whenever a new instance
// starts); a TTL index deletes old attempts. Falls back to memory if the
// database is unavailable.

export const WINDOW_MS = 15 * 60 * 1000;
export const MAX_FAILURES = 5;

const memory = new Map();

function memoryRecent(ip) {
  const now = Date.now();
  const list = (memory.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  memory.set(ip, list);
  if (memory.size > 5000) memory.clear();
  return list;
}

async function attempts() {
  return (await getDb()).collection("login_attempts");
}

export async function isLockedOut(ip) {
  if (isDbConfigured()) {
    try {
      const since = new Date(Date.now() - WINDOW_MS);
      return (await (await attempts()).countDocuments({ ip, at: { $gt: since } })) >= MAX_FAILURES;
    } catch (error) {
      console.error("[auth] throttle lookup failed", error?.message);
    }
  }
  return memoryRecent(ip).length >= MAX_FAILURES;
}

export async function recordFailure(ip) {
  memoryRecent(ip).push(Date.now());
  if (!isDbConfigured()) return;
  try {
    await (await attempts()).insertOne({ ip, at: new Date() });
  } catch (error) {
    console.error("[auth] throttle write failed", error?.message);
  }
}

export async function clearFailures(ip) {
  memory.delete(ip);
  if (!isDbConfigured()) return;
  try {
    await (await attempts()).deleteMany({ ip });
  } catch {
    /* best effort */
  }
}
