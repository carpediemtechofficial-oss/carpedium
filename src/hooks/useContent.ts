// ============================================================
// useContent — single source of truth for all public content.
//
// Every hook here reads directly from Supabase and subscribes to
// Postgres realtime changes, so any Create / Update / Delete done in
// the Admin Panel is reflected instantly on the live site with no
// refresh, rebuild, or redeploy.
// ============================================================

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import type { Course } from "@/data/courses";

export type CourseRow = Database["public"]["Tables"]["courses"]["Row"];
export type MentorRow = Database["public"]["Tables"]["mentors"]["Row"];
export type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];

// ── Realtime helper ────────────────────────────────────────────
// Subscribes to all changes on a table and invalidates the matching
// react-query cache so the UI refetches instantly.
function useRealtime(table: string, queryKey: string) {
  const queryClient = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel(`rt-${table}-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, table, queryKey]);
}

// ── Category mapping (DB → frontend catalog categories) ────────
const CATEGORY_MAP: Record<string, Course["category"]> = {
  "Software Engineering": "Development",
  Development: "Development",
  "Artificial Intelligence": "AI & Data",
  "AI & Data": "AI & Data",
  "Cloud & DevOps": "Security & Cloud",
  "Security & Cloud": "Security & Cloud",
  "Product Design": "Design & Marketing",
  "Design & Marketing": "Design & Marketing",
  Flagship: "Flagship",
};

const FALLBACK_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800";

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

// Maps a raw Supabase course row into the rich frontend `Course` shape
// that the catalog / detail UI expects, filling gaps with sensible
// defaults so nothing in the existing UI breaks.
export function mapCourse(row: CourseRow): Course {
  const category = CATEGORY_MAP[row.category ?? ""] ?? "Development";
  const difficulty = (["Beginner", "Intermediate", "Advanced"].includes(row.difficulty ?? "")
    ? row.difficulty
    : "Intermediate") as Course["difficulty"];
  const tools = toStringArray(row.tools_covered);
  const rating = Number(row.rating) || 5.0;
  const enrolled = row.students_enrolled ?? 0;

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.description ?? "",
    category,
    badge: undefined,
    difficulty,
    duration: row.duration ?? "8 Weeks",
    totalHours: 0,
    projectsCount: row.projects_included ?? 0,
    placement: row.placement_support ?? true,
    mentor: {
      name: row.instructor ?? "CarpeDiem Tech",
      avatar: "👨‍💻",
      role: "Instructor",
      bio: "",
      students: enrolled,
      rating,
      linkedin: "",
      github: "",
    },
    description: row.description ?? "",
    longDescription: row.long_description ?? row.overview ?? "",
    whatYouLearn: toStringArray(row.career_outcomes),
    skills: tools,
    requirements: toStringArray(row.requirements),
    careerOutcomes: toStringArray(row.career_outcomes),
    expectedSalary: "",
    industryDemand: "",
    href: "#contact",
    fees: row.price ?? "Free",
    originalFees: row.discount_price ?? "",
    discountPercent: 0,
    emiAvailable: false,
    emiAmount: "",
    mode: "Online",
    seats: 20,
    studentsEnrolled: enrolled,
    rating,
    reviewCount: enrolled,
    image: row.course_image ?? FALLBACK_COURSE_IMAGE,
    language: row.language ?? "English",
    lastUpdated: row.updated_at ?? "",
    startDate: "",
    certificate: row.certificate_included ?? true,
    curriculum: (Array.isArray(row.curriculum) ? row.curriculum : []) as Course["curriculum"],
    projects: [],
    tools,
    tags: tools,
    reviews: [],
  };
}

// ── Courses ────────────────────────────────────────────────────
export function usePublishedCourses() {
  useRealtime("courses", "public-courses");

  const query = useQuery({
    queryKey: ["public-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as CourseRow[]).map(mapCourse);
    },
  });

  return { ...query, courses: query.data ?? [] };
}

// ── Mentors ────────────────────────────────────────────────────
export function useMentors() {
  useRealtime("mentors", "public-mentors");

  const query = useQuery({
    queryKey: ["public-mentors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentors")
        .select("*")
        .eq("status", "active")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as MentorRow[];
    },
  });

  return { ...query, mentors: query.data ?? [] };
}

// ── Testimonials ───────────────────────────────────────────────
export function useTestimonials() {
  useRealtime("testimonials", "public-testimonials");

  const query = useQuery({
    queryKey: ["public-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TestimonialRow[];
    },
  });

  return { ...query, testimonials: query.data ?? [] };
}
