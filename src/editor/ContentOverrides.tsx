"use client";

// ============================================================
// ContentOverrides — applies content edits (text, image src,
// video src) published from the Visual Studio editor onto the
// live site, in real time.
//
// Edits are stored in the `settings` table under the key
// `contentOverrides` as { [data-edit-id]: { kind, value } }.
// A realtime subscription + MutationObserver keep them applied
// even as React re-renders sections.
// ============================================================

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { initAutoTag } from "./autoTag";

export type ContentEdit = { kind: string; value: string };
export type ContentEditMap = Record<string, ContentEdit>;

export function applyContentEdit(el: HTMLElement, edit: ContentEdit) {
  const { kind, value } = edit;
  if (value === undefined || value === null) return;

  if (kind === "image") {
    const img = el as HTMLImageElement;
    if (img.getAttribute("src") !== value) {
      img.removeAttribute("srcset");
      img.src = value;
    }
    return;
  }

  if (kind === "video") {
    const video = el as HTMLVideoElement;
    const current = video.currentSrc || video.src || video.querySelector("source")?.src || "";
    if (current !== value && !current.endsWith(value)) {
      const source = video.querySelector("source");
      if (source) source.src = value;
      video.src = value;
      video.load();
      video.play().catch(() => {});
    }
    return;
  }

  // text / heading / button / link
  if (el.isContentEditable) return; // don't fight an active inline edit
  if (el.innerText !== value) el.innerText = value;
}

export function applyAllContentEdits(edits: ContentEditMap, opts?: { skipDirty?: boolean }) {
  Object.entries(edits).forEach(([id, edit]) => {
    const el = document.querySelector<HTMLElement>(`[data-edit-id="${CSS.escape(id)}"]`);
    if (!el) return;
    // In the editor preview, unpublished local edits are marked dirty —
    // the published values must not overwrite them.
    if (opts?.skipDirty && el.dataset.editDirty === "1") return;
    applyContentEdit(el, edit);
  });
}

export default function ContentOverrides() {
  const editsRef = useRef<ContentEditMap>({});
  const isPreview = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";

  useEffect(() => {
    const cleanupTagger = initAutoTag();

    const apply = () => applyAllContentEdits(editsRef.current, { skipDirty: isPreview });

    async function load() {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "contentOverrides")
          .single();
        if (error) throw error;
        if (data?.value && typeof data.value === "object") {
          editsRef.current = data.value as ContentEditMap;
          apply();
        }
      } catch {
        // No overrides yet — nothing to do.
      }
    }
    load();

    // Realtime: edits published in the Studio appear instantly.
    const channel = supabase
      .channel("rt-content-overrides")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings", filter: "key=eq.contentOverrides" },
        (payload: any) => {
          if (payload.new?.value && typeof payload.new.value === "object") {
            editsRef.current = payload.new.value as ContentEditMap;
            apply();
          }
        }
      )
      .subscribe();

    // Re-apply whenever the auto-tagger processes newly rendered nodes.
    const onTagged = () => apply();
    window.addEventListener("autotag:updated", onTagged);

    return () => {
      cleanupTagger();
      supabase.removeChannel(channel);
      window.removeEventListener("autotag:updated", onTagged);
    };
  }, [isPreview]);

  return null;
}
