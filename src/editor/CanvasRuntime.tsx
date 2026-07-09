import { useEffect, useState } from "react";
import { ensureFontsFromCss, loadFontFamily } from "./fonts";
import { initAutoTag } from "./autoTag";
import { applyContentEdit, type ContentEditMap } from "./ContentOverrides";

const loadFont = (fontName: string, elementId: string, cssVarName1: string, cssVarName2: string, fallbackStack: string) => {
  if (!fontName) return;
  const cleanFont = fontName.split(',')[0].replace(/['"]/g, '').trim();
  const id = `theme-font-${elementId}`;
  let link = document.getElementById(id) as HTMLLinkElement;
  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(cleanFont)}:wght@300;400;500;600;700;800;900&display=swap`;
  
  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  if (link.href !== href) link.href = href;
  
  const root = document.documentElement;
  root.style.setProperty(cssVarName1, `'${cleanFont}', ${fallbackStack}`);
  root.style.setProperty(cssVarName2, `'${cleanFont}', ${fallbackStack}`);
};

export default function CanvasRuntime() {
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    // Only mount runtime if URL contains ?preview=1
    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") !== "1") return;

    setIsPreview(true);

    // Auto-tag EVERY text / image / video element so the whole page
    // is selectable and editable — not just hand-tagged elements.
    const cleanupAutoTag = initAutoTag();

    let hoverElement: HTMLElement | null = null;
    let selectedElement: HTMLElement | null = null;

    // Remember an element's original content so Undo / Reset can restore it.
    const saveOriginal = (el: HTMLElement) => {
      if (el.dataset.editOriginal !== undefined) return;
      const kind = el.getAttribute("data-edit-kind") || "text";
      if (kind === "image") {
        el.dataset.editOriginal = el.getAttribute("src") || "";
      } else if (kind === "video") {
        el.dataset.editOriginal = el.getAttribute("src") || el.querySelector("source")?.getAttribute("src") || "";
      } else {
        el.dataset.editOriginal = el.innerText;
      }
    };

    const restoreOriginal = (el: HTMLElement) => {
      const orig = el.dataset.editOriginal;
      if (orig === undefined) return;
      const kind = el.getAttribute("data-edit-kind") || "text";
      applyContentEdit(el, { kind, value: orig });
      delete el.dataset.editDirty;
    };

    // Create selection overlays layer
    const overlayContainer = document.createElement("div");
    overlayContainer.id = "canvas-overlays-container";
    overlayContainer.style.position = "absolute";
    overlayContainer.style.inset = "0";
    overlayContainer.style.pointerEvents = "none";
    overlayContainer.style.zIndex = "999999";
    document.body.appendChild(overlayContainer);

    const hoverOutline = document.createElement("div");
    hoverOutline.style.position = "absolute";
    hoverOutline.style.border = "1.5px dashed #06b6d4"; // cyan-500
    hoverOutline.style.pointerEvents = "none";
    hoverOutline.style.display = "none";
    hoverOutline.style.transition = "all 0.1s ease-out";
    overlayContainer.appendChild(hoverOutline);

    const selectOutline = document.createElement("div");
    selectOutline.style.position = "absolute";
    selectOutline.style.border = "2px solid #3b82f6"; // blue-500
    selectOutline.style.boxShadow = "0 0 0 1px #fff";
    selectOutline.style.pointerEvents = "none";
    selectOutline.style.display = "none";
    selectOutline.style.transition = "all 0.15s ease-out";
    overlayContainer.appendChild(selectOutline);

    const selectLabel = document.createElement("div");
    selectLabel.style.position = "absolute";
    selectLabel.style.background = "#3b82f6";
    selectLabel.style.color = "#fff";
    selectLabel.style.padding = "2px 6px";
    selectLabel.style.fontSize = "10px";
    selectLabel.style.fontFamily = "monospace";
    selectLabel.style.fontWeight = "bold";
    selectLabel.style.borderRadius = "3px";
    selectLabel.style.pointerEvents = "none";
    selectLabel.style.display = "none";
    selectLabel.style.transform = "translateY(-100%)";
    overlayContainer.appendChild(selectLabel);

    // Create live overrides style element
    let liveStyleTag = document.getElementById("canvas-live-overrides") as HTMLStyleElement;
    if (!liveStyleTag) {
      liveStyleTag = document.createElement("style");
      liveStyleTag.id = "canvas-live-overrides";
      document.head.appendChild(liveStyleTag);
    }

    // Refresh overlay bounds in animation loop
    let rafId: number;
    const updateOverlays = () => {
      if (hoverElement) {
        const rect = hoverElement.getBoundingClientRect();
        hoverOutline.style.width = `${rect.width}px`;
        hoverOutline.style.height = `${rect.height}px`;
        hoverOutline.style.top = `${rect.top + window.scrollY}px`;
        hoverOutline.style.left = `${rect.left + window.scrollX}px`;
        hoverOutline.style.display = "block";
      } else {
        hoverOutline.style.display = "none";
      }

      if (selectedElement) {
        const rect = selectedElement.getBoundingClientRect();
        selectOutline.style.width = `${rect.width}px`;
        selectOutline.style.height = `${rect.height}px`;
        selectOutline.style.top = `${rect.top + window.scrollY}px`;
        selectOutline.style.left = `${rect.left + window.scrollX}px`;
        selectOutline.style.display = "block";

        selectLabel.textContent = selectedElement.getAttribute("data-edit-name") || "Element";
        selectLabel.style.top = `${rect.top + window.scrollY - 4}px`;
        selectLabel.style.left = `${rect.left + window.scrollX}px`;
        selectLabel.style.display = "block";
      } else {
        selectOutline.style.display = "none";
        selectLabel.style.display = "none";
      }

      rafId = requestAnimationFrame(updateOverlays);
    };

    rafId = requestAnimationFrame(updateOverlays);

    // Communicate style attributes of element back to parent
    const sendElementStyles = (el: HTMLElement) => {
      const computed = window.getComputedStyle(el);
      const props: Record<string, string> = {
        color: computed.color,
        "background-color": computed.backgroundColor,
        "font-family": computed.fontFamily,
        "font-size": computed.fontSize,
        "font-weight": computed.fontWeight,
        "letter-spacing": computed.letterSpacing,
        "line-height": computed.lineHeight,
        "text-align": computed.textAlign,
        "text-transform": computed.textTransform,
        width: computed.width,
        height: computed.height,
        "padding-top": computed.paddingTop,
        "padding-right": computed.paddingRight,
        "padding-bottom": computed.paddingBottom,
        "padding-left": computed.paddingLeft,
        "margin-top": computed.marginTop,
        "margin-right": computed.marginRight,
        "margin-bottom": computed.marginBottom,
        "margin-left": computed.marginLeft,
        display: computed.display,
        "border-width": computed.borderWidth,
        "border-color": computed.borderColor,
        "border-radius": computed.borderRadius,
        opacity: computed.opacity,
        "box-shadow": computed.boxShadow
      };

      const path = el.getAttribute("data-edit-path") || "";
      const textVal = el.innerText || "";
      let mediaSrc = "";
      
      let mediaEl = el;
      if (el.tagName !== "IMG" && el.tagName !== "VIDEO") {
        const childImg = el.querySelector("img");
        const childVideo = el.querySelector("video");
        if (childImg) {
          mediaEl = childImg;
        } else if (childVideo) {
          mediaEl = childVideo;
        }
      }

      if (mediaEl.tagName === "IMG") {
        mediaSrc = (mediaEl as HTMLImageElement).getAttribute("src") || (mediaEl as HTMLImageElement).src || "";
      } else if (mediaEl.tagName === "VIDEO") {
        const video = mediaEl as HTMLVideoElement;
        mediaSrc = video.getAttribute("src") || video.querySelector("source")?.getAttribute("src") || video.currentSrc || "";
      }

      // For backward compatibility
      window.parent.postMessage(
        {
          type: "EDITOR_SELECTED",
          id: el.getAttribute("data-edit-id"),
          name: el.getAttribute("data-edit-name"),
          kind: el.getAttribute("data-edit-kind"),
          path,
          styles: props,
          src: mediaSrc,
          content: mediaSrc || textVal
        },
        "*"
      );
    };

    // Hover listeners
    const handleMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-edit-id]") as HTMLElement;
      if (target) {
        hoverElement = target;
      } else {
        hoverElement = null;
      }
    };

    const handleMouseOut = () => {
      hoverElement = null;
    };

    // Click handler
    const handleMouseClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-edit-id]") as HTMLElement;
      if (target) {
        e.preventDefault();
        e.stopPropagation();
        selectedElement = target;
        sendElementStyles(target);

        // Section 5 Visual Editor Selection & Hover Interception
        const id = target.getAttribute("data-edit-id");
        const path = target.getAttribute("data-edit-path");
        const name = target.getAttribute("data-edit-name");
        const kind = target.getAttribute("data-edit-kind");

        let mediaSrc = "";
        let mediaEl = target;
        if (target.tagName !== "IMG" && target.tagName !== "VIDEO") {
          const childImg = target.querySelector("img");
          const childVideo = target.querySelector("video");
          if (childImg) {
            mediaEl = childImg;
          } else if (childVideo) {
            mediaEl = childVideo;
          }
        }
        if (mediaEl.tagName === "IMG") {
          mediaSrc = (mediaEl as HTMLImageElement).getAttribute("src") || (mediaEl as HTMLImageElement).src || "";
        } else if (mediaEl.tagName === "VIDEO") {
          const video = mediaEl as HTMLVideoElement;
          mediaSrc = video.getAttribute("src") || video.querySelector("source")?.getAttribute("src") || video.currentSrc || "";
        }
        const textVal = target.innerText || "";

        window.parent.postMessage({
          type: 'CANVAS_ELEMENT_SELECTED',
          element: { 
            id, 
            path, 
            name, 
            kind,
            content: mediaSrc || textVal,
            src: mediaSrc
          }
        }, '*');
      } else {
        selectedElement = null;
        window.parent.postMessage({ type: "EDITOR_CLEARED" }, "*");
      }
    };

    // Double-click inline edit
    const handleDoubleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("[data-edit-id]") as HTMLElement;
      if (target) {
        const kind = target.getAttribute("data-edit-kind");
        if (kind === "text" || kind === "heading" || kind === "button" || kind === "link") {
          e.preventDefault();
          saveOriginal(target);
          target.contentEditable = "plaintext-only";
          target.focus();
          
          // Select all text
          const range = document.createRange();
          range.selectNodeContents(target);
          const sel = window.getSelection();
          if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
          }

          // Blurs/Commits
          const commitText = () => {
            target.contentEditable = "false";
            const path = target.getAttribute("data-edit-path") || "";
            // Mark as locally edited so published overrides don't clobber it
            target.dataset.editDirty = "1";
            window.parent.postMessage(
              {
                type: "EDITOR_CONTENT",
                path,
                id: target.getAttribute("data-edit-id"),
                kind: target.getAttribute("data-edit-kind") || "text",
                value: target.innerText
              },
              "*"
            );
            target.removeEventListener("blur", commitText);
            target.removeEventListener("keydown", handleKey);
          };

          const handleKey = (evt: KeyboardEvent) => {
            if (evt.key === "Enter" && !evt.shiftKey) {
              evt.preventDefault();
              target.blur();
            }
            if (evt.key === "Escape") {
              target.blur();
            }
          };

          target.addEventListener("blur", commitText);
          target.addEventListener("keydown", handleKey);
        }
      }
    };

    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("click", handleMouseClick, true);
    document.addEventListener("dblclick", handleDoubleClick);

    // parent messaging listener
    const handleMessage = (e: MessageEvent) => {
      const payload = e.data;
      if (!payload || typeof payload !== "object") return;

      if (payload.type === "SYNC_THEME" && payload.theme) {
        const root = document.documentElement;
        const { primaryColor, primaryLight, primaryStrong, headingFont, bodyFont } = payload.theme;
        if (primaryColor) {
          root.style.setProperty("--color-primary", primaryColor);
          root.style.setProperty("--primary", primaryColor);
          root.style.setProperty("--ring", primaryColor);
          root.style.setProperty("--color-teal", primaryColor);
        }
        if (primaryLight) {
          root.style.setProperty("--color-primary-light", primaryLight);
          root.style.setProperty("--color-teal-bright", primaryLight);
        }
        if (primaryStrong) {
          root.style.setProperty("--color-primary-strong", primaryStrong);
        }
        
        if (headingFont) {
          loadFontFamily(headingFont);
          loadFont(headingFont, "heading", "--font-heading", "--font-display", "sans-serif");
          
          let headingStyle = document.getElementById("canvas-heading-font") as HTMLStyleElement;
          if (!headingStyle) {
            headingStyle = document.createElement("style");
            headingStyle.id = "canvas-heading-font";
            document.head.appendChild(headingStyle);
          }
          headingStyle.textContent = `h1, h2, h3, h4, h5, h6, .font-display { font-family: '${headingFont}', sans-serif !important; }`;
        }
        
        if (bodyFont) {
          loadFontFamily(bodyFont);
          loadFont(bodyFont, "body", "--font-body", "--font-sans", "sans-serif");

          let bodyStyle = document.getElementById("canvas-body-font") as HTMLStyleElement;
          if (!bodyStyle) {
            bodyStyle = document.createElement("style");
            bodyStyle.id = "canvas-body-font";
            document.head.appendChild(bodyStyle);
          }
          bodyStyle.textContent = `body, p, span, a, li, button { font-family: '${bodyFont}', sans-serif !important; }`;
        }
      }

      if (payload.type === "EDITOR_STYLE") {
        liveStyleTag.textContent = payload.css || "";
        ensureFontsFromCss(payload.css || "");
      }

      // Live-apply a single content edit (text / image src / video src)
      // coming from the Studio inspector — instant real-time preview.
      if (payload.type === "EDITOR_CONTENT_APPLY" && payload.id) {
        const node = document.querySelector(`[data-edit-id="${CSS.escape(payload.id)}"]`) as HTMLElement | null;
        if (node) {
          saveOriginal(node);
          node.dataset.editDirty = "1";
          applyContentEdit(node, { kind: payload.kind || "text", value: payload.value ?? "" });
        }
      }

      // Bulk sync of all unpublished content edits (sent on load / undo / redo)
      if (payload.type === "PREVIEW_CONTENT" && payload.edits && typeof payload.edits === "object") {
        // First restore everything locally edited, then re-apply the
        // current edit set — this makes Undo / Redo / Reset accurate.
        document.querySelectorAll<HTMLElement>('[data-edit-dirty="1"]').forEach((el) => restoreOriginal(el));
        Object.entries(payload.edits as ContentEditMap).forEach(([id, edit]) => {
          const node = document.querySelector(`[data-edit-id="${CSS.escape(id)}"]`) as HTMLElement | null;
          if (node) {
            saveOriginal(node);
            node.dataset.editDirty = "1";
            applyContentEdit(node, edit);
          }
        });
        // Settings-backed drafts (hero.title, branding.logo, …) applied by path
        if (payload.pathDrafts && typeof payload.pathDrafts === "object") {
          Object.entries(payload.pathDrafts as Record<string, Record<string, any>>).forEach(([section, fields]) => {
            Object.entries(fields || {}).forEach(([field, value]) => {
              if (typeof value !== "string") return;
              document.querySelectorAll(`[data-edit-path="${CSS.escape(`${section}.${field}`)}"]`).forEach((n) => {
                const el = n as HTMLElement;
                saveOriginal(el);
                el.dataset.editDirty = "1";
                const kind = el.getAttribute("data-edit-kind") || "text";
                applyContentEdit(el, { kind: kind === "heading" || kind === "button" || kind === "link" ? "text" : kind, value });
              });
            });
          });
        }
      }

      if (payload.type === "EDITOR_SELECT") {
        const node = document.querySelector(`[data-edit-id="${payload.id}"]`) as HTMLElement;
        if (node) {
          selectedElement = node;
          node.scrollIntoView({ behavior: "smooth", block: "center" });
          sendElementStyles(node);
        }
      }

      if (payload.type === "PREVIEW_SCROLL") {
        const anchor = payload.anchor;
        if (anchor) {
          const el = document.querySelector(anchor);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
    };

    window.addEventListener("message", handleMessage);

    // Announce ready handshake
    window.parent.postMessage({ type: "EDITOR_RUNTIME_READY" }, "*");
    window.parent.postMessage({ type: "PREVIEW_READY" }, "*");
    window.parent.postMessage({ type: "THEME_STUDIO_READY" }, "*");

    return () => {
      cancelAnimationFrame(rafId);
      cleanupAutoTag();
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.removeEventListener("click", handleMouseClick, true);
      document.removeEventListener("dblclick", handleDoubleClick);
      window.removeEventListener("message", handleMessage);
      overlayContainer.remove();
    };
  }, []);

  return null;
}

