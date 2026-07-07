import { LayoutGrid, List } from "lucide-react";

type ViewMode = "table" | "card";

type ViewToggleProps = {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
};

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
      <button
        onClick={() => onChange("table")}
        className={`p-1.5 rounded-md transition-all ${
          mode === "table"
            ? "bg-white text-slate-800 shadow-sm"
            : "text-slate-500 hover:text-slate-850"
        }`}
        title="Table View"
      >
        <List className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange("card")}
        className={`p-1.5 rounded-md transition-all ${
          mode === "card"
            ? "bg-white text-slate-800 shadow-sm"
            : "text-slate-500 hover:text-slate-850"
        }`}
        title="Card View"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  );
}
