import GithubSlugger from "github-slugger";

// Shared by the admin editor (client) and the API (server).

export const POST_LIMITS = {
  title: { min: 3, max: 140 },
  slug: { max: 100 },
  excerpt: { max: 300 },
  content: { min: 1, max: 200_000 },
  tags: { max: 8, length: 32 },
  category: { max: 40 },
  seoTitle: { max: 70 },
  seoDescription: { max: 160 },
};

export const POST_STATUSES = ["draft", "published"];

/** "Building a REST API in Node.js!" → "building-a-rest-api-in-nodejs" */
export function slugify(value = "") {
  return value
    .toString()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, POST_LIMITS.slug.max);
}

export function countWords(markdown = "") {
  const text = markdown
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/[^\s\w]/g, " ")) // keep code words
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

/** Minutes to read at ~220 words per minute, minimum 1. */
export function readingTime(markdown = "") {
  return Math.max(1, Math.round(countWords(markdown) / 220));
}

/** Plain text of an inline-markdown heading, matching what rehype-slug sees. */
function headingText(raw) {
  return raw
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/\s+#+\s*$/, "")
    .trim();
}

/**
 * h2/h3 headings for the table of contents. IDs use the same slugger as
 * rehype-slug, so links match the rendered anchors.
 */
export function extractHeadings(markdown = "") {
  const slugger = new GithubSlugger();
  const headings = [];
  let inFence = false;

  for (const line of markdown.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const match = /^(#{1,6})\s+(.+)$/.exec(line);
    if (!match) continue;
    const text = headingText(match[2]);
    const id = slugger.slug(text); // slug every heading so duplicate counters stay in sync
    if (match[1].length === 2 || match[1].length === 3) {
      headings.push({ level: match[1].length, text, id });
    }
  }
  return headings;
}

/** First ~160 characters of prose, used when no excerpt is written. */
export function autoExcerpt(markdown = "", max = 160) {
  // Prefer plain paragraphs; skip headings, code, tables, lists, quotes and HTML.
  const paragraphs = markdown
    .replace(/```[\s\S]*?```/g, "\n\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block && !/^(#|\||<|!\[|>|[-*+]\s|\d+\.\s|---|\*\*\*)/.test(block));
  const text = (paragraphs.length ? paragraphs.join(" ") : markdown)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^#+\s.*$/gm, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[>*_`~|#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : text;
}

function clean(value, max) {
  return typeof value === "string" ? value.trim().slice(0, max ?? undefined) : "";
}

function isSafeUrl(url) {
  return url === "" || url.startsWith("/") || /^https:\/\//i.test(url);
}

/**
 * Validates and normalises an incoming post.
 * @returns {{ data: object, errors: Record<string,string>, valid: boolean }}
 */
export function validatePost(input = {}) {
  const content = typeof input.content === "string" ? input.content.replace(/\r\n/g, "\n") : "";
  const title = clean(input.title).replace(/\s+/g, " ");
  const tags = Array.isArray(input.tags)
    ? [...new Set(input.tags.map((t) => slugify(String(t))).filter(Boolean))]
    : [];

  const data = {
    title,
    slug: slugify(clean(input.slug) || title),
    excerpt: clean(input.excerpt),
    content,
    tags,
    category: clean(input.category).replace(/\s+/g, " "),
    status: POST_STATUSES.includes(input.status) ? input.status : "draft",
    publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
    featured: Boolean(input.featured),
    coverImage: {
      url: clean(input.coverImage?.url),
      alt: clean(input.coverImage?.alt, 200),
    },
    seoTitle: clean(input.seoTitle),
    seoDescription: clean(input.seoDescription),
  };

  const errors = {};
  const L = POST_LIMITS;

  if (data.title.length < L.title.min) errors.title = `Title needs at least ${L.title.min} characters.`;
  else if (data.title.length > L.title.max) errors.title = `Keep the title under ${L.title.max} characters.`;

  if (!data.slug) errors.slug = "Slug can only contain letters, numbers and dashes.";

  if (data.excerpt.length > L.excerpt.max) errors.excerpt = `Keep the excerpt under ${L.excerpt.max} characters.`;

  if (data.status === "published" && content.trim().length < L.content.min) {
    errors.content = "Write some content before publishing.";
  } else if (content.length > L.content.max) {
    errors.content = "This post is too long to save.";
  }

  if (data.tags.length > L.tags.max) errors.tags = `Use at most ${L.tags.max} tags.`;
  else if (data.tags.some((t) => t.length > L.tags.length)) errors.tags = `Tags must be under ${L.tags.length} characters.`;

  if (data.category.length > L.category.max) errors.category = `Keep the category under ${L.category.max} characters.`;
  if (data.seoTitle.length > L.seoTitle.max) errors.seoTitle = `SEO title should be under ${L.seoTitle.max} characters.`;
  if (data.seoDescription.length > L.seoDescription.max) {
    errors.seoDescription = `Meta description should be under ${L.seoDescription.max} characters.`;
  }

  if (!isSafeUrl(data.coverImage.url)) errors.coverImage = "Cover image must be an uploaded image or an https:// URL.";

  if (data.publishedAt && Number.isNaN(data.publishedAt.getTime())) errors.publishedAt = "Choose a valid date.";

  return { data, errors, valid: Object.keys(errors).length === 0 };
}

export function formatDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", options).format(new Date(value));
}

/** "draft" | "scheduled" | "published" — scheduled is a published post with a future date. */
export function postState(post, now = Date.now()) {
  if (post.status !== "published") return "draft";
  return post.publishedAt && new Date(post.publishedAt).getTime() > now ? "scheduled" : "published";
}
