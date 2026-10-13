import "server-only";
import { ObjectId } from "mongodb";
import { getDb, isDbConfigured } from "@/lib/db";
import { autoExcerpt, readingTime } from "@/lib/blog/utils";

// All MongoDB access for the blog lives here. Public readers never throw:
// if the database is missing or unreachable they log and return empty
// results, so the rest of the site keeps working.

const LIST_FIELDS = { content: 0 };

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Plain, serialisable object safe to pass to Client Components. */
export function serializePost(doc) {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    ...rest,
    id: _id.toString(),
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
    createdAt: doc.createdAt?.toISOString() ?? null,
    updatedAt: doc.updatedAt?.toISOString() ?? null,
    views: doc.views ?? 0,
  };
}

function publishedFilter(extra = {}) {
  return { status: "published", publishedAt: { $lte: new Date() }, ...extra };
}

async function posts() {
  return (await getDb()).collection("posts");
}

async function safely(label, fallback, fn) {
  if (!isDbConfigured()) return fallback;
  try {
    return await fn();
  } catch (error) {
    console.error(`[blog] ${label} failed`, error?.message);
    return fallback;
  }
}

// ── Public ──────────────────────────────────────────────────

export async function getPublishedPosts({ tag = "", category = "", q = "", page = 1, perPage = 9 } = {}) {
  const empty = { posts: [], total: 0, page: 1, totalPages: 1 };
  return safely("getPublishedPosts", empty, async () => {
    const filter = publishedFilter();
    if (tag) filter.tags = tag;
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
    if (q) {
      const re = new RegExp(escapeRegex(q.slice(0, 80)), "i");
      filter.$or = [{ title: re }, { excerpt: re }, { tags: re }, { category: re }];
    }
    const col = await posts();
    const total = await col.countDocuments(filter);
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const current = Math.min(Math.max(1, page), totalPages);
    const docs = await col
      .find(filter, { projection: LIST_FIELDS })
      .sort({ publishedAt: -1 })
      .skip((current - 1) * perPage)
      .limit(perPage)
      .toArray();
    return { posts: docs.map(serializePost), total, page: current, totalPages };
  });
}

export async function getFeaturedPost() {
  return safely("getFeaturedPost", null, async () => {
    const col = await posts();
    const doc =
      (await col.findOne(publishedFilter({ featured: true }), { projection: LIST_FIELDS, sort: { publishedAt: -1 } })) ??
      (await col.findOne(publishedFilter(), { projection: LIST_FIELDS, sort: { publishedAt: -1 } }));
    return serializePost(doc);
  });
}

export async function getPublishedPostBySlug(slug) {
  return safely("getPublishedPostBySlug", null, async () =>
    serializePost(await (await posts()).findOne(publishedFilter({ slug }))),
  );
}

export async function getPublishedSlugs() {
  return safely("getPublishedSlugs", [], async () => {
    const docs = await (await posts())
      .find(publishedFilter(), { projection: { slug: 1, updatedAt: 1, publishedAt: 1 } })
      .toArray();
    return docs.map((d) => ({ slug: d.slug, updatedAt: d.updatedAt ?? d.publishedAt }));
  });
}

/** Post types (the "Category" field in the editor) with published counts. */
export async function getCategoryCounts() {
  return safely("getCategoryCounts", [], async () =>
    (await posts())
      .aggregate([
        { $match: publishedFilter({ category: { $nin: ["", null] } }) },
        { $group: { _id: { $toLower: "$category" }, name: { $first: "$category" }, count: { $sum: 1 } } },
        { $sort: { count: -1, name: 1 } },
      ])
      .toArray()
      .then((rows) => rows.map((r) => ({ category: r.name, count: r.count }))),
  );
}

export async function getTagCounts() {
  return safely("getTagCounts", [], async () =>
    (await posts())
      .aggregate([
        { $match: publishedFilter() },
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: 30 },
      ])
      .toArray()
      .then((rows) => rows.map((r) => ({ tag: r._id, count: r.count }))),
  );
}

