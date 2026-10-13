import "server-only";
import { Binary, ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

// Images are stored in MongoDB so the blog works on read-only hosts such as
// Vercel without a separate storage service. Keep uploads small: Vercel caps
// request bodies at 4.5 MB and MongoDB documents at 16 MB.

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

// SVG is deliberately excluded: it can carry scripts.
export const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

async function media() {
  return (await getDb()).collection("media");
}

function serialize(doc) {
  return {
    id: doc._id.toString(),
    url: `/api/media/${doc._id.toString()}`,
    filename: doc.filename,
    contentType: doc.contentType,
    size: doc.size,
    createdAt: doc.createdAt.toISOString(),
  };
}

/** Checks the file's magic bytes so a renamed file can't pass as an image. */
export function sniffImageType(bytes) {
  const b = bytes;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  const ascii = (from, to) => String.fromCharCode(...b.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && /avi[fs]/.test(ascii(8, 12))) return "image/avif";
  return null;
}

export async function saveMedia({ filename, contentType, bytes }) {
  const doc = {
    filename: filename.replace(/[^\w.\- ]+/g, "").slice(0, 120) || `image.${ALLOWED_TYPES[contentType]}`,
    contentType,
    size: bytes.length,
    data: new Binary(bytes),
    createdAt: new Date(),
  };
  const { insertedId } = await (await media()).insertOne(doc);
  return serialize({ ...doc, _id: insertedId });
}

export async function listMedia({ limit = 60, before } = {}) {
  const filter = before && ObjectId.isValid(before) ? { _id: { $lt: new ObjectId(before) } } : {};
  const docs = await (await media()).find(filter, { projection: { data: 0 } }).sort({ _id: -1 }).limit(limit).toArray();
  return docs.map(serialize);
}

export async function getMediaFile(id) {
  if (!ObjectId.isValid(id)) return null;
  return (await media()).findOne({ _id: new ObjectId(id) });
}

export async function deleteMedia(id) {
  if (!ObjectId.isValid(id)) return false;
  const { deletedCount } = await (await media()).deleteOne({ _id: new ObjectId(id) });
  return deletedCount > 0;
}
