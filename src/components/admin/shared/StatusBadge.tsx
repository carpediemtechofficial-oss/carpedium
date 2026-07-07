import React from "react";

type StatusBadgeProps = {
  status: string;
  type?: "course" | "student" | "mentor" | "testimonial";
};

export default function StatusBadge({ status, type = "course" }: StatusBadgeProps) {
  const norm = status.toLowerCase();

  let styles = "bg-slate-50 text-slate-600 border-slate-200";

  if (type === "course") {
    if (norm === "published" || norm === "true" || status === "true") {
      styles = "bg-teal-50 text-teal-700 border-teal-200";
    } else {
      styles = "bg-slate-100 text-slate-600 border-slate-200";
    }
  } else if (type === "student") {
    if (norm === "active") {
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (norm === "completed") {
      styles = "bg-blue-50 text-blue-700 border-blue-200";
    } else if (norm === "dropped") {
      styles = "bg-rose-50 text-rose-700 border-rose-200";
    }
  } else if (type === "mentor") {
    if (norm === "active") {
      styles = "bg-teal-50 text-teal-700 border-teal-200";
    } else {
      styles = "bg-slate-100 text-slate-500 border-slate-200";
    }
  } else if (type === "testimonial") {
    if (norm === "published") {
      styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else {
      styles = "bg-amber-50 text-amber-700 border-amber-200";
    }
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${styles}`}>
      {norm === "true" ? "Published" : norm === "false" ? "Draft" : status}
    </span>
  );
}
