/** Join class names, skipping falsy values. */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/** True for absolute http(s) and mailto/tel links. */
export function isExternal(href = "") {
  return /^(https?:)?\/\//.test(href);
}

/** Display a URL without protocol or trailing slash. */
export function prettyUrl(url = "") {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/** Serialize JSON-LD safely for a <script> tag. */
export function jsonLd(data) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
