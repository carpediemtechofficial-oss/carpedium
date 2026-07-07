import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  LogOut,
  Calendar
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import DashboardOverview from "./DashboardOverview";
import CoursesManager from "./courses/CoursesManager";
import MediaLibrary from "./media/MediaLibrary";
import MentorsManager from "./mentors/MentorsManager";
import StudentsManager from "./students/StudentsManager";
import TestimonialsManager from "./testimonials/TestimonialsManager";
import SettingsManager from "./settings/SettingsManager";
import AttendanceManager from "./attendance/AttendanceManager";

type AdminLayoutProps = {
  session: any;
  onLogout: () => void;
  onBackToPortal: () => void;
};

type AdminView = "dashboard" | "courses" | "mentors" | "students" | "testimonials" | "media" | "settings" | "attendance";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "courses", label: "Courses", icon: BookOpen },
  { id: "mentors", label: "Mentors", icon: Users },
  { id: "students", label: "Students", icon: GraduationCap },
  { id: "attendance", label: "Attendance", icon: Calendar },
  { id: "testimonials", label: "Testimonials", icon: MessageSquare },
  { id: "media", label: "Media Library", icon: ImageIcon },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export default function AdminLayout({ session, onLogout, onBackToPortal }: AdminLayoutProps) {
  const [currentView, setCurrentView] = useState<AdminView>("dashboard");
  const { settings } = useSettings();

  return (
    <div className="flex h-screen bg-slate-50 font-body overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <img
            src={settings.branding.logo}
            alt={settings.branding.brandName}
            className="h-8 w-8 rounded object-cover mr-3 ring-1 ring-slate-800 bg-slate-800"
          />
          <div className="flex flex-col leading-tight">
            <span className="font-display font-bold text-white tracking-wider text-sm truncate max-w-[140px]">
              {settings.branding.brandName}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Admin Panel</span>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as AdminView)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                currentView === item.id 
                  ? "bg-slate-800 text-white" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs">
              {session?.user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{session?.user?.email}</p>
              <p className="text-[10px] text-slate-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
          <button
            onClick={onBackToPortal}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Back to Site
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shadow-sm flex-shrink-0">
          <h2 className="text-xl font-display font-bold text-slate-900 capitalize">
            {NAV_ITEMS.find((n) => n.id === currentView)?.label}
          </h2>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          {currentView === "dashboard" && <DashboardOverview />}
          {currentView === "courses" && <CoursesManager />}
          {currentView === "mentors" && <MentorsManager />}
          {currentView === "students" && <StudentsManager />}
          {currentView === "attendance" && <AttendanceManager />}
          {currentView === "testimonials" && <TestimonialsManager />}
          {currentView === "media" && <MediaLibrary />}
          {currentView === "settings" && <SettingsManager />}
        </div>
      </main>

    </div>
  );
}
