// ============================================================
// autoTag — automatically makes EVERY text, image and video
// element on the page editable in the Visual Studio editor.
//
// It walks the DOM and assigns a *stable* `data-edit-id` (derived
// from the element's position relative to the nearest ancestor
// with an `id`), plus `data-edit-kind` and `data-edit-name`.
// Because the id is deterministic, style/content overrides
// published from the Studio re-attach to the same element on the
// live site — no hand-tagging required.
// ============================================================

const TEXT_TAGS = new Set([
  "H1", "H2", "H3", "H4", "H5", "H6",
  "P", "SPAN", "A", "BUTTON", "LI", "BLOCKQUOTE",
  "FIGCAPTION", "LABEL", "TD", "TH", "DT", "DD",
  "STRONG", "EM", "B", "I", "SMALL", "CITE", "SUMMARY", "LEGEND",
]);

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "IFRAME", "INPUT", "TEXTAREA", "SELECT", "OPTION"]);

function sanitize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "el";
}

// Builds a deterministic id from the DOM path up to the nearest
// ancestor that has an `id` attribute (section anchors, body, …).
function stableId(el: Element): string {
  const segments: string[] = [];
  let node: Element | null = el;
  let anchor = "body";

  while (node && node !== document.body) {
    const parent: Element | null = node.parentElement;
    if (!parent) break;

    // Found a stable anchor — stop climbing.
    if (node !== el && node.id) {
      anchor = sanitize(node.id);
      break;
    }

    // Index among siblings with the same tag.
    let idx = 0;
    for (const sib of Array.from(parent.children)) {
      if (sib === node) break;
      if (sib.tagName === node.tagName) idx++;
    }
    segments.unshift(`${node.tagName.toLowerCase()}${idx}`);
    node = parent;
  }

  return `ae-${anchor}-${segments.join("-")}`;
}

function kindOf(el: Element): string | null {
  const tag = el.tagName;
  if (tag === "IMG") return "image";
  if (tag === "VIDEO") return "video";
  if (!TEXT_TAGS.has(tag)) return null;

  // Text elements must have at least one direct, non-empty text node.
  for (const child of Array.from(el.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE && (child.textContent || "").trim().length > 0) {
      if (/^H[1-6]$/.test(tag)) return "heading";
      if (tag === "BUTTON") return "button";
      if (tag === "A") return "link";
      return "text";
    }
  }
  return null;
}

function nameOf(el: Element, kind: string): string {
  if (kind === "image") {
    const alt = (el as HTMLImageElement).alt;
    if (alt) return `Image: ${alt.slice(0, 30)}`;
    const src = (el as HTMLImageElement).src || "";
    return `Image: ${src.split("/").pop()?.split("?")[0]?.slice(0, 30) || "unnamed"}`;
  }
  if (kind === "video") return "Video";
  const text = (el as HTMLElement).innerText?.trim().replace(/\s+/g, " ") || "";
  const label = kind.charAt(0).toUpperCase() + kind.slice(1);
  return text ? `${label}: ${text.slice(0, 30)}${text.length > 30 ? "…" : ""}` : label;
}

function shouldSkip(el: Element): boolean {
  if (SKIP_TAGS.has(el.tagName)) return true;
  if (el.closest("#canvas-overlays-container,[data-edit-ignore],[data-sonner-toaster]")) return true;
  return false;
}

// Tags every eligible untagged element currently in the DOM.
export function tagAll(root: ParentNode = document.body): number {
  let count = 0;
  const candidates = root.querySelectorAll(
    "img, video, " + Array.from(TEXT_TAGS).map((t) => t.toLowerCase()).join(", ")
  );

  candidates.forEach((el) => {
    if (el.hasAttribute("data-edit-id")) return;
    if (shouldSkip(el)) return;
    const kind = kindOf(el);
    if (!kind) return;

    el.setAttribute("data-edit-id", stableId(el));
    el.setAttribute("data-edit-kind", kind);
    el.setAttribute("data-edit-name", nameOf(el, kind));
    count++;
  });
  return count;
}

let observer: MutationObserver | null = null;
let refCount = 0;

// Idempotent init: tags now + keeps tagging as React renders new
// nodes. Returns a cleanup function.
export function initAutoTag(): () => void {
  refCount++;
  tagAll();

  if (!observer) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    observer = new MutationObserver(() => {
      if (timer) return;
      timer = setTimeout(() => {
        timer = null;
        tagAll();
        // Let listeners (e.g. ContentOverrides) re-apply after new tags.
        window.dispatchEvent(new CustomEvent("autotag:updated"));
      }, 250);
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  return () => {
    refCount--;
    if (refCount <= 0 && observer) {
      observer.disconnect();
      observer = null;
      refCount = 0;
    }
  };
}
