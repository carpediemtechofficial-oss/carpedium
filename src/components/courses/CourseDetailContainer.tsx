"use client";
import { Loader2 } from "lucide-react";
import { type Course } from "@/data/courses";
import { usePublishedCourses } from "@/hooks/useContent";
import CourseDetailPage from "@/components/courses/CourseDetailPage";

type CourseDetailContainerProps = {
  slug: string;
  onEnroll: (course: Course) => void;
  onBack: () => void;
  onBackHome: () => void;
};

// Resolves the detail course from the live Supabase catalog by slug, so
// course pages reflect Admin edits/deletes in realtime.
export default function CourseDetailContainer({
  slug,
  onEnroll,
  onBack,
  onBackHome,
}: CourseDetailContainerProps) {
  const { courses, isLoading } = usePublishedCourses();
  const course = courses.find((c) => c.slug === slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-display text-2xl font-bold text-slate-800">Course not found</p>
        <p className="text-sm text-slate-500">This course may have been unpublished or removed.</p>
        <button
          type="button"
          onClick={onBack}
          className="rounded-full bg-primary px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <CourseDetailPage course={course} onEnroll={onEnroll} onBack={onBack} onBackHome={onBackHome} />
  );
}
