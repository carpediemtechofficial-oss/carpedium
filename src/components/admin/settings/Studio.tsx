"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSettings } from "@/hooks/useSettings";
import { FONT_CATEGORIES } from "@/editor/fonts";
import { Monitor, Smartphone, Save, RefreshCw } from "lucide-react";

export default function Studio() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { settings, isLoading } = useSettings();

  // Local state for layout variables
  const [primaryColor, setPrimaryColor] = useState("#14b8a6");
  const [primaryLight, setPrimaryLight] = useState("#2dd4bf");
  const [primaryStrong, setPrimaryStrong] = useState("#0f766e");
  const [headingFont, setHeadingFont] = useState("Inter");
  const [bodyFont, setBodyFont] = useState("Inter");
  
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setPrimaryColor(settings.branding.primaryColor || "#14b8a6");
      setPrimaryLight(settings.branding.primaryLight || "#2dd4bf");
      setPrimaryStrong(settings.branding.primaryStrong || "#0f766e");
    }
  }, [settings]);

  // Sync theme changes live to iframe using postMessage
  const postThemeToIframe = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "SYNC_THEME",
          theme: {
            primaryColor,
            primaryLight,
            primaryStrong,
            headingFont,
            bodyFont
          }
        },
        "*"
      );
    }
  };

  useEffect(() => {
    postThemeToIframe();
  }, [primaryColor, primaryLight, primaryStrong, headingFont, bodyFont]);

  // Setup ready handshake
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "THEME_STUDIO_READY") {
        postThemeToIframe();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [primaryColor, primaryLight, primaryStrong, headingFont, bodyFont]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Fetch current branding settings row
      const { data: current, error: fetchErr } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "branding")
        .single();

      let mergedValue = {
        primaryColor,
        primaryLight,
        primaryStrong
      };

      if (!fetchErr && current?.value) {
        mergedValue = { ...current.value, ...mergedValue };
      }

      const { error: saveErr } = await supabase
        .from("settings")
        .upsert({ key: "branding", value: mergedValue });

      if (saveErr) throw saveErr;

      // 2. Also inject global fonts CSS overrides
      const fontCss = `
        body { font-family: '${bodyFont}', sans-serif !important; }
        h1, h2, h3, h4, h5, h6, .font-display { font-family: '${headingFont}', sans-serif !important; }
      `;
      
      const { data: currentOverrides, error: fetchOverridesErr } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "editorOverrides")
        .single();

      let overridesObj: any = { overrides: {}, css: "" };
      if (!fetchOverridesErr && currentOverrides?.value) {
        overridesObj = currentOverrides.value;
      }
      overridesObj.css = (overridesObj.css || "") + "\n" + fontCss;

      const { error: overridesErr } = await supabase
        .from("settings")
        .upsert({ key: "editorOverrides", value: overridesObj });

      if (overridesErr) throw overridesErr;

      alert("Theme saved successfully!");
    } catch (e: any) {
      alert(`Save error: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs font-mono text-slate-400">Loading Theme Studio...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-140px)] border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-slate-100">
      
      {/* Sidebar Controls */}
      <aside className="w-80 border-r border-slate-800 bg-slate-950 p-6 flex flex-col justify-between flex-shrink-0 h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <div>
            <span className="text-[10px] font-mono text-teal-500 font-bold uppercase">GLOBAL LOOK & FEEL</span>
            <h3 className="font-bold text-sm text-slate-100 mt-1">Theme Studio</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Customize your branding colors and typography configurations across the public portal.
            </p>
          </div>

          {/* Color pickers */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Brand Colors</h4>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Primary Brand Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-8 rounded border border-slate-800 bg-transparent p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded bg-slate-900 border border-slate-800 text-slate-100 px-2.5 py-1 text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Primary Light Accent</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryLight}
                    onChange={(e) => setPrimaryLight(e.target.value)}
                    className="w-10 h-8 rounded border border-slate-800 bg-transparent p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryLight}
                    onChange={(e) => setPrimaryLight(e.target.value)}
                    className="flex-1 rounded bg-slate-900 border border-slate-800 text-slate-100 px-2.5 py-1 text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Primary Strong Accent</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryStrong}
                    onChange={(e) => setPrimaryStrong(e.target.value)}
                    className="w-10 h-8 rounded border border-slate-800 bg-transparent p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryStrong}
                    onChange={(e) => setPrimaryStrong(e.target.value)}
                    className="flex-1 rounded bg-slate-900 border border-slate-800 text-slate-100 px-2.5 py-1 text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Fonts typography */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Typography</h4>
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Heading Font Family</label>
                <select
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  className="w-full rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 text-xs focus:border-teal-500 focus:outline-none"
                >
                  {Object.entries(FONT_CATEGORIES).map(([cat, list]) => (
                    <optgroup key={cat} label={cat}>
                      {list.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Body Font Family</label>
                <select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  className="w-full rounded bg-slate-900 border border-slate-800 text-slate-100 p-2 text-xs focus:border-teal-500 focus:outline-none"
                >
                  {Object.entries(FONT_CATEGORIES).map(([cat, list]) => (
                    <optgroup key={cat} label={cat}>
                      {list.map((font) => (
                        <option key={font} value={font}>{font}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 text-xs font-bold uppercase transition-colors disabled:opacity-50 cursor-pointer shrink-0"
        >
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Theme"}
        </button>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Device frame header */}
        <div className="h-14 border-b border-slate-800 bg-slate-950 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setDevice("desktop")}
              className={`p-1.5 rounded transition-colors ${device === "desktop" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              onClick={() => setDevice("mobile")}
              className={`p-1.5 rounded transition-colors ${device === "mobile" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => {
              if (iframeRef.current) iframeRef.current.src = "/?preview=1";
            }}
            className="p-2 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            title="Reload Preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Iframe preview viewport container */}
        <div className="flex-1 bg-slate-900 p-6 flex justify-center overflow-auto items-start">
          <div className={`h-full border border-slate-800 bg-white rounded-xl shadow-2xl transition-all duration-300 ${device === "mobile" ? "w-[390px]" : "w-full"} overflow-hidden`}>
            <iframe
              ref={iframeRef}
              src="/?preview=1"
              className="w-full h-full border-none bg-white"
              title="Theme Studio Live Preview"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
