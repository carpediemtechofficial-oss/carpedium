import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, CheckCircle2 } from "lucide-react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEYS,
  type SiteSettings,
} from "@/hooks/useSettings";
import Studio from "./Studio";
import Canvas from "./Canvas";

type SettingsRow = { key: string; value: Record<string, string> };

// Human labels + input hints for each field, grouped by section.
const SECTIONS: {
  key: keyof SiteSettings;
  title: string;
  description: string;
  fields: { name: string; label: string; type?: "text" | "color" | "textarea" }[];
}[] = [
  {
    key: "branding",
    title: "Branding",
    description: "Logo, favicon, brand name and colors.",
    fields: [
      { name: "brandName", label: "Brand Name" },
      { name: "logo", label: "Logo URL" },
      { name: "favicon", label: "Favicon URL" },
      { name: "primaryColor", label: "Primary Color", type: "color" },
      { name: "primaryLight", label: "Primary Light", type: "color" },
      { name: "primaryStrong", label: "Primary Strong", type: "color" },
    ],
  },
  {
    key: "contact",
    title: "Contact Info",
    description: "How learners reach you.",
    fields: [
      { name: "email", label: "Email" },
      { name: "phone", label: "Phone (display)" },
      { name: "whatsapp", label: "WhatsApp Number (digits only)" },
      { name: "address", label: "Address" },
    ],
  },
  {
    key: "social",
    title: "Social Links",
    description: "Full profile URLs. Leave blank to hide.",
    fields: [
      { name: "linkedin", label: "LinkedIn" },
      { name: "github", label: "GitHub" },
      { name: "twitter", label: "Twitter / X" },
      { name: "instagram", label: "Instagram" },
      { name: "youtube", label: "YouTube" },
    ],
  },
  {
    key: "footer",
    title: "Footer",
    description: "Footer tagline and copyright.",
    fields: [
      { name: "tagline", label: "Tagline" },
      { name: "copyright", label: "Copyright Text" },
    ],
  },
  {
    key: "hero",
    title: "Hero Content",
    description: "Homepage hero headline and subtext.",
    fields: [
      { name: "eyebrow", label: "Eyebrow" },
      { name: "title", label: "Title" },
      { name: "subtitle", label: "Subtitle", type: "textarea" },
    ],
  },
  {
    key: "stats",
    title: "Statistics",
    description: "Headline numbers shown across the site.",
    fields: [
      { name: "courses", label: "Courses" },
      { name: "students", label: "Students" },
      { name: "rating", label: "Avg. Rating" },
      { name: "placement", label: "Placement Rate" },
    ],
  },
  {
    key: "seo",
    title: "SEO",
    description: "Document title, meta description and keywords.",
    fields: [
      { name: "title", label: "Meta Title" },
      { name: "description", label: "Meta Description", type: "textarea" },
      { name: "keywords", label: "Meta Keywords" },
    ],
  },
];

export default function SettingsManager() {
  const [viewMode, setViewMode] = useState<"general" | "studio" | "canvas">("general");
  const [draft, setDraft] = useState<SiteSettings>(structuredClone(DEFAULT_SETTINGS));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("key, value");
      if (error) throw error;
      return data as SettingsRow[];
    },
  });

  // Populate the draft with defaults overlaid by any saved values.
  useEffect(() => {
    const merged = structuredClone(DEFAULT_SETTINGS);
    for (const row of data ?? []) {
      if (row.key in merged && row.value && typeof row.value === "object") {
        Object.assign(merged[row.key as keyof SiteSettings] as Record<string, unknown>, row.value);
      }
    }
    setDraft(merged);
  }, [data]);

  const updateField = (section: keyof SiteSettings, name: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [section]: { ...(prev[section] as Record<string, string>), [name]: value },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const rows = SETTINGS_KEYS.map((key) => ({ key, value: draft[key] }));
      const { error } = await supabase.from("settings").upsert(rows, { onConflict: "key" });
      if (error) throw error;
      setSaved(true);
      refetch();
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-sm font-semibold mb-6">
        <button
          onClick={() => setViewMode("general")}
          className={`pb-3 transition-colors ${viewMode === "general" ? "border-b-2 border-teal-600 text-teal-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}
        >
          General Settings
        </button>
        <button
          onClick={() => setViewMode("studio")}
          className={`pb-3 transition-colors ${viewMode === "studio" ? "border-b-2 border-teal-600 text-teal-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}
        >
          Theme Studio
        </button>
        <button
          onClick={() => setViewMode("canvas")}
          className={`pb-3 transition-colors ${viewMode === "canvas" ? "border-b-2 border-teal-600 text-teal-600 font-bold" : "text-slate-500 hover:text-slate-800"}`}
        >
          Visual Canvas Editor
        </button>
      </div>

      {viewMode === "studio" && <Studio />}
      {viewMode === "canvas" && <Canvas />}

      {viewMode === "general" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold font-display text-slate-900">Website Settings</h2>
              <p className="text-sm text-slate-500 mt-1">
                Changes apply live across the site the moment you save.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-teal-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : saved ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {saved ? "Saved" : "Save Changes"}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>
          )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SECTIONS.map((section) => (
          <div
            key={section.key}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4"
          >
            <div>
              <h3 className="font-bold font-display text-slate-900">{section.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
            </div>

            <div className="space-y-3">
              {section.fields.map((field) => {
                const value =
                  (draft[section.key] as Record<string, string>)[field.name] ?? "";
                return (
                  <div key={field.name} className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">{field.label}</label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={value}
                        rows={2}
                        onChange={(e) => updateField(section.key, field.name, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 outline-none resize-y"
                      />
                    ) : field.type === "color" ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={value}
                          onChange={(e) => updateField(section.key, field.name, e.target.value)}
                          className="h-9 w-12 rounded border border-slate-200 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updateField(section.key, field.name, e.target.value)}
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono focus:border-teal-500 outline-none"
                        />
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateField(section.key, field.name, e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 outline-none"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}
