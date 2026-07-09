"use client";

import { useEffect, useRef, useState } from "react";
import { useEditorStore, overridesToCss } from "@/editor/editorStore";
import { FONT_CATEGORIES } from "@/editor/fonts";
import { useSettings, DEFAULT_SETTINGS } from "@/hooks/useSettings";
import { supabase } from "@/lib/supabase";
import {
  Laptop, Smartphone, Tablet, Monitor, Undo, Redo, Save,
  Sparkles, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Eye, EyeOff, ArrowUp, ArrowDown, UploadCloud, Loader2
} from "lucide-react";

const GRADIENT_PRESETS = [
  { name: "None", value: "" },
  { name: "Sunset Glow (Rose to Orange)", value: "linear-gradient(to right, #f43f5e, #f97316)" },
  { name: "Ocean Calm (Teal to Blue)", value: "linear-gradient(to right, #0d9488, #2563eb)" },
  { name: "Cyberpunk Glow (Violet to Cyan)", value: "linear-gradient(to right, #a855f7, #06b6d4)" },
  { name: "Gold Leaf (Amber to Bronze)", value: "linear-gradient(to right, #fbbf24, #d97706)" },
  { name: "Emerald Shine (Green to Emerald)", value: "linear-gradient(to right, #22c55e, #10b981)" }
];

const GLOW_PRESETS = [
  { name: "None", value: "" },
  { name: "Neon Cyan Glow", value: "0 0 8px rgba(6, 182, 212, 0.6)" },
  { name: "Retro Shadow", value: "2px 2px 0px #0f172a" },
  { name: "Soft Glow", value: "0 0 12px rgba(20, 184, 166, 0.4)" },
  { name: "3D Extrude", value: "1px 1px 0 #334155, 2px 2px 0 #334155, 3px 3px 0 #334155" }
];

