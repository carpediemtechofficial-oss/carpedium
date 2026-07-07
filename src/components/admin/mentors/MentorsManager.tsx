import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2, Plus, Edit, Trash2, Users, Briefcase, Award, Copy, Globe, Eye } from "lucide-react";
import type { Database } from "@/types/supabase";
import MentorForm from "./MentorForm";

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

type MentorRow = Database["public"]["Tables"]["mentors"]["Row"];
type ViewMode = "table" | "card";

const PAGE_SIZE = 12;

export default function MentorsManager() {
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState<MentorRow | null>(null);
  const queryClient = useQueryClient();

  // View mode state with localStorage persistence
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem("admin-mentors-view-mode") as ViewMode) || "table";
  });

  const [filters, setFilters] = useState<Record<string, string>>({
    status: "All",
    company: "All"
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sort, setSort] = useState("DisplayOrder");
  const [page, setPage] = useState(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    localStorage.setItem("admin-mentors-view-mode", viewMode);
  }, [viewMode]);

  const { data: mentors, isLoading, refetch } = useQuery({
    queryKey: ["admin-mentors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentors")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as MentorRow[];
    },
  });

  // realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`admin-mentors-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "mentors" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-mentors"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const companyOptions = useMemo(() => {
    const opts = Array.from(new Set((mentors ?? []).map((m) => m.company).filter(Boolean)));
    return opts.map((opt) => ({ value: opt!, label: opt! }));
  }, [mentors]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = (mentors ?? []).filter((m) => {
      const matchSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        (m.designation ?? "").toLowerCase().includes(q) ||
        (m.bio ?? "").toLowerCase().includes(q);
      const matchCompany = filters.company === "All" || m.company === filters.company;
      const matchStatus = filters.status === "All" || m.status === filters.status;
      return matchSearch && matchCompany && matchStatus;
    });

    if (sort === "Alphabetical") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "Experience") {
      const parseExp = (e: string | null) => parseInt(e ?? "") || 0;
      result = [...result].sort((a, b) => parseExp(b.experience) - parseExp(a.experience));
    } else {
      // Default: display order
      result = [...result].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    }

    return result;
  }, [mentors, search, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageRows = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, filters, sort]);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const { error } = await supabase.from("mentors").delete().eq("id", id);
      if (error) alert("Error deleting mentor: " + error.message);
      else refetch();
    }
  };

  const handleBulkAction = async (action: "delete" | "publish" | "archive" | "export") => {
    if (checked.size === 0) return;
    if (action === "delete") {
      if (!confirm(`Delete ${checked.size} selected mentor(s)?`)) return;
      const { error } = await supabase.from("mentors").delete().in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "publish") {
      const { error } = await supabase.from("mentors").update({ status: "active" }).in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "archive") {
      const { error } = await supabase.from("mentors").update({ status: "hidden" }).in("id", Array.from(checked));
      if (error) alert("Error: " + error.message);
      else { setChecked(new Set()); refetch(); }
    } else if (action === "export") {
      exportCSV();
    }
  };

  const handleDuplicate = async (mentor: MentorRow) => {
    const copy = { ...mentor };
    // @ts-ignore
    delete copy.id;
    // @ts-ignore
    delete copy.created_at;
    copy.name = `${copy.name} (Copy)`;
    copy.display_order = (copy.display_order ?? 0) + 1;
    
    const { error } = await supabase.from("mentors").insert(copy);
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
    const cols: (keyof MentorRow)[] = [
      "name", "designation", "company", "experience", "bio", "linkedin", "github", "skills", "status"
    ];
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = cols.join(",");
    const rows = (filtered.length > 0 ? filtered : (mentors ?? [])).map((s) => cols.map((c) => esc(s[c])).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mentors-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ status: "All", company: "All" });
  };

  const activeFiltersCount = Object.values(filters).filter((v) => v !== "All").length;

  if (isEditing) {
    return (
      <MentorForm
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
          <h2 className="text-xl font-bold font-display text-slate-900">Mentors</h2>
          <p className="text-sm text-slate-500 mt-1">Manage instructor profiles, designations, and industry credentials.</p>
        </div>
      </div>

      {/* Toolbar */}
      <SearchToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search mentors..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onFilterToggle={() => setIsFilterOpen(true)}
        activeFiltersCount={activeFiltersCount}
        onExport={exportCSV}
        onRefresh={refetch}
        onAdd={() => { setSelected(null); setIsEditing(true); }}
        addButtonText="Add Mentor"
        sortValue={sort}
        onSortChange={setSort}
        sortOptions={[
          { value: "DisplayOrder", label: "Display Order" },
          { value: "Alphabetical", label: "Alphabetical" },
          { value: "Experience", label: "Years Experience" }
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
        <div className="flex items-center justify-center p-12 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? "No matches found" : "No mentors added"}
          description={search ? "Try adjusting your query parameters." : "Add industry expert mentor profiles to assign them to courses."}
          onAdd={search ? undefined : () => { setSelected(null); setIsEditing(true); }}
          addButtonText="Add Mentor"
          isSearch={!!search}
        />
      ) : (
        <>
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pageRows.map((mentor) => (
                <div
                  key={mentor.id}
                  className="group relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-teal-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  {/* Select check */}
                  <div className="absolute top-4 left-4 z-10">
                    <input
                      type="checkbox"
                      checked={checked.has(mentor.id)}
                      onChange={() => toggle(mentor.id)}
                      className="h-4.5 w-4.5 rounded border-slate-355 text-teal-600 focus:ring-teal-500 cursor-pointer"
                    />
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute top-4 right-4 z-10">
                    <ActionDropdown
                      actions={["edit", "delete", "duplicate"]}
                      onAction={(action) => {
                        if (action === "edit") { setSelected(mentor); setIsEditing(true); }
                        else if (action === "delete") handleDelete(mentor.id, mentor.name);
                        else if (action === "duplicate") handleDuplicate(mentor);
                      }}
                    />
                  </div>

                  <div className="p-5 pt-8 flex-1 flex flex-col items-center text-center">
                    {/* Avatar */}
                    {mentor.profile_image ? (
                      <img src={mentor.profile_image} alt={mentor.name} className="h-20 w-20 rounded-full object-cover border-2 border-teal-500/20 shadow-sm" />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-500 border border-slate-200">
                        {mentor.name.charAt(0)}
                      </div>
                    )}

                    <h4 className="font-display font-bold text-slate-900 mt-4 leading-tight">{mentor.name}</h4>
                    <p className="text-xs text-teal-600 font-semibold uppercase tracking-wider mt-1">{mentor.designation || "Instructor"}</p>
                    <p className="text-xs text-slate-500 font-medium truncate w-full mt-0.5">{mentor.company || "CarpeDiem Partner"}</p>

                    {/* Bio */}
                    <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">{mentor.bio || "No biography provided."}</p>

                    {/* Skills Tags */}
                    {mentor.skills && mentor.skills.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1 mt-4">
                        {mentor.skills.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-150 px-2 py-0.5 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {mentor.skills.length > 3 && (
                          <span className="text-[9px] font-bold text-slate-400 px-1 py-0.5">+{mentor.skills.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Links */}
                  <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={mentor.status || "active"} type="mentor" />
                      <span className="font-medium text-slate-400">· Exp: {mentor.experience || "—"}</span>
                    </div>

                    <div className="flex gap-2">
                      {mentor.github ? (
                        <a href={mentor.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors" title="GitHub">
                          <Github className="h-4 w-4" />
                        </a>
                      ) : (
                        <Github className="h-4 w-4 text-slate-200 cursor-not-allowed" />
                      )}
                      {mentor.linkedin ? (
                        <a href={mentor.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-800 transition-colors" title="LinkedIn">
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
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Designation</th>
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Experience</th>
                      <th className="px-6 py-4">Order</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pageRows.map((mentor) => (
                      <tr key={mentor.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3">
                          <input type="checkbox" checked={checked.has(mentor.id)} onChange={() => toggle(mentor.id)}
                            className="h-4.5 w-4.5 rounded border-slate-350 text-teal-600 focus:ring-teal-500" />
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            {mentor.profile_image ? (
                              <img src={mentor.profile_image} alt={mentor.name} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                {mentor.name.charAt(0)}
                              </div>
                            )}
                            <span className="font-bold text-slate-800">{mentor.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-slate-600">{mentor.designation || "-"}</td>
                        <td className="px-6 py-3 text-slate-600">{mentor.company || "-"}</td>
                        <td className="px-6 py-3 text-slate-550 font-medium">{mentor.experience || "-"}</td>
                        <td className="px-6 py-3 text-slate-400 font-mono">#{mentor.display_order ?? 0}</td>
                        <td className="px-6 py-3">
                          <StatusBadge status={mentor.status || "active"} type="mentor" />
                        </td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setSelected(mentor); setIsEditing(true); }}
                              className="p-2 text-slate-400 hover:text-teal-650 hover:bg-slate-50 rounded-lg"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(mentor.id, mentor.name)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
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
              Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length} mentors
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
            label: "Company",
            name: "company",
            type: "select",
            options: companyOptions
          },
          {
            label: "Status",
            name: "status",
            type: "select",
            options: [
              { value: "active", label: "Active" },
              { value: "hidden", label: "Hidden" }
            ]
          }
        ]}
      />
    </div>
  );
}
