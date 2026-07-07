import { Search, Filter, RotateCw, Download, Upload, Plus } from "lucide-react";
import ViewToggle from "./ViewToggle";

type ViewMode = "table" | "card";

type SearchToolbarProps = {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  
  onFilterToggle?: () => void;
  activeFiltersCount?: number;
  
  onRefresh?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  
  onAdd?: () => void;
  addButtonText?: string;
  
  // Sort selector
  sortValue?: string;
  onSortChange?: (val: string) => void;
  sortOptions?: { value: string; label: string }[];
};

export default function SearchToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  viewMode,
  onViewModeChange,
  onFilterToggle,
  activeFiltersCount = 0,
  onRefresh,
  onExport,
  onImport,
  onAdd,
  addButtonText = "Add New",
  sortValue,
  onSortChange,
  sortOptions,
}: SearchToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2.5 text-sm bg-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
        />
      </div>

      {/* Toolbar Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Sort select */}
        {onSortChange && sortOptions && (
          <select
            value={sortValue}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500 cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {/* Filters drawer trigger */}
        {onFilterToggle && (
          <button
            onClick={onFilterToggle}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${
              activeFiltersCount > 0
                ? "bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100/50"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="h-4.5 min-w-4.5 px-1 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        )}

        {/* View Toggle */}
        <ViewToggle mode={viewMode} onChange={onViewModeChange} />

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Utility buttons */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 transition-colors"
            title="Refresh List"
          >
            <RotateCw className="h-4 w-4" />
          </button>
        )}

        {onImport && (
          <button
            onClick={onImport}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-750 hover:bg-slate-50 transition-colors"
            title="Import Data"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-750 hover:bg-slate-50 transition-colors"
            title="Export CSV"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        )}

        {/* Add Button */}
        {onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{addButtonText}</span>
          </button>
        )}
      </div>
    </div>
  );
}
