import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Edit, Trash2, MessageSquare, Globe, Lock, Star, Video, Copy, Eye } from "lucide-react";
import type { Database } from "@/types/supabase";
import TestimonialForm from "./TestimonialForm";
import { CSVImportTestimonials } from "./CSVImportTestimonials";

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Shared components
import SearchToolbar from "../shared/SearchToolbar";
import BulkToolbar from "../shared/BulkToolbar";
import FilterDrawer from "../shared/FilterDrawer";
import EmptyState from "../shared/EmptyState";
import StatusBadge from "../shared/StatusBadge";
import ActionDropdown from "../shared/ActionDropdown";

type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];
type ViewMode = "table" | "card";

const PAGE_SIZE = 12;

export default function TestimonialsManager() {
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"manage" | "import">("manage");
  const [selected, setSelected] = useState<TestimonialRow | null>(null);
  const queryClient = useQueryClient();

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("admin-testimonials-view-mode") as ViewMode) || "table";
  });

  const [filters, setFilters] = useState<Record<string, string>>({
    status: "All",
    rating: "All"
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState("Latest");
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem("admin-testimonials-view-mode", viewMode);
  }, [viewMode]);

  const { data: testimonials, isLoading, refetch } = useQuery({
    queryKey: ["admin-testimonials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TestimonialRow[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`admin-testimonials-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "testimonials" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-testimonials"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const ratingOptions = [
    { value: "5", label: "5 Stars" },
    { value: "4", label: "4 Stars & Above" },
    { value: "3", label: "3 Stars & Above" }
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = (testimonials ?? []).filter((t) => {
      const matchSearch = !q ||
        t.student_name.toLowerCase().includes(q) ||
        (t.course ?? "").toLowerCase().includes(q) ||
        t.review.toLowerCase().includes(q);
      const matchStatus = filters.status === "All" || t.status === filters.status;
      const matchRating = filters.rating === "All" || (t.rating ?? 5) >= parseInt(filters.rating);
      return matchSearch && matchStatus && matchRating;
    });

    if (sort === "Rating") {
      result = [...result].sort((a, b) => (b.rating ?? 5) - (a.rating ?? 5));
    } else {
      // Default: Latest
      result = [...result].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    return result;
  }, [testimonials, search, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, filters, sort]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete testimonial from "${name}"?`)) {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);
      if (error) alert("Error deleting testimonial: " + error.message);
      else refetch();
    }
  };

  const handleTogglePublish = async (id: string, current: string | null) => {
    const next = current === "published" ? "draft" : "published";
    const { error } = await supabase.from("testimonials").update({ status: next }).eq("id", id);
    if (error) alert("Error updating status: " + error.message);
    else refetch();
  };

  const handleBulkAction = async (action: "delete" | "publish" | "archive" | "export") => {
    if (checked.size === 0) return;
    if (action === "delete") {
      if (!confirm(`Delete ${checked.size} selected testimonial(s)?`)) return;
      const { error } = await supabase.from("testimonials").delete().in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "publish") {
      const { error } = await supabase.from("testimonials").update({ status: "published" }).in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "archive") {
      const { error } = await supabase.from("testimonials").update({ status: "draft" }).in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "export") {
      exportCSV();
    }
  };

  const handleDuplicate = async (t: TestimonialRow) => {
    const copy = { ...t };
    // @ts-ignore
    delete copy.id;
    // @ts-ignore
    delete copy.created_at;
    copy.student_name = `${copy.student_name} (Copy)`;
    copy.status = "draft";
    
    const { error } = await supabase.from("testimonials").insert(copy);
    if (error) alert("Error duplicating: " + error.message);
    else refetch();
  };

  const handleSuccess = () => {
    setIsEditing(false);
    setSelected(null);
    refetch();
  };

  const toggle = (id: string) =>
    setChecked((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAllOnPage = () => {
    const ids = pageRows.map((r) => r.id);
    const allChecked = ids.every((id) => checked.has(id));
    setChecked((prev) => {
      const n = new Set(prev);
      ids.forEach((id) => (allChecked ? n.delete(id) : n.add(id)));
      return n;
    });
  };

  const exportCSV = () => {
    const cols: (keyof TestimonialRow)[] = [
      "student_name", "course", "company", "job_role", "rating", "review", "status", "linkedin"
    ];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = cols.join(",");
    const rows = (filtered.length > 0 ? filtered : (testimonials ?? [])).map((s) => cols.map((c) => esc(s[c])).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `testimonials-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ status: "All", rating: "All" });
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== "All").length;

  if (isEditing) {
    return (
      <TestimonialForm
        initialData={selected || undefined}
        onSuccess={handleSuccess}
        onCancel={() => {
          setIsEditing(false);
          setSelected(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">Testimonials</h2>
          <p className="text-sm text-slate-500 mt-1">Manage success stories, review scores, and public quotes.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(["manage", "import"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${activeTab === t ? "border-teal-500 text-teal-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
            {t === "manage" ? "Manage Testimonials" : "Import CSV"}
          </button>
        ))}
      </div>

      {activeTab === "import" && (
        <CSVImportTestimonials />
      )}

      {activeTab === "manage" && (
        <>
          {/* Search Toolbar */}
      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search testimonials..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterToggle={() => setIsFilterOpen(true)}
        activeFiltersCount={activeFiltersCount}
        onExport={exportCSV}
        onRefresh={refetch}
        onAdd={() => { setSelected(null); setIsEditing(true); }}
        addButtonText="Add Testimonial"
        sortValue={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: "Latest", label: "Latest Reviews" },
          { value: "Rating", label: "Highest Ratings" }
        ]}
      />

      {/* Bulk Operations */}
      <BulkToolbar
        selectedCount={checked.size}
        onClear={() => setChecked(new Set())}
        onAction={handleBulkAction}
        actions={["delete", "publish", "archive", "export"]}
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? "No matches found" : "No testimonials added"}
          description={search ? "Try adjusting search filters." : "Publish reviews to display student placement highlights on the landing page."}
          onAdd={search ? undefined : () => { setSelected(null); setIsEditing(true); }}
          addButtonText="Add Testimonial"
          isSearch={!!search}
        />
      ) : (
        <>
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageRows.map((t) => (
                <div
                  key={t.id}
                  className="group relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Select check */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={checked.has(t.id)}
                      onChange={() => toggle(t.id)}
                      className="h-4.5 w-4.5 rounded border-slate-350 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute top-4 right-4 z-10">
                    <ActionDropdown
                      actions={["edit", "delete", "duplicate"]}
                      onAction={(action) => {
                        if (action === "edit") { setSelected(t); setIsEditing(true); }
                        else if (action === "delete") handleDelete(t.id, t.student_name);
                        else if (action === "duplicate") handleDuplicate(t);
                      }}
                    />
                  </div>

                  <div className="p-5 pt-8 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating Stars */}
                      <div className="flex gap-0.5 text-amber-500 mb-3 justify-center">
                        {Array.from({ length: t.rating ?? 5 }).map((_, idx) => (
                          <Star key={idx} className="h-4 w-4 fill-amber-500 text-amber-500" />
                        ))}
                      </div>

                      {/* Review Text */}
                      <p className="text-xs sm:text-sm text-slate-650 italic leading-relaxed text-center line-clamp-4">
                        “{t.review}”
                      </p>
                    </div>

                    <div className="flex flex-col items-center mt-5 pt-4 border-t border-slate-100">
                      {/* Avatar */}
                      {t.photo ? (
                        <img src={t.photo} alt={t.student_name} className="h-12 w-12 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 border border-slate-200">
                          {t.student_name.charAt(0)}
                        </div>
                      )}

                      <h4 className="font-display font-bold text-slate-900 mt-3 text-center leading-none">{t.student_name}</h4>
                      <p className="text-[10px] font-mono text-teal-600 uppercase mt-2 tracking-wider text-center max-w-[200px] truncate">
                        {t.course || "Graduate"}
                      </p>

                      {/* Job Info */}
                      {(t.job_role || t.company) && (
                        <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-600 uppercase mt-2 max-w-[200px] truncate">
                          💼 {t.job_role} {t.company ? `@ ${t.company}` : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer Links */}
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={t.status || "published"} type="testimonial" />
                    </div>

                    <div className="flex gap-2">
                      {t.video_testimonial ? (
                        <a href={t.video_testimonial} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors" title="Video Review">
                          <Video className="h-4 w-4" />
                        </a>
                      ) : (
                        <Video className="h-4 w-4 text-slate-200 cursor-not-allowed" />
                      )}
                      {t.linkedin ? (
                        <a href={t.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors" title="LinkedIn">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      ) : (
                        <Linkedin className="h-4 w-4 text-slate-200 cursor-not-allowed" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 w-12">
                        <input type="checkbox" onChange={toggleAllOnPage}
                          checked={pageRows.length > 0 && pageRows.every((r) => checked.has(r.id))}
                          className="h-4.5 w-4.5 rounded border-slate-350 text-teal-600 focus:ring-teal-500" />
                      </th>
                      <th className="px-6 py-4">Student Name</th>
                      <th className="px-6 py-4">Course</th>
                      <th className="px-6 py-4">Placement / Company</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageRows.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3">
                          <input type="checkbox" checked={checked.has(t.id)} onChange={() => toggle(t.id)}
                            className="h-4.5 w-4.5 rounded border-slate-350 text-teal-600 focus:ring-teal-500" />
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            {t.photo ? (
                              <img src={t.photo} alt={t.student_name} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                {t.student_name.charAt(0)}
                              </div>
                            )}
                            <span className="font-bold text-slate-800">{t.student_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-slate-650 truncate max-w-[200px]">{t.course || "-"}</td>
                        <td className="px-6 py-3 text-slate-500 truncate max-w-[200px]">
                          {[t.job_role, t.company].filter(Boolean).join(" @ ") || "-"}
                        </td>
                        <td className="px-6 py-3 text-amber-500 font-semibold">★ {t.rating} / 5</td>
                        <td className="px-6 py-3">
                          <StatusBadge status={t.status || "published"} type="testimonial" />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setSelected(t); setIsEditing(true); }}
                              className="p-2 text-slate-400 hover:text-teal-650 hover:bg-slate-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleTogglePublish(t.id, t.status)}
                              className="p-2 text-slate-400 hover:text-teal-650 hover:bg-slate-50 rounded-lg"
                              title="Toggle Visibility"
                            >
                              {t.status === "published" ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(t.id, t.student_name)}
                              className="p-2 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
            <span className="text-slate-500 font-medium">
              Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length} testimonials
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pageSafe <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              >
                Previous
              </button>
              <span className="text-slate-600 font-semibold text-xs">Page {pageSafe} / {totalPages}</span>
              <button
                disabled={pageSafe >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white disabled:opacity-40 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        values={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
        filters={[
          {
            label: "Rating",
            name: "rating",
            type: "select",
            options: ratingOptions
          },
          {
            label: "Status",
            name: "status",
            type: "select",
            options: [
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" }
            ]
          }
        ]}
      />
        </>
      )}
    </div>
  );
}