export async function getRelatedPosts(post, limit = 3) {
  return safely("getRelatedPosts", [], async () => {
    const col = await posts();
    const id = new ObjectId(post.id);
    let docs = [];
    if (post.tags?.length) {
      docs = await col
        .aggregate([
          { $match: publishedFilter({ _id: { $ne: id }, tags: { $in: post.tags } }) },
          { $addFields: { shared: { $size: { $setIntersection: ["$tags", post.tags] } } } },
          { $sort: { shared: -1, publishedAt: -1 } },
          { $limit: limit },
          { $project: { content: 0, shared: 0 } },
        ])
        .toArray();
    }
    if (docs.length < limit) {
      const more = await col
        .find(publishedFilter({ _id: { $nin: [id, ...docs.map((d) => d._id)] } }), { projection: LIST_FIELDS })
        .sort({ publishedAt: -1 })
        .limit(limit - docs.length)
        .toArray();
      docs = docs.concat(more);
    }
    return docs.map(serializePost);
  });
}

export async function getAdjacentPosts(post) {
  return safely("getAdjacentPosts", { previous: null, next: null }, async () => {
    const col = await posts();
    const date = new Date(post.publishedAt);
    const options = { projection: { title: 1, slug: 1, publishedAt: 1 } };
    const [previous, next] = await Promise.all([
      col.findOne(publishedFilter({ publishedAt: { $lt: date } }), { ...options, sort: { publishedAt: -1 } }),
      col.findOne({ status: "published", publishedAt: { $gt: date, $lte: new Date() } }, { ...options, sort: { publishedAt: 1 } }),
    ]);
    return { previous: serializePost(previous), next: serializePost(next) };
  });
}

export async function incrementViews(slug) {
  const result = await (await posts()).updateOne(publishedFilter({ slug }), { $inc: { views: 1 } });
  return result.matchedCount > 0;
}

// ── Admin ───────────────────────────────────────────────────

const SORTS = {
  updated: { updatedAt: -1 },
  newest: { createdAt: -1 },
  published: { publishedAt: -1 },
  views: { views: -1 },
  title: { title: 1 },
};

export async function listPostsAdmin({ q = "", status = "all", sort = "updated", page = 1, perPage = 10 } = {}) {
  const col = await posts();
  const now = new Date();
  const filter = {};
  if (status === "draft") filter.status = "draft";
  if (status === "published") Object.assign(filter, { status: "published", publishedAt: { $lte: now } });
  if (status === "scheduled") Object.assign(filter, { status: "published", publishedAt: { $gt: now } });
  if (status === "featured") filter.featured = true;
  if (q) {
    const re = new RegExp(escapeRegex(q.slice(0, 80)), "i");
    filter.$or = [{ title: re }, { slug: re }, { tags: re }, { category: re }];
  }

  const total = await col.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  const docs = await col
    .find(filter, { projection: LIST_FIELDS })
    .sort({ ...(SORTS[sort] ?? SORTS.updated), _id: -1 })
    .skip((current - 1) * perPage)
    .limit(perPage)
    .toArray();

  return { posts: docs.map(serializePost), total, page: current, totalPages };
}

export async function getPostById(id) {
  if (!ObjectId.isValid(id)) return null;
  return serializePost(await (await posts()).findOne({ _id: new ObjectId(id) }));
}

export async function isSlugTaken(slug, excludeId) {
  const filter = { slug };
  if (excludeId && ObjectId.isValid(excludeId)) filter._id = { $ne: new ObjectId(excludeId) };
  return (await (await posts()).countDocuments(filter, { limit: 1 })) > 0;
}

/** Finds a free slug by appending -2, -3… */
export async function uniqueSlug(base, excludeId) {
  let candidate = base;
  for (let i = 2; await isSlugTaken(candidate, excludeId); i++) candidate = `${base}-${i}`;
  return candidate;
}