export default function Canvas() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const {
    overrides,
    drafts,
    contentEdits,
    device,
    customWidth,
    selectedId,
    setDevice,
    setSelectedId,
    setOverride,
    resetOverride,
    setContentDraft,
    setContentEdit,
    undo,
    redo,
    publish,
    past,
    future
  } = useEditorStore();

  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"content" | "type" | "layout" | "style" | "effects">("content");
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { settings } = useSettings();
  const sectionsList = drafts.layout?.sections || settings.layout?.sections || DEFAULT_SETTINGS.layout?.sections || [];

  const moveSection = (index: number, direction: "up" | "down") => {
    const newSections = [...sectionsList];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newSections.length) {
      const temp = newSections[index];
      newSections[index] = newSections[targetIndex];
      newSections[targetIndex] = temp;
      setContentDraft("layout.sections", newSections);
    }
  };

  const toggleSectionVisibility = (index: number) => {
    const newSections = [...sectionsList];
    newSections[index] = {
      ...newSections[index],
      visible: newSections[index].visible === false ? true : false
    };
    setContentDraft("layout.sections", newSections);
  };

  const syncStylesToIframe = () => {
    const css = overridesToCss(overrides);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: "EDITOR_STYLE", css },
        "*"
      );
    }
  };

  useEffect(() => {
    syncStylesToIframe();
  }, [overrides]);

  // Section 2: Real-Time Preview Synchronization Host Dispatcher
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;

    iframe.contentWindow.postMessage(
      {
        type: "PREVIEW_OVERRIDE",
        overrides: overrides,
        content: drafts,
      },
      "*"
    );
  }, [overrides, drafts]);

  // Keep the canvas in sync with all unpublished content edits
  // (text, images, videos) — including undo / redo / reset.
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      { type: "PREVIEW_CONTENT", edits: contentEdits, pathDrafts: drafts },
      "*"
    );
  }, [contentEdits, drafts]);

  // Live-apply a single edit to the canvas instantly while typing.
  const applyLive = (id: string | null, kind: string, value: string) => {
    if (!id || !iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage(
      { type: "EDITOR_CONTENT_APPLY", id, kind, value },
      "*"
    );
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const payload = e.data;
      if (!payload || typeof payload !== "object") return;

      if (payload.type === "EDITOR_RUNTIME_READY") {
        syncStylesToIframe();
        // Also push initial/current drafts and overrides
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage(
            {
              type: "PREVIEW_OVERRIDE",
              overrides: overrides,
              content: drafts,
            },
            "*"
          );
          iframeRef.current.contentWindow.postMessage(
            { type: "PREVIEW_CONTENT", edits: contentEdits, pathDrafts: drafts },
            "*"
          );
        }
      }

      if (payload.type === "EDITOR_SELECTED") {
        setSelectedId(payload.id);
        setSelectedElement(payload);
      }

      if (payload.type === "CANVAS_ELEMENT_SELECTED") {
        const element = payload.element || payload;
        setSelectedId(element.id);
        setSelectedElement((prev: any) => ({
          ...prev,
          ...element,
          styles: prev?.id === element.id ? prev.styles : (element.styles || {})
        }));
      }

      if (payload.type === "EDITOR_CLEARED") {
        setSelectedId(null);
        setSelectedElement(null);
      }

      if (payload.type === "EDITOR_CONTENT") {
        if (payload.path) {
          setContentDraft(payload.path, payload.value);
        } else if (payload.id) {
          setContentEdit(payload.id, payload.kind || "text", payload.value);
        }
        setSelectedElement((prev: any) =>
          prev && prev.id === payload.id ? { ...prev, content: payload.value } : prev
        );
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [overrides, drafts, contentEdits]);

  const handleStyleChange = (prop: string, val: string) => {
    if (selectedId) {
      setOverride(selectedId, prop, val);
    }
  };

  const applyTextGradient = (gradient: string) => {
    if (!selectedId) return;
    if (gradient) {
      // Apply linear text gradient rules
      setOverride(selectedId, "background", gradient);
      setOverride(selectedId, "-webkit-background-clip", "text");
      setOverride(selectedId, "-webkit-text-fill-color", "transparent");
      setOverride(selectedId, "background-clip", "text");
      setOverride(selectedId, "display", "inline-block");
    } else {
      setOverride(selectedId, "background", "");
      setOverride(selectedId, "-webkit-background-clip", "");
      setOverride(selectedId, "-webkit-text-fill-color", "");
      setOverride(selectedId, "background-clip", "");
      setOverride(selectedId, "display", "");
    }
  };

  // Text edits — works for EVERY element: settings-backed ones save to
  // their settings path, everything else saves as a direct content edit.
  const handleContentChange = (val: string) => {
    if (!selectedElement) return;
    if (selectedElement.path) {
      setContentDraft(selectedElement.path, val);
    } else if (selectedId) {
      setContentEdit(selectedId, selectedElement.kind || "text", val);
    }
    setSelectedElement((prev: any) => ({ ...prev, content: val }));
    applyLive(selectedId, "text", val);
  };

  // Image / video source edits (URL or upload)
  const handleMediaChange = (val: string) => {
    if (!selectedElement) return;
    const kind = selectedElement.kind === "video" ? "video" : "image";
    if (selectedElement.path) {
      setContentDraft(selectedElement.path, val);
    } else if (selectedId) {
      setContentEdit(selectedId, kind, val);
    }
    setSelectedElement((prev: any) => ({ ...prev, src: val, content: val }));
    applyLive(selectedId, kind, val);
  };

  // Uploads to the public `media` storage bucket (same one the Media
  // Library / admin image fields use) and applies the public URL.
  const handleMediaUpload = async (file: File) => {
    setUploading(true);
    try {
      const name = `canvas/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("media").upload(name, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("media").getPublicUrl(name);
      if (data?.publicUrl) handleMediaChange(data.publicUrl);
    } catch (e: any) {
      alert(`Upload failed: ${e.message || e}`);
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const res = await publish();
    setIsPublishing(false);
    if (res.success) {
      alert("Changes published successfully!");
    } else {
      alert(`Error publishing changes: ${res.error}`);
    }
  };

  const getWidthClass = () => {
    switch (device) {
      case "mobile": return "w-[390px]";
      case "tablet": return "w-[768px]";
      case "laptop": return "w-[1024px]";
      case "desktop": return "w-full";
      case "custom": return `w-[${customWidth}px]`;
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-slate-100">
      
      {/* Visual Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Control Toolbar */}
        <div className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-xs uppercase text-slate-400 font-bold">Visual UI Studio</span>
          </div>

          {/* Responsive device frames */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded transition-colors ${device === "desktop" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice("laptop")}
              className={`p-1.5 rounded transition-colors ${device === "laptop" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Laptop className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice("tablet")}
              className={`p-1.5 rounded transition-colors ${device === "tablet" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded transition-colors ${device === "mobile" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              disabled={past.length === 0}
              className="p-2 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              onClick={redo}
              disabled={future.length === 0}
              className="p-2 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Redo className="h-4 w-4" />
            </button>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="ml-2 flex items-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 text-xs font-bold uppercase transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              {isPublishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>

        {/* Iframe Viewports */}
        <div className="flex-1 bg-slate-900 p-6 flex justify-center overflow-auto items-start">
          <div className={`h-full border border-slate-800 bg-white rounded-xl shadow-2xl transition-all duration-300 ${getWidthClass()} overflow-hidden`}>
            <iframe
              ref={iframeRef}
              src="/?preview=1"
              className="w-full h-full border-none bg-white"
              title="Visual Workspace Canvas"
            />
          </div>
        </div>
      </div>

      {/* Editor Inspector Panel Sidebar (Right side) */}
      <aside className="w-80 border-l border-slate-800 bg-slate-950 flex flex-col flex-shrink-0">
        {selectedElement ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-teal-500 font-bold uppercase">
                  {selectedElement.kind || "element"}
                </span>
                <h3 className="font-bold text-sm text-slate-100">{selectedElement.name || "Selected Element"}</h3>
              </div>
              <button
                onClick={() => {
                  if (selectedId) resetOverride(selectedId);
                }}
                className="text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-900/40 rounded px-2 py-1 hover:bg-red-900 hover:text-white transition-all cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Sidebar Tabs */}
            <div className="grid grid-cols-5 border-b border-slate-800 text-center font-mono text-[9px] uppercase font-bold text-slate-400">
              <button
                onClick={() => setActiveTab("content")}
                className={`py-2.5 border-r border-slate-800 ${activeTab === "content" ? "bg-slate-900 text-teal-400 border-b-2 border-b-teal-500" : ""}`}
              >
                Content
              </button>
              <button
                onClick={() => setActiveTab("type")}
                className={`py-2.5 border-r border-slate-800 ${activeTab === "type" ? "bg-slate-900 text-teal-400 border-b-2 border-b-teal-500" : ""}`}
              >
                Type
              </button>
              <button
                onClick={() => setActiveTab("layout")}
                className={`py-2.5 border-r border-slate-800 ${activeTab === "layout" ? "bg-slate-900 text-teal-400 border-b-2 border-b-teal-500" : ""}`}
              >
                Layout
              </button>
              <button
                onClick={() => setActiveTab("style")}
                className={`py-2.5 border-r border-slate-800 ${activeTab === "style" ? "bg-slate-900 text-teal-400 border-b-2 border-b-teal-500" : ""}`}
              >
                Style
              </button>
              <button
                onClick={() => setActiveTab("effects")}
                className={`py-2.5 ${activeTab === "effects" ? "bg-slate-900 text-teal-400 border-b-2 border-b-teal-500" : ""}`}
              >
                Effects
              </button>
            </div>

            {/* Tab Panels */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              
              {/* Content Panel */}
              {activeTab === "content" && (
                <div className="space-y-4">
                  {/* Visibility toggle — available for every element */}
                  <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-2.5">
                    <span className="text-xs text-slate-400 font-medium font-mono">Visibility</span>
                    <button
                      type="button"
                      onClick={() => {
                        const isHidden = overrides[selectedId || ""]?.["display"] === "none";
                        handleStyleChange("display", isHidden ? "" : "none");
                      }}
                      className={`p-1 rounded transition-colors ${overrides[selectedId || ""]?.["display"] === "none" ? "text-red-400 hover:text-red-300 bg-red-950/20" : "text-slate-400 hover:text-white"}`}
                      title={overrides[selectedId || ""]?.["display"] === "none" ? "Show Element" : "Hide Element"}
                    >
                      {overrides[selectedId || ""]?.["display"] === "none" ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {(selectedElement.kind === "image" || selectedElement.kind === "video" || selectedElement.kind === "logo") ? (
                    /* ── Image / Video / Logo editor ── */
                    <div className="space-y-3">
                      <label className="text-xs text-slate-400 font-medium">
                        {selectedElement.kind === "video" ? "Video Source" : "Image Source"}
                      </label>

                      {/* Live preview */}
                      <div className="rounded-lg border border-slate-800 bg-slate-900 overflow-hidden">
                        {selectedElement.kind === "video" ? (
                          (selectedElement.src || selectedElement.content) ? (
                            <video
                              key={selectedElement.src || selectedElement.content}
                              src={selectedElement.src || selectedElement.content}
                              muted
                              loop
                              autoPlay
                              playsInline
                              className="w-full h-28 object-cover"
                            />
                          ) : (
                            <div className="h-28 flex items-center justify-center text-[11px] text-slate-500">No video source</div>
                          )
                        ) : (selectedElement.src || selectedElement.content) ? (
                          <img
                            src={selectedElement.src || selectedElement.content}
                            alt="preview"
                            className="w-full h-28 object-contain bg-slate-950"
                          />
                        ) : (
                          <div className="h-28 flex items-center justify-center text-[11px] text-slate-500">No image source</div>
                        )}
                      </div>

                      {/* URL input */}
                      <input
                        type="text"
                        value={selectedElement.src || selectedElement.content || ""}
                        onChange={(e) => handleMediaChange(e.target.value)}
                        placeholder={selectedElement.kind === "video" ? "Video URL (.mp4)" : "Image URL"}
                        className="w-full rounded bg-slate-900 border border-slate-800 text-slate-100 p-2.5 text-xs focus:border-teal-500 focus:outline-none"
                      />

                      {/* Upload */}
                      <label className={`flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-700 bg-slate-900 hover:bg-slate-800 hover:border-teal-500 text-slate-300 px-3 py-2.5 text-xs font-medium cursor-pointer transition-colors ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        {uploading
                          ? "Uploading..."
                          : selectedElement.kind === "video" ? "Upload new video" : "Upload new image"}
                        <input
                          type="file"
                          accept={selectedElement.kind === "video" ? "video/*" : "image/*"}
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleMediaUpload(f);
                            e.target.value = "";
                          }}
                        />
                      </label>

                      {selectedElement.path === "branding.logo" && (
                        <p className="text-[11px] text-slate-500 italic leading-relaxed">
                          This is your site logo — changing it updates the navbar, footer and favicon everywhere.
                        </p>
                      )}
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        Changes preview instantly. Click <b>Publish</b> to make them live on the site.
                      </p>
                    </div>
                  ) : (
                    /* ── Text editor — works for every text element ── */
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-medium">Text Content</label>
                      <textarea
                        value={selectedElement.content || ""}
                        onChange={(e) => handleContentChange(e.target.value)}
                        className="w-full h-32 rounded bg-slate-900 border border-slate-800 text-slate-100 p-2.5 text-xs focus:border-teal-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-600 leading-relaxed">
                        Tip: you can also double-click any text directly on the canvas to type inline.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Typography Panel */}
              {activeTab === "type" && (
                <div className="space-y-4 text-xs">
                  {/* Font Family */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-medium">Font Family</label>
                    <select
                      value={selectedElement.styles["font-family"]?.split(",")[0].replace(/['"]/g, "") || ""}
                      onChange={(e) => handleStyleChange("font-family", e.target.value)}
                      className="w-full rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500 focus:outline-none"
                    >
                      <option value="">Default Inherit</option>
                      {Object.entries(FONT_CATEGORIES).map(([cat, list]) => (
                        <optgroup key={cat} label={cat}>
                          {list.map((font) => (
                            <option key={font} value={font}>{font}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Size and Weight */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-slate-400 font-medium">Font Size</label>
                      <input
                        type="text"
                        placeholder="16px"
                        value={overrides[selectedId]?.["font-size"] || ""}
                        onChange={(e) => handleStyleChange("font-size", e.target.value)}
                        className="w-full rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-400 font-medium">Font Weight</label>
                      <select
                        value={overrides[selectedId]?.["font-weight"] || ""}
                        onChange={(e) => handleStyleChange("font-weight", e.target.value)}
                        className="w-full rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500 focus:outline-none"
                      >
                        <option value="">Default</option>
                        {["300", "400", "500", "600", "700", "800", "900"].map((w) => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Text Align */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-medium">Text Align</label>
                    <div className="grid grid-cols-4 gap-1 bg-slate-900 border border-slate-800 rounded p-1 text-center">
                      <button
                        onClick={() => handleStyleChange("text-align", "left")}
                        className={`p-1.5 rounded ${overrides[selectedId]?.["text-align"] === "left" ? "bg-teal-600 text-white" : "text-slate-400"}`}
                      >
                        <AlignLeft className="h-3.5 w-3.5 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleStyleChange("text-align", "center")}
                        className={`p-1.5 rounded ${overrides[selectedId]?.["text-align"] === "center" ? "bg-teal-600 text-white" : "text-slate-400"}`}
                      >
                        <AlignCenter className="h-3.5 w-3.5 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleStyleChange("text-align", "right")}
                        className={`p-1.5 rounded ${overrides[selectedId]?.["text-align"] === "right" ? "bg-teal-600 text-white" : "text-slate-400"}`}
                      >
                        <AlignRight className="h-3.5 w-3.5 mx-auto" />
                      </button>
                      <button
                        onClick={() => handleStyleChange("text-align", "justify")}
                        className={`p-1.5 rounded ${overrides[selectedId]?.["text-align"] === "justify" ? "bg-teal-600 text-white" : "text-slate-400"}`}
                      >
                        <AlignJustify className="h-3.5 w-3.5 mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-medium">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={overrides[selectedId]?.["color"] || "#000000"}
                        onChange={(e) => handleStyleChange("color", e.target.value)}
                        className="w-10 h-8 rounded border border-slate-800 bg-transparent p-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="#ffffff"
                        value={overrides[selectedId]?.["color"] || ""}
                        onChange={(e) => handleStyleChange("color", e.target.value)}
                        className="flex-1 rounded bg-slate-900 border border-slate-800 text-slate-100 px-2.5 py-1 text-xs focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Layout Panel */}
              {activeTab === "layout" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <label className="text-slate-400 font-medium">Padding (px / rem)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Top"
                        value={overrides[selectedId]?.["padding-top"] || ""}
                        onChange={(e) => handleStyleChange("padding-top", e.target.value)}
                        className="rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Right"
                        value={overrides[selectedId]?.["padding-right"] || ""}
                        onChange={(e) => handleStyleChange("padding-right", e.target.value)}
                        className="rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Bottom"
                        value={overrides[selectedId]?.["padding-bottom"] || ""}
                        onChange={(e) => handleStyleChange("padding-bottom", e.target.value)}
                        className="rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Left"
                        value={overrides[selectedId]?.["padding-left"] || ""}
                        onChange={(e) => handleStyleChange("padding-left", e.target.value)}
                        className="rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-slate-400 font-medium">Margin (px / rem / auto)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Top"
                        value={overrides[selectedId]?.["margin-top"] || ""}
                        onChange={(e) => handleStyleChange("margin-top", e.target.value)}
                        className="rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Right"
                        value={overrides[selectedId]?.["margin-right"] || ""}
                        onChange={(e) => handleStyleChange("margin-right", e.target.value)}
                        className="rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Bottom"
                        value={overrides[selectedId]?.["margin-bottom"] || ""}
                        onChange={(e) => handleStyleChange("margin-bottom", e.target.value)}
                        className="rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500"
                      />
                      <input
                        type="text"
                        placeholder="Left"
                        value={overrides[selectedId]?.["margin-left"] || ""}
                        onChange={(e) => handleStyleChange("margin-left", e.target.value)}
                        className="rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Style Panel */}
              {activeTab === "style" && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <label className="text-slate-400 font-medium">Background Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={overrides[selectedId]?.["background-color"] || "#ffffff"}
                        onChange={(e) => handleStyleChange("background-color", e.target.value)}
                        className="w-10 h-8 rounded border border-slate-800 bg-transparent p-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="#ffffff"
                        value={overrides[selectedId]?.["background-color"] || ""}
                        onChange={(e) => handleStyleChange("background-color", e.target.value)}
                        className="flex-1 rounded bg-slate-900 border border-slate-800 text-slate-100 px-2.5 py-1 text-xs focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-slate-400 font-medium">Border Radius</label>
                    <input
                      type="text"
                      placeholder="8px / 50%"
                      value={overrides[selectedId]?.["border-radius"] || ""}
                      onChange={(e) => handleStyleChange("border-radius", e.target.value)}
                      className="w-full rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-slate-400 font-medium">Border Width</label>
                      <input
                        type="text"
                        placeholder="1px"
                        value={overrides[selectedId]?.["border-width"] || ""}
                        onChange={(e) => handleStyleChange("border-width", e.target.value)}
                        className="w-full rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-slate-400 font-medium">Border Color</label>
                      <input
                        type="text"
                        placeholder="#000000"
                        value={overrides[selectedId]?.["border-color"] || ""}
                        onChange={(e) => handleStyleChange("border-color", e.target.value)}
                        className="w-full rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Effects & Award Font Typography Panel */}
              {activeTab === "effects" && (
                <div className="space-y-4 text-xs">
                  {/* Text Gradient Presets */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-medium flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                      Award Text Gradient
                    </label>
                    <select
                      onChange={(e) => applyTextGradient(e.target.value)}
                      className="w-full rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500 focus:outline-none"
                    >
                      {GRADIENT_PRESETS.map((preset) => (
                        <option key={preset.name} value={preset.value}>{preset.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Text Glow and 3D shadows */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-medium">Glow / Retro 3D Shadow</label>
                    <select
                      onChange={(e) => handleStyleChange("text-shadow", e.target.value)}
                      className="w-full rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 focus:border-teal-500 focus:outline-none"
                    >
                      {GLOW_PRESETS.map((preset) => (
                        <option key={preset.name} value={preset.value}>{preset.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Letter Spacing */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-medium">Letter Spacing (tracking)</label>
                    <div className="flex gap-2">
                      <input
                        type="range"
                        min="-0.05"
                        max="0.25"
                        step="0.01"
                        value={parseFloat(overrides[selectedId]?.["letter-spacing"] || "0")}
                        onChange={(e) => handleStyleChange("letter-spacing", `${e.target.value}em`)}
                        className="flex-1 accent-teal-500"
                      />
                      <span className="font-mono w-10 text-right">{overrides[selectedId]?.["letter-spacing"] || "0em"}</span>
                    </div>
                  </div>

                  {/* Text Case Transformation */}
                  <div className="space-y-2">
                    <label className="text-slate-400 font-medium">Text Case</label>
                    <div className="grid grid-cols-3 gap-1 bg-slate-900 border border-slate-800 rounded p-1 text-center font-mono">
                      <button
                        onClick={() => handleStyleChange("text-transform", "uppercase")}
                        className={`py-1 rounded text-[10px] ${overrides[selectedId]?.["text-transform"] === "uppercase" ? "bg-teal-600 text-white font-bold" : "text-slate-400"}`}
                      >
                        ABC
                      </button>
                      <button
                        onClick={() => handleStyleChange("text-transform", "lowercase")}
                        className={`py-1 rounded text-[10px] ${overrides[selectedId]?.["text-transform"] === "lowercase" ? "bg-teal-600 text-white font-bold" : "text-slate-400"}`}
                      >
                        abc
                      </button>
                      <button
                        onClick={() => handleStyleChange("text-transform", "capitalize")}
                        className={`py-1 rounded text-[10px] ${overrides[selectedId]?.["text-transform"] === "capitalize" ? "bg-teal-600 text-white font-bold" : "text-slate-400"}`}
                      >
                        Abc
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-800 shrink-0">
              <span className="text-[10px] font-mono text-teal-500 font-bold uppercase">PAGE STRUCTURE</span>
              <h3 className="font-bold text-sm text-slate-100 mt-0.5">Section Layouts</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                Reorder, hide, or show standard sections on the homepage.
              </p>
            </div>

            {/* Layout List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {sectionsList.map((sect: any, index: number) => {
                const isVisible = sect.visible !== false;
                return (
                  <div 
                    key={sect.id} 
                    className="flex items-center justify-between bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-600">#{index + 1}</span>
                      <span className={`text-xs font-semibold font-mono ${isVisible ? "text-slate-200" : "text-slate-500 line-through"}`}>
                        {sect.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Hide/Show Toggle */}
                      <button
                        onClick={() => toggleSectionVisibility(index)}
                        className={`p-1.5 rounded transition-colors ${isVisible ? "text-slate-400 hover:text-white" : "text-red-400 hover:text-red-300 bg-red-950/20"}`}
                        title={isVisible ? "Hide Section" : "Show Section"}
                      >
                        {isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </button>

                      {/* Move Up */}
                      <button
                        onClick={() => moveSection(index, "up")}
                        disabled={index === 0}
                        className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>

                      {/* Move Down */}
                      <button
                        onClick={() => moveSection(index, "down")}
                        disabled={index === sectionsList.length - 1}
                        className="p-1.5 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Quick Tips */}
            <div className="p-4 border-t border-slate-900 bg-slate-950/50 text-[10px] text-slate-500 leading-relaxed font-mono shrink-0">
              ⚡ Hint: Click any section title or text block in the live preview iframe to customize its individual typography, background, gradients, borders, and margins directly.
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
