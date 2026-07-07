import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/supabase";
import ImageUploadField from "@/components/admin/ImageUploadField";

type CourseRow = Database["public"]["Tables"]["courses"]["Row"];

type CourseFormProps = {
  initialData?: CourseRow;
  onSuccess: () => void;
  onCancel: () => void;
};

const input =
  "w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-teal-500 outline-none";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function CourseForm({ initialData, onSuccess, onCancel }: CourseFormProps) {
  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    category: initialData?.category ?? "",
    price: initialData?.price ?? "",
    discount_price: initialData?.discount_price ?? "",
    description: initialData?.description ?? "",
    long_description: initialData?.long_description ?? "",
    duration: initialData?.duration ?? "",
    difficulty: initialData?.difficulty ?? "Intermediate",
    instructor: initialData?.instructor ?? "",
    course_image: initialData?.course_image ?? "",
    rating: initialData?.rating ?? 5,
    students_enrolled: initialData?.students_enrolled ?? 0,
    tools_covered: (initialData?.tools_covered ?? []).join(", "),
    is_published: initialData?.is_published ?? false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleTitle = (value: string) => {
    setForm((f) => ({
      ...f,
      title: value,
      // auto-fill slug for new courses until the user overrides it
      slug: !initialData && (f.slug === "" || f.slug === slugify(f.title)) ? slugify(value) : f.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.slug.trim() || !form.category.trim()) {
      setError("Title, slug and category are required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        title: form.title,
        slug: form.slug,
        category: form.category,
        price: form.price,
        discount_price: form.discount_price,
        description: form.description,
        long_description: form.long_description,
        duration: form.duration,
        difficulty: form.difficulty,
        instructor: form.instructor,
        course_image: form.course_image,
        rating: Number(form.rating) || 0,
        students_enrolled: Number(form.students_enrolled) || 0,
        tools_covered: form.tools_covered
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        is_published: form.is_published,
        status: form.is_published ? "published" : "draft",
      };

      if (initialData?.id) {
        const { error } = await supabase.from("courses").update(payload).eq("id", initialData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert(payload);
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to save course.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold font-display">{initialData ? "Edit Course" : "Add New Course"}</h3>
        <button onClick={onCancel} className="text-sm text-slate-500 hover:text-slate-900 font-medium">
          Cancel
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <ImageUploadField label="Course Image" value={form.course_image} onChange={(url) => set("course_image", url)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Course Title *</label>
            <input className={input} value={form.title} onChange={(e) => handleTitle(e.target.value)} placeholder="e.g. Advanced Full-Stack Development" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">URL Slug *</label>
            <input className={input} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="e.g. advanced-full-stack" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Category *</label>
            <select className={`${input} bg-white`} value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Select a category</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Artificial Intelligence">Artificial Intelligence</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Product Design">Product Design</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Difficulty</label>
            <select className={`${input} bg-white`} value={form.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Price</label>
            <input className={input} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="₹25,000" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Original / Strike Price</label>
            <input className={input} value={form.discount_price} onChange={(e) => set("discount_price", e.target.value)} placeholder="₹40,000" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Duration</label>
            <input className={input} value={form.duration} onChange={(e) => set("duration", e.target.value)} placeholder="16 Weeks" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Instructor</label>
            <input className={input} value={form.instructor} onChange={(e) => set("instructor", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Rating</label>
            <input type="number" step="0.1" min="0" max="5" className={input} value={form.rating} onChange={(e) => set("rating", e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Students Enrolled</label>
            <input type="number" min="0" className={input} value={form.students_enrolled} onChange={(e) => set("students_enrolled", e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Tools / Skills Covered (comma separated)</label>
          <input className={input} value={form.tools_covered} onChange={(e) => set("tools_covered", e.target.value)} placeholder="React, Node.js, AWS" />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Short Description</label>
          <textarea className={input} rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief overview of the course..." />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Long Description</label>
          <textarea className={input} rows={4} value={form.long_description} onChange={(e) => set("long_description", e.target.value)} />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="is_published"
            checked={form.is_published}
            onChange={(e) => set("is_published", e.target.checked)}
            className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
          />
          <label htmlFor="is_published" className="text-sm font-medium text-slate-700 cursor-pointer">
            Publish immediately (visible on site)
          </label>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save Course
          </button>
        </div>
      </form>
    </div>
  );
}
