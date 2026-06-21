export type PrototypeEditPatch =
  | { id: string; kind: "set-text"; value: string }
  | { id: string; kind: "set-style"; styles: Record<string, string> };

export type PrototypeEditHistoryEntry = {
  afterSource: string;
  beforeSource: string;
  createdAt: number;
  id: string;
  label: string;
  patch: PrototypeEditPatch;
};

function styleKeyToCssProperty(key: string) {
  return key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function escapeAttributeSelectorValue(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function serializeHtmlDocument(doc: Document) {
  const doctype = doc.doctype ? "<!doctype html>\n" : "";
  return `${doctype}${doc.documentElement.outerHTML}`;
}

const editablePrototypeTags = new Set([
  "a",
  "article",
  "aside",
  "button",
  "div",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "header",
  "label",
  "li",
  "main",
  "nav",
  "p",
  "section",
  "small",
  "span",
  "strong",
]);

function sanitizeIdPart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "el";
}

export function ensurePrototypeEditIds(source: string) {
  if (!source.trim() || source.includes("__PM_STUDIO_SOURCE_EDIT_BRIDGE__")) return source;

  let index = 0;

  return source.replace(
    /<([a-z][a-z0-9-]*)(\s[^<>]*?)?>/gi,
    (match: string, tagName: string, rawAttributes = "") => {
      const tag = tagName.toLowerCase();

      if (!editablePrototypeTags.has(tag)) return match;
      if (/\sdata-od-id\s*=/.test(match)) return match;

      index += 1;

      const selfClosing = /\/\s*>$/.test(match);
      const attributes = rawAttributes.replace(/\/\s*$/, "");
      const editId = `agent-${sanitizeIdPart(tag)}-${index}`;

      return `<${tag}${attributes} data-od-id="${editId}"${selfClosing ? " /" : ""}>`;
    },
  );
}

export function applyPrototypeEditPatch(source: string, patch: PrototypeEditPatch) {
  if (typeof DOMParser === "undefined") return source;

  const doc = new DOMParser().parseFromString(source, "text/html");
  const target = doc.querySelector(`[data-od-id="${escapeAttributeSelectorValue(patch.id)}"]`) as HTMLElement | null;

  if (!target) return source;

  if (patch.kind === "set-text") {
    target.textContent = patch.value;
  }

  if (patch.kind === "set-style") {
    Object.entries(patch.styles).forEach(([key, value]) => {
      target.style.setProperty(styleKeyToCssProperty(key), value);
    });
  }

  return serializeHtmlDocument(doc);
}
