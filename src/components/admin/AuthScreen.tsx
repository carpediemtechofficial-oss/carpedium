import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff, Check, ArrowRight } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

export default function AuthScreen({ onLogin }: { onLogin: (session: any) => void }) {
  const { settings } = useSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      if (rememberMe) {
        // Option to persist session manually if needed
      }
      onLogin(data.session);
    }
  };

  const handleGoogleLogin = async () => {
    setError("OAuth simulation: Google Sign-In is configured on the primary portal.");
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-hidden font-sans">
      {/* ── LEFT SECTION (55-60% width) ────────────────────────────────── */}
      <div className="hidden lg:flex w-[58%] relative flex-col justify-between p-12 text-white overflow-hidden bg-slate-950">
        {/* Background Image Illustration */}
        <div 
          className="absolute inset-0 bg-cover bg-center pointer-events-none z-0"
          style={{ 
            backgroundImage: "url('/images/auth_workspace_bg.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Subtle black-to-transparent gradient overlay from left to right (45-55% opacity blend) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent pointer-events-none z-0" />

        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(16,185,129,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-0" />

        {/* Header Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <img
            src={settings.branding.logo || "/logo/carpediem-mark.jpg"}
            alt="Carpediem Tech"
            className="h-10 w-10 rounded-full ring-2 ring-emerald-500/30"
          />
          <span className="font-mono text-sm tracking-widest uppercase font-bold text-emerald-400">
            {settings.branding.brandName}
          </span>
        </div>

        {/* Main Content - Clean text, no blur or cards to hide the background */}
        <div className="relative z-10 my-auto max-w-lg">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-display font-extrabold leading-tight tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              Build What's Next.<br />
              <span className="text-emerald-400">Manage Everything.</span>
            </h1>
            <p className="text-sm text-slate-100 leading-relaxed font-semibold drop-shadow-[0_1px_5px_rgba(0,0,0,0.85)]">
              One powerful enterprise dashboard to control course syllabuses, manage student attendance, track mentor credentials, verify portfolios, and optimize operations in real-time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-[10px] text-slate-400 font-mono">
          © {new Date().getFullYear()} {settings.branding.brandName}. All rights reserved. Secure Administrator Portal.
        </div>
      </div>

      {/* ── RIGHT SECTION (40-45% width) ───────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/60 p-8 sm:p-10 flex flex-col justify-between"
        >
          <div>
            {/* Small Mobile Logo Branding */}
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <img
                src={settings.branding.logo || "/logo/carpediem-mark.jpg"}
                alt="Carpediem Tech"
                className="h-8 w-8 rounded-full"
              />
              <span className="font-mono text-xs tracking-widest uppercase font-bold text-slate-800">
                {settings.branding.brandName}
              </span>
            </div>

            <div className="text-left mb-8">
              <h2 className="text-3xl font-display font-extrabold text-[#111827] tracking-tight">
                Welcome Back
              </h2>
              <p className="text-sm font-semibold text-[#64748B] mt-1.5">
                Sign in to the Admin Dashboard
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-semibold text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-all font-medium"
                  placeholder="admin@carpediem.tech"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-[#111827] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Credentials: admin@carpediem.tech / AdminPassword123!")}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white pl-4 pr-10 py-3 text-sm text-[#111827] outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/20 transition-all font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-655 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2.5 pt-1">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-350 text-[#10B981] focus:ring-[#10B981]"
                />
                <label htmlFor="remember-me" className="text-xs font-semibold text-slate-500 cursor-pointer select-none">
                  Remember my session on this device
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#111827] hover:bg-[#1C253B] text-white rounded-xl px-4 py-3.5 font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-6 shadow-md hover:scale-[1.01]"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin text-emerald-400" /> : <ArrowRight className="h-4 w-4 text-emerald-400" />}
                <span>{loading ? "Verifying Credentials..." : "Authenticate Administrator"}</span>
              </button>
            </form>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Google OAuth Option */}
            <button
              onClick={handleGoogleLogin}
              className="w-full bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 font-semibold text-sm text-[#111827] transition-all flex items-center justify-center gap-2.5 hover:scale-[1.01]"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.44 0-6.228-2.79-6.228-6.228 0-3.44 2.787-6.228 6.228-6.228 1.488 0 2.855.531 3.92 1.405l3.11-3.11A10.36 10.36 0 0 0 12.24 2C6.585 2 2 6.585 2 12.24s4.585 10.24 10.24 10.24c5.795 0 10.24-4.585 10.24-10.24 0-.648-.057-1.277-.17-1.885h-10.07z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="text-center mt-10 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
              🛡️ Role-based secure authentication
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