function derivedFields(data, existing) {
  const publishedAt =
    data.status === "published" ? (data.publishedAt ?? existing?.publishedAt ?? new Date()) : data.publishedAt;
  return {
    ...data,
    publishedAt: publishedAt ?? null,
    excerpt: data.excerpt || autoExcerpt(data.content),
    readingTime: readingTime(data.content),
    updatedAt: new Date(),
  };
}

export async function createPost(data) {
  const now = new Date();
  const doc = { ...derivedFields(data), views: 0, createdAt: now };
  const { insertedId } = await (await posts()).insertOne(doc);
  return getPostById(insertedId.toString());
}

export async function updatePost(id, data) {
  const col = await posts();
  const _id = new ObjectId(id);
  const existing = await col.findOne({ _id }, { projection: { publishedAt: 1 } });
  if (!existing) return null;
  await col.updateOne({ _id }, { $set: derivedFields(data, existing) });
  return getPostById(id);
}

/** Partial update for quick actions in the posts table (publish, feature…). */
export async function patchPost(id, fields) {
  const col = await posts();
  const set = { updatedAt: new Date() };
  if (typeof fields.featured === "boolean") set.featured = fields.featured;
  if (fields.status === "draft") set.status = "draft";
  if (fields.status === "published") {
    set.status = "published";
    const existing = await col.findOne({ _id: new ObjectId(id) }, { projection: { publishedAt: 1 } });
    if (!existing) return null;
    if (!existing.publishedAt) set.publishedAt = new Date();
  }
  const result = await col.updateOne({ _id: new ObjectId(id) }, { $set: set });
  return result.matchedCount ? getPostById(id) : null;
}

export async function deletePosts(ids) {
  const objectIds = ids.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
  const { deletedCount } = await (await posts()).deleteMany({ _id: { $in: objectIds } });
  return deletedCount;
}

export async function duplicatePost(id) {
  const source = await (await posts()).findOne({ _id: new ObjectId(id) });
  if (!source) return null;
  const { _id, views, createdAt, ...rest } = source;
  return createPost({
    ...rest,
    title: `${source.title} (copy)`,
    slug: await uniqueSlug(`${source.slug}-copy`),
    status: "draft",
    publishedAt: null,
    featured: false,
  });
}

export async function getDashboardStats() {
  const col = await posts();
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [counts, recent, top, monthly, tags] = await Promise.all([
    col
      .aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            drafts: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
            published: {
              $sum: { $cond: [{ $and: [{ $eq: ["$status", "published"] }, { $lte: ["$publishedAt", now] }] }, 1, 0] },
            },
            scheduled: {
              $sum: { $cond: [{ $and: [{ $eq: ["$status", "published"] }, { $gt: ["$publishedAt", now] }] }, 1, 0] },
            },
            views: { $sum: { $ifNull: ["$views", 0] } },
          },
        },
      ])
      .toArray(),
    col.find({}, { projection: LIST_FIELDS }).sort({ updatedAt: -1 }).limit(5).toArray(),
    col.find(publishedFilter(), { projection: LIST_FIELDS }).sort({ views: -1 }).limit(5).toArray(),
    col
      .aggregate([
        { $match: { status: "published", publishedAt: { $gte: sixMonthsAgo, $lte: now } } },
        { $group: { _id: { y: { $year: "$publishedAt" }, m: { $month: "$publishedAt" } }, count: { $sum: 1 } } },
      ])
      .toArray(),
    col
      .aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ])
      .toArray(),
  ]);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const hit = monthly.find((m) => m._id.y === d.getFullYear() && m._id.m === d.getMonth() + 1);
    return {
      label: d.toLocaleString("en-IN", { month: "short" }),
      year: d.getFullYear(),
      count: hit?.count ?? 0,
    };
  });

  const c = counts[0] ?? { total: 0, drafts: 0, published: 0, scheduled: 0, views: 0 };
  return {
    counts: { total: c.total, drafts: c.drafts, published: c.published, scheduled: c.scheduled, views: c.views },
    recent: recent.map(serializePost),
    top: top.map(serializePost),
    months,
    tags: tags.map((t) => ({ tag: t._id, count: t.count })),
  };
}
