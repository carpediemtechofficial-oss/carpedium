import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Edit, Trash2, Globe, Lock, BookOpen, Copy, Eye, Clock, Star, Users, FolderGit2, Award, Calendar } from "lucide-react";
import type { Database } from "@/types/supabase";
import CourseForm from "./CourseForm";

// Shared components
import SearchToolbar from "../shared/SearchToolbar";
import BulkToolbar from "../shared/BulkToolbar";
import FilterDrawer from "../shared/FilterDrawer";
import EmptyState from "../shared/EmptyState";
import StatusBadge from "../shared/StatusBadge";
import ActionDropdown from "../shared/ActionDropdown";

type Course = Database['public']['Tables']['courses']['Row'];
type ViewMode = "table" | "card";

const PAGE_SIZE = 12;

export default function CoursesManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("admin-courses-view-mode") as ViewMode) || "table";
  });

  const [filters, setFilters] = useState<Record<string, string>>({
    category: "All",
    status: "All",
    difficulty: "All"
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState("Latest");
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem("admin-courses-view-mode", viewMode);
  }, [viewMode]);

  const { data: courses, isLoading, refetch } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      const { data: studentStats } = await supabase
        .from('students')
        .select('course_id, attendance_percentage');

      const attendanceMap: Record<string, { total: number; sum: number }> = {};
      if (studentStats) {
        studentStats.forEach(s => {
          if (!s.course_id) return;
          if (!attendanceMap[s.course_id]) {
            attendanceMap[s.course_id] = { total: 0, sum: 0 };
          }
          attendanceMap[s.course_id].sum += Number(s.attendance_percentage || 0);
          attendanceMap[s.course_id].total += 1;
        });
      }

      const coursesWithAttendance = (data as any[]).map(c => {
        const stats = attendanceMap[c.id];
        const rate = stats && stats.total > 0 ? (stats.sum / stats.total).toFixed(1) : "0.0";
        return {
          ...c,
          attendanceRate: rate
        };
      });
      
      return coursesWithAttendance;
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel(`admin-courses-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "courses" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const categoryOptions = useMemo(() => {
    const opts = Array.from(new Set((courses ?? []).map((c) => c.category).filter(Boolean)));
    return opts.map((opt) => ({ value: opt!, label: opt! }));
  }, [courses]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = (courses ?? []).filter((c) => {
      const matchSearch = !q ||
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q);
      const matchCategory = filters.category === "All" || c.category === filters.category;
      const matchStatus = filters.status === "All" || 
        (filters.status === "published" ? c.is_published : !c.is_published);
      const matchDiff = filters.difficulty === "All" || c.difficulty === filters.difficulty;
      return matchSearch && matchCategory && matchStatus && matchDiff;
    });

    if (sort === "Alphabetical") {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === "Students") {
      result = [...result].sort((a, b) => (b.students_enrolled ?? 0) - (a.students_enrolled ?? 0));
    } else if (sort === "Price") {
      const parsePrice = (p: string | null) => parseInt((p ?? "").replace(/\D/g, "")) || 0;
      result = [...result].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    } else {
      // Default: Latest
      result = [...result].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    return result;
  }, [courses, search, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, filters, sort]);

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) alert("Error deleting course: " + error.message);
      else refetch();
    }
  };

  const handleTogglePublish = async (id: string, current: boolean | null) => {
    const next = !current;
    const { error } = await supabase.from('courses').update({ 
      is_published: next,
      status: next ? 'published' : 'draft'
    }).eq('id', id);
    if (error) alert("Error toggling publish: " + error.message);
    else refetch();
  };

  const handleBulkAction = async (action: "delete" | "publish" | "archive" | "export") => {
    if (checked.size === 0) return;
    if (action === "delete") {
      if (!confirm(`Delete ${checked.size} selected course(s)?`)) return;
      const { error } = await supabase.from("courses").delete().in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "publish") {
      const { error } = await supabase.from("courses").update({ is_published: true, status: "published" }).in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "archive") {
      const { error } = await supabase.from("courses").update({ is_published: false, status: "draft" }).in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "export") {
      exportCSV();
    }
  };

  const handleDuplicate = async (course: Course) => {
    const copy = { ...course };
    // @ts-ignore
    delete copy.id;
    // @ts-ignore
    delete copy.created_at;
    // @ts-ignore
    delete copy.updated_at;
    copy.title = `${copy.title} (Copy)`;
    copy.slug = `${copy.slug}-copy-${Date.now().toString().slice(-4)}`;
    copy.is_published = false;
    copy.status = 'draft';
    
    const { error } = await supabase.from("courses").insert(copy);
    if (error) alert("Error duplicating: " + error.message);
    else refetch();
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsEditing(true);
  };

  const handleAddNew = () => {
    setSelectedCourse(null);
    setIsEditing(true);
  };

  const handleFormSuccess = () => {
    setIsEditing(false);
    setSelectedCourse(null);
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
    const cols: (keyof Course)[] = [
      "title", "slug", "category", "difficulty", "duration", "price", "students_enrolled", "rating", "is_published", "status"
    ];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = cols.join(",");
    const rows = (filtered.length > 0 ? filtered : (courses ?? [])).map((s) => cols.map((c) => esc(s[c])).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `courses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ category: "All", status: "All", difficulty: "All" });
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== "All").length;

  if (isEditing) {
    return (
      <CourseForm 
        initialData={selectedCourse || undefined}
        onSuccess={handleFormSuccess}
        onCancel={() => { setIsEditing(false); setSelectedCourse(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900">Course Library</h2>
          <p className="text-sm text-slate-500 mt-1">Manage, publish, duplicate, and edit course syllabus details.</p>
        </div>
      </div>

      {/* Toolbar */}
      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search courses..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterToggle={() => setIsFilterOpen(true)}
        activeFiltersCount={activeFiltersCount}
        onExport={exportCSV}
        onRefresh={refetch}
        onAdd={handleAddNew}
        addButtonText="Add Course"
        sortValue={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: "Latest", label: "Latest Added" },
          { value: "Alphabetical", label: "Alphabetical" },
          { value: "Students", label: "Highest Enrollment" },
          { value: "Price", label: "Price (High to Low)" }
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
          title={search ? "No courses matched" : "No courses added"}
          description={search ? "Try adjusting your query or resetting filters." : "Create courses to build your curriculum syllabus and offer standard certificates."}
          onAdd={search ? undefined : handleAddNew}
          addButtonText="Add Course"
          isSearch={!!search}
        />
      ) : (
        <>
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageRows.map((course) => {
                const parsePrice = (p: string | null) => parseInt((p ?? "").replace(/\D/g, "")) || 0;
                const estimatedRevenue = parsePrice(course.price) * (course.students_enrolled ?? 0);
                
                return (
                  <div
                    key={course.id}
                    className="group relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    {/* Select checkbox */}
                    <div className="absolute top-4 left-4 z-10">
                      <input
                        type="checkbox"
                        checked={checked.has(course.id)}
                        onChange={() => toggle(course.id)}
                        className="h-4.5 w-4.5 rounded border-slate-350 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                    </div>

                    {/* Actions Menu */}
                    <div className="absolute top-4 right-4 z-10">
                      <ActionDropdown
                        actions={["edit", "delete", "duplicate", "publish"]}
                        onAction={(action) => {
                          if (action === "edit") handleEdit(course);
                          else if (action === "delete") handleDelete(course.id, course.title);
                          else if (action === "duplicate") handleDuplicate(course);
                          else if (action === "publish") handleTogglePublish(course.id, course.is_published);
                        }}
                      />
                    </div>

                    {/* Course Thumbnail */}
                    <div className="h-40 bg-slate-100 overflow-hidden relative border-b border-slate-200">
                      {course.course_image ? (
                        <img src={course.course_image} alt={course.title} className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400">
                          <BookOpen className="h-10 w-10" />
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 flex gap-1.5">
                        <span className="text-[9px] font-bold bg-black/70 backdrop-blur-sm text-white px-2 py-0.5 rounded uppercase tracking-wider">
                          {course.difficulty || "Intermediate"}
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">{course.category}</span>
                        <h4 className="font-display font-bold text-slate-900 mt-1 line-clamp-2 leading-tight" title={course.title}>
                          {course.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono mt-1">/{course.slug}</p>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{course.description || "No description provided."}</p>
                      </div>

                      {/* Instructor & Stats */}
                      <div className="mt-5 space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{course.duration || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-550 font-semibold">
                            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            <span>{course.rating || "5.0"}</span>
                          </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-150 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-550">
                            <Users className="h-3.5 w-3.5 text-teal-600" />
                            <span>{course.students_enrolled ?? 0} Learners</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-550">
                            <FolderGit2 className="h-3.5 w-3.5 text-indigo-500" />
                            <span>{course.projects_included ?? 0} Projects</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-550">
                            <Calendar className="h-3.5 w-3.5 text-teal-650" />
                            <span>{(course as any).attendanceRate || "0.0"}% Attd.</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-550 font-bold text-slate-800">
                            <span>₹ Revenue:</span>
                            <span className="truncate">₹{estimatedRevenue.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer actions */}
                    <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <StatusBadge status={course.is_published ? "published" : "draft"} type="course" />
                      </div>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(course)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleTogglePublish(course.id, course.is_published)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            course.is_published
                              ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                              : "bg-teal-600 text-white hover:bg-teal-700"
                          }`}
                        >
                          {course.is_published ? "Draft" : "Publish"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
                          className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                      </th>
                      <th className="px-6 py-4">Course Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Duration</th>
                      <th className="px-6 py-4">Price</th>
                      <th className="px-6 py-4">Students</th>
                      <th className="px-6 py-4">Rating</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageRows.map((course) => (
                      <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3">
                          <input type="checkbox" checked={checked.has(course.id)} onChange={() => toggle(course.id)}
                            className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            {course.course_image ? (
                              <img src={course.course_image} alt={course.title} className="h-8 w-8 rounded object-cover border border-slate-200" />
                            ) : (
                              <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-xs text-slate-400"><BookOpen className="h-4 w-4" /></div>
                            )}
                            <div>
                              <p className="font-bold text-slate-800">{course.title}</p>
                              <p className="text-xs text-slate-400 font-mono mt-0.5">/{course.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-slate-600 font-semibold">{course.category}</td>
                        <td className="px-6 py-3 text-slate-500">{course.duration || '—'}</td>
                        <td className="px-6 py-3 text-slate-650 font-bold">{course.price || 'Free'}</td>
                        <td className="px-6 py-3 text-slate-500">{course.students_enrolled ?? 0} enrolled</td>
                        <td className="px-6 py-3 text-slate-550 font-semibold">★ {course.rating || '5.0'}</td>
                        <td className="px-6 py-3">
                          <StatusBadge status={course.is_published ? "published" : "draft"} type="course" />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => handleEdit(course)} title="Edit" className="p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleTogglePublish(course.id, course.is_published)} title={course.is_published ? "Make Draft" : "Publish Live"} className="p-2 text-slate-400 hover:text-teal-605 hover:bg-slate-50 rounded-lg">
                              {course.is_published ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                            </button>
                            <button onClick={() => handleDelete(course.id, course.title)} title="Delete" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
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
              Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length} courses
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
            label: "Category",
            name: "category",
            type: "select",
            options: categoryOptions
          },
          {
            label: "Status",
            name: "status",
            type: "select",
            options: [
              { value: "published", label: "Published" },
              { value: "draft", label: "Draft" }
            ]
          },
          {
            label: "Difficulty",
            name: "difficulty",
            type: "select",
            options: [
              { value: "Beginner", label: "Beginner" },
              { value: "Intermediate", label: "Intermediate" },
              { value: "Advanced", label: "Advanced" }
            ]
          }
        ]}
      />
    </div>
  );
}
