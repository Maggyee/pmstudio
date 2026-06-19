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

