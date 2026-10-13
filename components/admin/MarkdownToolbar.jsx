"use client";

import {
  Bold,
  Code,
  FileCode2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Table,
} from "lucide-react";

// Formatting helpers for the Markdown textarea. Edits go through
// execCommand("insertText") so the browser's undo/redo keeps working.

function insert(textarea, text, selectFrom, selectTo) {
  textarea.focus();
  const start = textarea.selectionStart;
  const ok = document.execCommand?.("insertText", false, text);
  if (!ok) {
    textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd, "end");
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }
  if (selectFrom !== undefined) textarea.setSelectionRange(start + selectFrom, start + (selectTo ?? selectFrom));
}

/** Wraps the selection, e.g. **bold**. Toggles off when already wrapped. */
export function wrap(textarea, before, after = before, placeholder = "text") {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const selected = value.slice(s, e);
  if (value.slice(s - before.length, s) === before && value.slice(e, e + after.length) === after) {
    textarea.setSelectionRange(s - before.length, e + after.length);
    insert(textarea, selected, 0, selected.length);
    return;
  }
  const inner = selected || placeholder;
  insert(textarea, `${before}${inner}${after}`, before.length, before.length + inner.length);
}

/** Adds (or removes) a prefix on every selected line, e.g. "## " or "- ". */
export function prefixLines(textarea, prefix, { numbered = false } = {}) {
  const { value } = textarea;
  const start = value.lastIndexOf("\n", textarea.selectionStart - 1) + 1;
  let end = value.indexOf("\n", textarea.selectionEnd);
  if (end === -1) end = value.length;

  const lines = value.slice(start, end).split("\n");
  const pattern = numbered ? /^\d+\.\s/ : new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  const allPrefixed = lines.every((l) => pattern.test(l));
  const next = lines
    .map((line, i) => {
      if (allPrefixed) return line.replace(pattern, "");
      const clean = line.replace(/^(#{1,6}\s|>\s|[-*]\s(\[[ x]\]\s)?|\d+\.\s)/, "");
      return `${numbered ? `${i + 1}. ` : prefix}${clean}`;
    })
    .join("\n");

  const collapsed = textarea.selectionStart === textarea.selectionEnd;
  textarea.setSelectionRange(start, end);
  // With no selection, leave the cursor at the end of the line so typing continues
  // after the prefix; with a selection, keep the lines selected.
  if (collapsed) insert(textarea, next, next.length);
  else insert(textarea, next, 0, next.length);
}

/** Inserts a block on its own lines at the cursor. */
export function insertBlock(textarea, block, cursorOffset) {
  const { selectionStart: s, value } = textarea;
  const needsBreak = s > 0 && value[s - 1] !== "\n" ? "\n\n" : s > 1 && value[s - 2] !== "\n" ? "\n" : "";
  const text = `${needsBreak}${block}\n`;
  insert(textarea, text, needsBreak.length + (cursorOffset ?? block.length));
}

export function insertLink(textarea) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const selected = value.slice(s, e);
  if (/^https?:\/\//.test(selected)) {
    insert(textarea, `[link text](${selected})`, 1, 10);
  } else {
    const label = selected || "link text";
    insert(textarea, `[${label}](https://)`, label.length + 3, label.length + 11);
  }
}

const TABLE = "| Column | Column |\n| ------ | ------ |\n| Cell   | Cell   |";

export default function MarkdownToolbar({ textareaRef, onImage }) {
  const groups = [
    [
      { label: "Heading 2", icon: Heading2, fn: (t) => prefixLines(t, "## ") },
      { label: "Heading 3", icon: Heading3, fn: (t) => prefixLines(t, "### ") },
    ],
    [
      { label: "Bold (Ctrl+B)", icon: Bold, fn: (t) => wrap(t, "**") },
      { label: "Italic (Ctrl+I)", icon: Italic, fn: (t) => wrap(t, "_") },
      { label: "Strikethrough", icon: Strikethrough, fn: (t) => wrap(t, "~~") },
      { label: "Inline code", icon: Code, fn: (t) => wrap(t, "`", "`", "code") },
    ],
    [
      { label: "Link (Ctrl+K)", icon: Link2, fn: insertLink },
      { label: "Image", icon: ImageIcon, fn: null },
      { label: "Code block", icon: FileCode2, fn: (t) => insertBlock(t, "```js\n\n```", 6) },
      { label: "Quote", icon: Quote, fn: (t) => prefixLines(t, "> ") },
    ],
    [
      { label: "Bulleted list", icon: List, fn: (t) => prefixLines(t, "- ") },
      { label: "Numbered list", icon: ListOrdered, fn: (t) => prefixLines(t, "", { numbered: true }) },
      { label: "Task list", icon: ListChecks, fn: (t) => prefixLines(t, "- [ ] ") },
      { label: "Table", icon: Table, fn: (t) => insertBlock(t, TABLE) },
      { label: "Divider", icon: Minus, fn: (t) => insertBlock(t, "---") },
    ],
  ];

  function apply(fn) {
    const textarea = textareaRef.current;
    if (textarea) fn(textarea);
  }

  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />}
          {group.map(({ label, icon: Icon, fn }) => (
            <button
              key={label}
              type="button"
              onMouseDown={(e) => e.preventDefault()} // keep the textarea selection
              onClick={() => (fn ? apply(fn) : onImage())}
              title={label}
              aria-label={label}
              className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-card-hover hover:text-fg"
            >
              <Icon size={16} aria-hidden="true" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
