import "server-only";
import { createHash } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

// Contact-form enquiries, stored in MongoDB and read in the admin inbox.

export const MESSAGE_STATUSES = ["new", "read", "replied", "archived"];

async function messages() {
  return (await getDb()).collection("messages");
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** One-way hash so the IP can be rate-limited without storing it. */
export function hashIp(ip) {
  return createHash("sha256")
    .update(`${ip}|${process.env.ADMIN_SESSION_SECRET || "contact"}`)
    .digest("hex")
    .slice(0, 32);
}

function serialize(doc) {
  if (!doc) return null;
  const { _id, ipHash, ...rest } = doc; // ipHash stays server-side
  return {
    ...rest,
    id: _id.toString(),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt?.toISOString() ?? null,
    repliedAt: doc.repliedAt?.toISOString() ?? null,
  };
}

export async function countRecentFromIp(ipHash, windowMs) {
  return (await messages()).countDocuments({ ipHash, createdAt: { $gt: new Date(Date.now() - windowMs) } });
}

export async function saveMessage({ name, email, phone, projectType, budget, timeline, message }, meta = {}) {
  const now = new Date();
  const doc = {
    name,
    email,
    phone: phone || "",
    projectType,
    budget: budget || "",
    timeline: timeline || "",
    message,
    status: "new",
    notes: "",
    ipHash: meta.ipHash ?? null,
    userAgent: (meta.userAgent || "").slice(0, 300),
    emailNotified: false,
    createdAt: now,
    updatedAt: now,
  };
  const { insertedId } = await (await messages()).insertOne(doc);
  return serialize({ ...doc, _id: insertedId });
}

export async function markNotified(id) {
  await (await messages()).updateOne({ _id: new ObjectId(id) }, { $set: { emailNotified: true } });
}

export async function listMessages({ status = "inbox", q = "", page = 1, perPage = 20 } = {}) {
  const filter = {};
  if (status === "inbox") filter.status = { $ne: "archived" };
  else if (MESSAGE_STATUSES.includes(status)) filter.status = status;
  if (q) {
    const re = new RegExp(escapeRegex(q.slice(0, 80)), "i");
    filter.$or = [{ name: re }, { email: re }, { phone: re }, { message: re }, { projectType: re }];
  }

  const col = await messages();
  const total = await col.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  const docs = await col
    .find(filter)
    .sort({ createdAt: -1 })
    .skip((current - 1) * perPage)
    .limit(perPage)
    .toArray();
  return { messages: docs.map(serialize), total, page: current, totalPages };
}

export async function getMessageCounts() {
  const rows = await (await messages()).aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray();
  const counts = { new: 0, read: 0, replied: 0, archived: 0 };
  for (const r of rows) if (r._id in counts) counts[r._id] = r.count;
  return { ...counts, inbox: counts.new + counts.read + counts.replied, all: counts.new + counts.read + counts.replied + counts.archived };
}

export async function getLatestMessages(limit = 5) {
  const docs = await (await messages()).find({ status: { $ne: "archived" } }).sort({ createdAt: -1 }).limit(limit).toArray();
  return docs.map(serialize);
}

export async function getMessage(id) {
  if (!ObjectId.isValid(id)) return null;
  return serialize(await (await messages()).findOne({ _id: new ObjectId(id) }));
}

export async function updateMessage(id, { status, notes }) {
  if (!ObjectId.isValid(id)) return null;
  const set = { updatedAt: new Date() };
  if (MESSAGE_STATUSES.includes(status)) {
    set.status = status;
    if (status === "replied") set.repliedAt = new Date();
  }
  if (typeof notes === "string") set.notes = notes.slice(0, 2000);
  const result = await (await messages()).findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: set },
    { returnDocument: "after" },
  );
  return serialize(result);
}

export async function deleteMessages(ids) {
  const objectIds = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  const { deletedCount } = await (await messages()).deleteMany({ _id: { $in: objectIds } });
  return deletedCount;
}
