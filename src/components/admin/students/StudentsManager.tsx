import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Loader2, Eye, Edit, Trash2, GraduationCap, Award, Briefcase, CalendarClock, Copy, Globe, Archive
} from "lucide-react";
import type { Database } from "@/types/supabase";
import StudentForm from "./StudentForm";
import StudentProfile from "./StudentProfile";

// Local SVG icons for brand assets not available in this lucide-react version
const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

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

type StudentRow = Database["public"]["Tables"]["students"]["Row"];
type View = "list" | "form" | "profile";
type ViewMode = "table" | "card";

const PAGE_SIZE = 12;

export default function StudentsManager() {
  const qc = useQueryClient();
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<StudentRow | null>(null);

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("admin-students-view-mode") as ViewMode) || "table";
  });

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({
    status: "All",
    course: "All",
    placement: "All"
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState("Latest");
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem("admin-students-view-mode", viewMode);
  }, [viewMode]);

  const { data: students, isLoading, refetch } = useQuery({
    queryKey: ["admin-students"],
    queryFn: async () => {
      const { data, error } = await supabase.from("students").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as StudentRow[];
    },
  });

  // realtime subscription
  useEffect(() => {
    const ch = supabase
      .channel(`admin-students-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () =>
        qc.invalidateQueries({ queryKey: ["admin-students"] }))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  const courseOptions = useMemo(() => {
    const opts = Array.from(new Set((students ?? []).map((s) => s.course_name).filter(Boolean)));
    return opts.map((opt) => ({ value: opt!, label: opt! }));
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = (students ?? []).filter((s) => {
      const matchSearch = !q ||
        s.full_name.toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.mobile ?? "").toLowerCase().includes(q);
      const matchStatus = filters.status === "All" || s.status === filters.status;
      const matchCourse = filters.course === "All" || s.course_name === filters.course;
      const matchPlace = filters.placement === "All" || s.placement_status === filters.placement;
      return matchSearch && matchStatus && matchCourse && matchPlace;
    });

    if (sort === "Alphabetical") {
      result = [...result].sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (sort === "Attendance") {
      result = [...result].sort((a, b) => (b.attendance_percentage ?? 0) - (a.attendance_percentage ?? 0));
    } else {
      // Default: Latest
      result = [...result].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }

    return result;
  }, [students, search, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, filters, sort]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete student "${name}"?`)) {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) alert("Error: " + error.message);
      else refetch();
    }
  };

  const handleBulkAction = async (action: "delete" | "publish" | "archive" | "export") => {
    if (checked.size === 0) return;
    if (action === "delete") {
      if (!confirm(`Delete ${checked.size} selected student(s)?`)) return;
      const { error } = await supabase.from("students").delete().in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "publish") {
      const { error } = await supabase.from("students").update({ status: "active" }).in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "archive") {
      const { error } = await supabase.from("students").update({ status: "completed" }).in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "export") {
      exportCSV();
    }
  };

  const handleDuplicate = async (student: StudentRow) => {
    const copy = { ...student };
    // @ts-ignore
    delete copy.id;
    // @ts-ignore
    delete copy.created_at;
    // @ts-ignore
    delete copy.updated_at;
    copy.full_name = `${copy.full_name} (Copy)`;
    copy.email = copy.email ? `copy.${Date.now()}.${copy.email}` : null;
    
    const { error } = await supabase.from("students").insert(copy);
    if (error) alert("Error duplicating: " + error.message);
    else refetch();
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
    const cols: (keyof StudentRow)[] = [
      "full_name", "email", "mobile", "course_name", "batch", "mentor_name", "attendance_percentage",
      "project_status", "certificate_issued", "placement_status", "current_company", "salary_package",
      "fees_paid", "pending_fees", "status",
    ];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = cols.join(",");
    const rows = (filtered.length > 0 ? filtered : (students ?? [])).map((s) => cols.map((c) => esc(s[c])).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openForm = (s: StudentRow | null) => { setSelected(s); setView("form"); };
  const openProfile = (s: StudentRow) => { setSelected(s); setView("profile"); };
  const onFormSuccess = () => { setView("list"); setSelected(null); refetch(); };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ status: "All", course: "All", placement: "All" });
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== "All").length;

  if (view === "form") {
    return <StudentForm initialData={selected || undefined} onSuccess={onFormSuccess} onCancel={() => { setView("list"); setSelected(null); }} />;
  }
  if (view === "profile" && selected) {
    const fresh = students?.find((s) => s.id === selected.id) ?? selected;
    return <StudentProfile student={fresh} onBack={() => setView("list")} onEdit={(s) => openForm(s)} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-slate-900">Students Dashboard</h2>
        <p className="text-sm text-slate-500 mt-1">Manage student profiles, billing records, learning progress, and placement status.</p>
      </div>

      {/* Toolbar */}
      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by name, email, mobile..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterToggle={() => setIsFilterOpen(true)}
        activeFiltersCount={activeFiltersCount}
        onExport={exportCSV}
        onRefresh={refetch}
        onAdd={() => openForm(null)}
        addButtonText="Add Student"
        sortValue={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: "Latest", label: "Latest Enrolled" },
          { value: "Alphabetical", label: "Alphabetical" },
          { value: "Attendance", label: "Highest Attendance" }
        ]}
      />

      {/* Bulk actions */}
      <BulkToolbar
        selectedCount={checked.size}
        onClear={() => setChecked(new Set())}
        onAction={handleBulkAction}
        actions={["delete", "publish", "archive", "export"]}
      />

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-slate-405"><Loader2 className="h-8 w-8 animate-spin text-teal-600" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? "No matches found" : "No students added yet"}
          description={search ? "Try adjusting your query or resetting filters." : "Create student profiles to track enrollment status and billing details."}
          onAdd={search ? undefined : () => openForm(null)}
          addButtonText="Add Student"
          isSearch={!!search}
        />
      ) : (
        <>
          {/* Card View */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageRows.map((s) => (
                <div
                  key={s.id}
                  className="group relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Select check */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={checked.has(s.id)}
                      onChange={() => toggle(s.id)}
                      className="h-4.5 w-4.5 rounded border-slate-350 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute top-4 right-4 z-10">
                    <ActionDropdown
                      actions={["view", "edit", "delete", "duplicate"]}
                      onAction={(action) => {
                        if (action === "view") openProfile(s);
                        else if (action === "edit") openForm(s);
                        else if (action === "delete") handleDelete(s.id, s.full_name);
                        else if (action === "duplicate") handleDuplicate(s);
                      }}
                    />
                  </div>

                  <div className="p-5 pt-8 flex-1 flex flex-col items-center text-center">
                    {/* Avatar */}
                    {s.profile_photo ? (
                      <img src={s.profile_photo} alt={s.full_name} className="h-16 w-16 rounded-full object-cover border-2 border-teal-500/20 shadow-sm" />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-500 border border-slate-200">
                        {s.full_name.charAt(0)}
                      </div>
                    )}

                    <h4 className="font-display font-bold text-slate-900 mt-4 leading-tight">{s.full_name}</h4>
                    <p className="text-xs text-slate-500 font-medium truncate w-full mt-1">{s.email || "No email"}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{s.mobile || "—"}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                      <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-150 max-w-[150px] truncate">
                        {s.course_name || "Unassigned"}
                      </span>
                      <StatusBadge status={s.status || "active"} type="student" />
                    </div>

                    {/* Progress Bar / Attendance */}
                    <div className="w-full mt-5 space-y-1">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                        <span>Attendance</span>
                        <span className="text-slate-800">{s.attendance_percentage ?? 0}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-teal-500 transition-all"
                          style={{ width: `${Math.min(100, Number(s.attendance_percentage) || 0)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats List */}
                    <div className="w-full grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-slate-100 text-left text-xs">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Placement</p>
                        <p className="font-medium text-slate-700 truncate">{s.placement_status || "Not Placed"}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Certificate</p>
                        <p className={`font-medium ${s.certificate_issued ? "text-teal-650" : "text-slate-400"}`}>
                          {s.certificate_issued ? "Issued" : "Pending"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Links */}
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-2">
                      {s.github_link ? (
                        <a href={s.github_link} target="_blank" rel="noreferrer" className="text-slate-450 hover:text-slate-800 transition-colors" title="GitHub">
                          <Github className="h-4 w-4" />
                        </a>
                      ) : (
                        <Github className="h-4 w-4 text-slate-300 cursor-not-allowed" />
                      )}
                      {s.linkedin ? (
                        <a href={s.linkedin} target="_blank" rel="noreferrer" className="text-slate-450 hover:text-slate-800 transition-colors" title="LinkedIn">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      ) : (
                        <Linkedin className="h-4 w-4 text-slate-300 cursor-not-allowed" />
                      )}
                    </div>
                    
                    <button
                      onClick={() => openProfile(s)}
                      className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-0.5 hover:underline"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="px-4 py-4 w-12">
                        <input type="checkbox" onChange={toggleAllOnPage}
                          checked={pageRows.length > 0 && pageRows.every((r) => checked.has(r.id))}
                          className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                      </th>
                      <th className="px-4 py-4">Student</th>
                      <th className="px-4 py-4">Email</th>
                      <th className="px-4 py-4">Mobile</th>
                      <th className="px-4 py-4">Course</th>
                      <th className="px-4 py-4">Batch</th>
                      <th className="px-4 py-4">Mentor</th>
                      <th className="px-4 py-4">Attendance</th>
                      <th className="px-4 py-4">Project</th>
                      <th className="px-4 py-4">Certificate</th>
                      <th className="px-4 py-4">Placement</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageRows.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={checked.has(s.id)} onChange={() => toggle(s.id)}
                            className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {s.profile_photo ? (
                              <img src={s.profile_photo} alt={s.full_name} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200">{s.full_name.charAt(0)}</div>
                            )}
                            <span className="font-bold text-slate-800">{s.full_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{s.email || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.mobile || "—"}</td>
                        <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">{s.course_name || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.batch || "—"}</td>
                        <td className="px-4 py-3 text-slate-600">{s.mentor_name || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-600" style={{ width: `${Math.min(100, Number(s.attendance_percentage) || 0)}%` }} />
                            </div>
                            <span className="text-xs text-slate-500 font-semibold">{s.attendance_percentage ?? 0}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{s.project_status || "—"}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${s.certificate_issued ? "text-teal-650" : "text-slate-400"}`}>
                            {s.certificate_issued ? "Issued" : "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-650 font-semibold">{s.placement_status || "—"}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={s.status || "active"} type="student" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openProfile(s)} title="View Details" className="p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-50 rounded-lg"><Eye className="h-4 w-4" /></button>
                            <button onClick={() => openForm(s)} title="Edit" className="p-2 text-slate-400 hover:text-teal-600 hover:bg-slate-50 rounded-lg"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(s.id, s.full_name)} title="Delete" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
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
              Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length} students
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
            label: "Course",
            name: "course",
            type: "select",
            options: courseOptions
          },
          {
            label: "Status",
            name: "status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
              { value: "dropped", label: "Dropped" }
            ]
          },
          {
            label: "Placement Status",
            name: "placement",
            type: "select",
            options: [
              { value: "Not Placed", label: "Not Placed" },
              { value: "In Process", label: "In Process" },
              { value: "Placed", label: "Placed" }
            ]
          }
        ]}
      />
    </div>
  );
}
