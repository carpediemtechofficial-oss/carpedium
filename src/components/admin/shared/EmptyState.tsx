import { Plus, Search } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  onAdd?: () => void;
  addButtonText?: string;
  isSearch?: boolean;
};

export default function EmptyState({ title, description, onAdd, addButtonText = "Add New", isSearch = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-5 text-slate-400">
        {isSearch ? (
          <Search className="h-8 w-8" />
        ) : (
          <svg
            className="h-8 w-8 text-teal-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>

      <h3 className="font-display text-lg font-bold text-slate-800 leading-tight mb-2">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">{description}</p>

      {onAdd && !isSearch && (
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-5 py-3 font-semibold text-sm transition-all hover:scale-102 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {addButtonText}
        </button>
      )}
    </div>
  );
}
