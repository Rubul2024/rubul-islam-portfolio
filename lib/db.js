import { MongoClient } from "mongodb";

// One MongoClient per server process. In development the module reloads on
// every edit, so the client is cached on globalThis to avoid piling up
// connections.

export function isDbConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

function getClientPromise() {
  if (!isDbConfigured()) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local (see .env.example).");
  }
  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      // A cold TLS connection to Atlas can take several seconds; leave headroom
      // so a slow first connect doesn't fail and render empty pages.
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
    });
    globalThis._mongoClientPromise = client.connect().catch((error) => {
      // Let the next request retry instead of caching a failed connection.
      globalThis._mongoClientPromise = undefined;
      throw error;
    });
  }
  return globalThis._mongoClientPromise;
}

let indexesReady;

/**
 * Returns the database. Indexes are ensured once per process in the
 * background: they persist in MongoDB, so requests never wait for them
 * (that used to add ~2s to every cold start).
 */
export async function getDb() {
  const client = await getClientPromise();
  const db = client.db(process.env.MONGODB_DB || "portfolio");

  if (!indexesReady) {
    indexesReady = Promise.all([
      db.collection("posts").createIndex({ slug: 1 }, { unique: true }),
      db.collection("posts").createIndex({ status: 1, publishedAt: -1 }),
      db.collection("posts").createIndex({ tags: 1 }),
      db.collection("media").createIndex({ createdAt: -1 }),
      db.collection("login_attempts").createIndex({ at: 1 }, { expireAfterSeconds: 15 * 60 }),
      db.collection("login_attempts").createIndex({ ip: 1, at: -1 }),
      db.collection("messages").createIndex({ status: 1, createdAt: -1 }),
      db.collection("messages").createIndex({ ipHash: 1, createdAt: -1 }),
    ]).catch((error) => {
      indexesReady = undefined;
      console.error("[db] Index creation failed", error?.message);
    });
  }
  return db;
}
