import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type StyleOverrides = Record<string, Record<string, string>>;
export type ContentDrafts = Record<string, Record<string, any>>;
// Direct element edits keyed by data-edit-id (text, image src, video src)
export type ContentEdits = Record<string, { kind: string; value: string }>;

type HistoryFrame = {
  overrides: StyleOverrides;
  drafts: ContentDrafts;
  contentEdits: ContentEdits;
};

type EditorState = {
  overrides: StyleOverrides;
  drafts: ContentDrafts;
  contentEdits: ContentEdits;
  past: HistoryFrame[];
  future: HistoryFrame[];
  device: "desktop" | "laptop" | "tablet" | "mobile" | "custom";
  customWidth: number;
  selectedId: string | null;

  // Actions
  setSelectedId: (id: string | null) => void;
  setDevice: (device: "desktop" | "laptop" | "tablet" | "mobile" | "custom") => void;
  setCustomWidth: (width: number) => void;

  setOverride: (editId: string, property: string, value: string) => void;
  resetOverride: (editId: string) => void;
  setContentDraft: (path: string, value: any) => void;
  setContentEdit: (editId: string, kind: string, value: string) => void;

  undo: () => void;
  redo: () => void;
  resetAll: () => void;
  publish: () => Promise<{ success: boolean; error?: string }>;
};

// Deep merge helper
function deepMerge(target: any, source: any) {
  const output = { ...target };
  if (source && typeof source === "object") {
    Object.keys(source).forEach((key) => {
      if (source[key] && typeof source[key] === "object") {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

// Convert style overrides map to CSS string
export function overridesToCss(overrides: StyleOverrides): string {
  let css = "";
  Object.entries(overrides).forEach(([editId, props]) => {
    css += `[data-edit-id="${editId}"] {\n`;
    Object.entries(props).forEach(([prop, val]) => {
      if (val) {
        css += `  ${prop}: ${val} !important;\n`;
      }
    });
    css += `}\n`;
  });
  return css;
}

function snapshot(state: { overrides: StyleOverrides; drafts: ContentDrafts; contentEdits: ContentEdits }): HistoryFrame {
  return {
    overrides: structuredClone(state.overrides),
    drafts: structuredClone(state.drafts),
    contentEdits: structuredClone(state.contentEdits),
  };
}

export const useEditorStore = create<EditorState>((set, get) => ({
  overrides: {},
  drafts: {},
  contentEdits: {},
  past: [],
  future: [],
  device: "desktop",
  customWidth: 1280,
  selectedId: null,

  setSelectedId: (id) => set({ selectedId: id }),
  setDevice: (device) => set({ device }),
  setCustomWidth: (customWidth) => set({ customWidth }),

  setOverride: (editId, property, value) => {
    const state = get();
    const newPast = [...state.past, snapshot(state)].slice(-100);

    const newOverrides = structuredClone(state.overrides);
    if (!newOverrides[editId]) newOverrides[editId] = {};
    if (value === "" || value === undefined) {
      delete newOverrides[editId][property];
      if (Object.keys(newOverrides[editId]).length === 0) {
        delete newOverrides[editId];
      }
    } else {
      newOverrides[editId][property] = value;
    }

    set({
      overrides: newOverrides,
      past: newPast,
      future: [] // Clear redo stack on action
    });
  },

  resetOverride: (editId) => {
    const state = get();
    const newPast = [...state.past, snapshot(state)].slice(-100);

    const newOverrides = structuredClone(state.overrides);
    delete newOverrides[editId];

    set({
      overrides: newOverrides,
      past: newPast,
      future: []
    });
  },

  setContentDraft: (path, value) => {
    const state = get();
    const newPast = [...state.past, snapshot(state)].slice(-100);

    const newDrafts = structuredClone(state.drafts);
    const parts = path.split(".");
    if (parts.length === 2) {
      const [section, field] = parts;
      if (!newDrafts[section]) newDrafts[section] = {};
      newDrafts[section][field] = value;
    }

    set({
      drafts: newDrafts,
      past: newPast,
      future: []
    });
  },

  setContentEdit: (editId, kind, value) => {
    const state = get();
    const newPast = [...state.past, snapshot(state)].slice(-100);

    const newEdits = structuredClone(state.contentEdits);
    if (value === "" || value === undefined) {
      delete newEdits[editId];
    } else {
      newEdits[editId] = { kind, value };
    }

    set({
      contentEdits: newEdits,
      past: newPast,
      future: []
    });
  },

  undo: () => {
    const state = get();
    const { past, future } = state;
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);
    const newFuture = [snapshot(state), ...future];

    set({
      overrides: previous.overrides,
      drafts: previous.drafts,
      contentEdits: previous.contentEdits || {},
      past: newPast,
      future: newFuture
    });
  },

  redo: () => {
    const state = get();
    const { past, future } = state;
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);
    const newPast = [...past, snapshot(state)];

    set({
      overrides: next.overrides,
      drafts: next.drafts,
      contentEdits: next.contentEdits || {},
      past: newPast,
      future: newFuture
    });
  },

  resetAll: () => {
    set({
      overrides: {},
      drafts: {},
      contentEdits: {},
      past: [],
      future: []
    });
  },

  publish: async () => {
    const { overrides, drafts, contentEdits } = get();
    try {
      // 1. Save style overrides to settings table in Supabase
      const cssString = overridesToCss(overrides);
      const { error: cssError } = await supabase
        .from("settings")
        .upsert({ key: "editorOverrides", value: { overrides, css: cssString } }, { onConflict: "key" });

      if (cssError) throw cssError;

      // 2. Save direct content edits (text / image / video by element id),
      //    merged over whatever was published before.
      if (Object.keys(contentEdits).length > 0) {
        const { data: currentEdits } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "contentOverrides")
          .single();

        const mergedEdits = {
          ...(currentEdits?.value && typeof currentEdits.value === "object" ? currentEdits.value : {}),
          ...contentEdits,
        };

        const { error: editsErr } = await supabase
          .from("settings")
          .upsert({ key: "contentOverrides", value: mergedEdits }, { onConflict: "key" });

        if (editsErr) throw editsErr;
      }

      // 3. Save settings-backed content drafts (hero.title, branding.logo, …)
      for (const [sectionKey, fields] of Object.entries(drafts)) {
        // Fetch current section settings
        const { data: current, error: fetchErr } = await supabase
          .from("settings")
          .select("value")
          .eq("key", sectionKey)
          .single();

        let mergedValue = fields;
        if (!fetchErr && current?.value) {
          mergedValue = deepMerge(current.value, fields);
        }

        const { error: upsertErr } = await supabase
          .from("settings")
          .upsert({ key: sectionKey, value: mergedValue }, { onConflict: "key" });

        if (upsertErr) throw upsertErr;
      }

      // Reset local draft state on success
      set({
        drafts: {},
        contentEdits: {},
        past: [],
        future: []
      });

      return { success: true };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message || "Failed to publish canvas changes" };
    }
  }
}));
