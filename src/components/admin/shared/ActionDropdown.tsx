import { useState, useRef, useEffect } from "react";
import { MoreVertical, Eye, Edit, Trash2, Copy, Archive, Globe, Share2 } from "lucide-react";

type ActionType = "view" | "edit" | "delete" | "duplicate" | "archive" | "publish" | "share";

type ActionDropdownProps = {
  onAction: (action: ActionType) => void;
  actions?: ActionType[];
};

export default function ActionDropdown({ onAction, actions = ["view", "edit", "delete", "duplicate", "publish"] }: ActionDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const items: { type: ActionType; label: string; icon: any; color?: string }[] = [
    { type: "view", label: "View Details", icon: Eye },
    { type: "edit", label: "Edit Entity", icon: Edit },
    { type: "duplicate", label: "Duplicate", icon: Copy },
    { type: "publish", label: "Publish / Draft", icon: Globe },
    { type: "archive", label: "Archive", icon: Archive },
    { type: "share", label: "Share", icon: Share2 },
    { type: "delete", label: "Delete", icon: Trash2, color: "text-rose-600 hover:bg-rose-50" },
  ];

  const activeItems = items.filter((item) => actions.includes(item.type));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-xl border border-slate-200 bg-white shadow-lg py-1.5 z-50 text-slate-700 text-sm">
          {activeItems.map((item) => (
            <button
              key={item.type}
              onClick={() => {
                onAction(item.type);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                item.color || "hover:bg-slate-50 text-slate-700"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
