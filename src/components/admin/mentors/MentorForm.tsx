import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/supabase";
import ImageUploadField from "@/components/admin/ImageUploadField";

type MentorRow = Database["public"]["Tables"]["mentors"]["Row"];

type MentorFormProps = {
  initialData?: MentorRow;
  onSuccess: () => void;
  onCancel: () => void;
};

const input =
  "w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-teal-500 outline-none";

export default function MentorForm({ initialData, onSuccess, onCancel }: MentorFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    designation: initialData?.designation ?? "",
    company: initialData?.company ?? "",
    experience: initialData?.experience ?? "",
    bio: initialData?.bio ?? "",
    linkedin: initialData?.linkedin ?? "",
    github: initialData?.github ?? "",
    twitter: initialData?.twitter ?? "",
    website: initialData?.website ?? "",
    skills: (initialData?.skills ?? []).join(", "),
    profile_image: initialData?.profile_image ?? "",
    display_order: initialData?.display_order ?? 0,
    featured_toggle: initialData?.featured_toggle ?? false,
    status: initialData?.status ?? "active",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        skills: form.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        display_order: Number(form.display_order) || 0,
      };
      if (initialData?.id) {
        const { error } = await supabase.from("mentors").update(payload).eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("mentors").insert(payload);
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save mentor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold font-display">{initialData ? "Edit Mentor" : "Add Mentor"}</h3>
        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-900 font-medium">
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUploadField
          label="Profile Image"
          value={form.profile_image}
          onChange={(url) => set("profile_image", url)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Name *</label>
            <input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Designation</label>
            <input className={input} value={form.designation} onChange={(e) => set("designation", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Company</label>
            <input className={input} value={form.company} onChange={(e) => set("company", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Experience</label>
            <input className={input} value={form.experience} onChange={(e) => set("experience", e.target.value)} placeholder="e.g. 8+ years" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Bio</label>
          <textarea className={input} rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Skills (comma separated)</label>
          <input className={input} value={form.skills} onChange={(e) => set("skills", e.target.value)} placeholder="React, Node.js, AWS" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">LinkedIn URL</label>
            <input className={input} value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">GitHub URL</label>
            <input className={input} value={form.github} onChange={(e) => set("github", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Twitter URL</label>
            <input className={input} value={form.twitter} onChange={(e) => set("twitter", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Website URL</label>
            <input className={input} value={form.website} onChange={(e) => set("website", e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Display Order</label>
            <input type="number" className={input} value={form.display_order} onChange={(e) => set("display_order", e.target.value)} />
          </div>
          <div className="flex items-center gap-4 pb-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.featured_toggle} onChange={(e) => set("featured_toggle", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.status === "active"} onChange={(e) => set("status", e.target.checked ? "active" : "inactive")} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
              Active (visible on site)
            </label>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Mentor
          </button>
        </div>
      </form>
    </div>
  );
}
