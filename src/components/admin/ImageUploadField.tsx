import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, UploadCloud, X, FileText } from "lucide-react";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  /** File types allowed by the picker. Defaults to images only. */
  accept?: string;
};

// Uploads an image to the public `media` storage bucket and returns its
// public URL. The saved URL is what the live site renders, so a new
// upload reflects on the frontend as soon as the record is saved.
export default function ImageUploadField({ label, value, onChange, accept = "image/*" }: ImageUploadFieldProps) {
  const isImage = /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const ext = file.name.split(".").pop();
      const name = `${Math.random().toString(36).slice(2)}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("media").upload(name, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("media").getPublicUrl(name);
      onChange(data.publicUrl);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
          {value && isImage ? (
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : value ? (
            <a href={value} target="_blank" rel="noopener noreferrer" title="Open file">
              <FileText className="h-6 w-6 text-teal-500" />
            </a>
          ) : (
            <UploadCloud className="h-5 w-5 text-slate-300" />
          )}
        </div>
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL or upload"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-teal-500 outline-none"
          />
          <div className="flex items-center gap-2">
            <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="hidden" />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
              {uploading ? "Uploading..." : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" /> Clear
              </button>
            )}
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
}
