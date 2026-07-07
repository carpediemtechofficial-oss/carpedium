import { X, Filter } from "lucide-react";

type FilterOption = {
  label: string;
  name: string;
  type: "select" | "date" | "text";
  options?: { value: string; label: string }[];
};

type FilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterOption[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
  onReset: () => void;
};

export default function FilterDrawer({ isOpen, onClose, filters, values, onChange, onReset }: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-80 max-w-md bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2 text-slate-800">
              <Filter className="h-4 w-4 text-teal-600" />
              <h3 className="font-display font-bold">Advanced Filters</h3>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {filters.map((f) => (
              <div key={f.name} className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    value={values[f.name] || "All"}
                    onChange={(e) => onChange(f.name, e.target.value)}
                    className="w-full rounded-lg border border-slate-250 bg-white px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                  >
                    <option value="All">All {f.label}s</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === "date" ? (
                  <input
                    type="date"
                    value={values[f.name] || ""}
                    onChange={(e) => onChange(f.name, e.target.value)}
                    className="w-full rounded-lg border border-slate-250 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={values[f.name] || ""}
                    onChange={(e) => onChange(f.name, e.target.value)}
                    placeholder={`Filter by ${f.label.toLowerCase()}...`}
                    className="w-full rounded-lg border border-slate-250 px-3 py-2.5 text-sm outline-none focus:border-teal-500"
                  />
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 flex items-center gap-3 bg-slate-50">
            <button
              onClick={onReset}
              className="flex-1 border border-slate-200 text-slate-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Reset All
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
