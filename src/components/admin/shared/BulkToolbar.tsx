import { Trash2, Globe, Archive, Download, X } from "lucide-react";

type BulkAction = "delete" | "publish" | "archive" | "export";

type BulkToolbarProps = {
  selectedCount: number;
  onAction: (action: BulkAction) => void;
  onClear: () => void;
  actions?: BulkAction[];
};

export default function BulkToolbar({ selectedCount, onAction, onClear, actions = ["delete", "publish", "archive", "export"] }: BulkToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center justify-between bg-teal-50 border border-teal-150 rounded-xl px-4 py-3 shadow-sm text-sm text-teal-800">
      <div className="flex items-center gap-3">
        <span className="font-semibold">{selectedCount} item(s) selected</span>
        <button onClick={onClear} className="p-1 rounded-md hover:bg-teal-100 text-teal-600 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {actions.includes("publish") && (
          <button
            onClick={() => onAction("publish")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-white hover:bg-teal-100/50 text-teal-700 font-medium transition-colors"
          >
            <Globe className="h-3.5 w-3.5" /> Publish
          </button>
        )}
        {actions.includes("archive") && (
          <button
            onClick={() => onAction("archive")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-white hover:bg-teal-100/50 text-teal-700 font-medium transition-colors"
          >
            <Archive className="h-3.5 w-3.5" /> Archive
          </button>
        )}
        {actions.includes("export") && (
          <button
            onClick={() => onAction("export")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-200 bg-white hover:bg-teal-100/50 text-teal-700 font-medium transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        )}
        {actions.includes("delete") && (
          <button
            onClick={() => onAction("delete")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete Selected
          </button>
        )}
      </div>
    </div>
  );
}
