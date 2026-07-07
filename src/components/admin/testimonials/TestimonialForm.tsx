import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/supabase";
import ImageUploadField from "@/components/admin/ImageUploadField";

type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];

type TestimonialFormProps = {
  initialData?: TestimonialRow;
  onSuccess: () => void;
  onCancel: () => void;
};

const input =
  "w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-teal-500 outline-none";

export default function TestimonialForm({ initialData, onSuccess, onCancel }: TestimonialFormProps) {
  const [form, setForm] = useState({
    student_name: initialData?.student_name ?? "",
    course: initialData?.course ?? "",
    company: initialData?.company ?? "",
    job_role: initialData?.job_role ?? "",
    rating: initialData?.rating ?? 5,
    review: initialData?.review ?? "",
    photo: initialData?.photo ?? "",
    video_testimonial: initialData?.video_testimonial ?? "",
    linkedin: initialData?.linkedin ?? "",
    featured: initialData?.featured ?? false,
    status: initialData?.status ?? "published",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.student_name.trim() || !form.review.trim()) {
      setError("Student name and review are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = { ...form, rating: Number(form.rating) || 5 };
      if (initialData?.id) {
        const { error } = await supabase.from("testimonials").update(payload).eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("testimonials").insert(payload);
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save testimonial.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold font-display">{initialData ? "Edit Testimonial" : "Add Testimonial"}</h3>
        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-900 font-medium">
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUploadField label="Student Photo" value={form.photo} onChange={(url) => set("photo", url)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Student Name *</label>
            <input className={input} value={form.student_name} onChange={(e) => set("student_name", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Course</label>
            <input className={input} value={form.course} onChange={(e) => set("course", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Company</label>
            <input className={input} value={form.company} onChange={(e) => set("company", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Job Role</label>
            <input className={input} value={form.job_role} onChange={(e) => set("job_role", e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Review *</label>
          <textarea className={input} rows={4} value={form.review} onChange={(e) => set("review", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Rating</label>
            <select className={input} value={form.rating} onChange={(e) => set("rating", e.target.value)}>
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>
                  {r} Star{r > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">LinkedIn URL</label>
            <input className={input} value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Video Testimonial URL</label>
          <input className={input} value={form.video_testimonial} onChange={(e) => set("video_testimonial", e.target.value)} />
        </div>

        <div className="flex items-center gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.status === "published"} onChange={(e) => set("status", e.target.checked ? "published" : "draft")} className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
            Published (visible on site)
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Testimonial
          </button>
        </div>
      </form>
    </div>
  );
}
