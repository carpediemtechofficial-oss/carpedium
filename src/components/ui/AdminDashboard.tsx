import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AuthScreen from "@/components/admin/AuthScreen";
import AdminLayout from "@/components/admin/AdminLayout";
import { Loader2 } from "lucide-react";

type AdminDashboardProps = {
  onBackToPortal: () => void;
};

export default function AdminDashboard({ onBackToPortal }: AdminDashboardProps) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
          <p className="font-mono text-xs uppercase tracking-wider text-slate-500">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="relative">
        <button 
          onClick={onBackToPortal}
          className="absolute top-6 left-6 text-sm font-medium text-slate-500 hover:text-slate-900 flex items-center gap-2"
        >
          ← Back to Site
        </button>
        <AuthScreen onLogin={setSession} />
      </div>
    );
  }

  return (
    <AdminLayout 
      session={session} 
      onLogout={() => supabase.auth.signOut()} 
      onBackToPortal={onBackToPortal} 
    />
  );
}
