"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, Loader2, Send } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err) setError(err);
  }, []);

  const isEmailNotConfirmed = error?.toLowerCase().includes("not confirmed") ?? false;

  async function handleResend() {
    if (!email) {
      setError("Enter your email first, then click resend.");
      return;
    }
    setResending(true);
    setError(null);
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResending(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setResent(true);
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left - Visual */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-1 bg-light-elevated dark:bg-cosmic-elevated items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(45deg, #B98B56 0, #B98B56 1px, transparent 0, transparent 50%)",
          backgroundSize: "40px 40px",
        }} />

        <div className="absolute top-20 left-20 w-72 h-72 bg-nexus-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-aurum-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-aurum-500 to-aurum-300 flex items-center justify-center mx-auto mb-6 rounded-sm shadow-lg shadow-aurum-500/25">
            <Sparkles className="w-9 h-9 text-cosmic-base" />
          </div>
          <h2 className="text-4xl font-body font-bold text-nexus-800 dark:text-white mb-3 tracking-tight">
            YOUR FACE
            <br />
            IS NOT A{" "}
            <span className="text-gradient-aurum">TREND.</span>
          </h2>
          <p className="text-nexus-600 dark:text-nexus-200 text-sm max-w-xs mx-auto font-body mt-4">
            AI analysis that runs in your browser. Zero server calls. Your data stays yours.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {[
              { val: "478", label: "POINTS" },
              { val: "0", label: "SERVERS" },
              { val: "FREE", label: "FOREVER" },
            ].map((s) => (
              <div key={s.label} className="border border-light-border dark:border-cosmic-border p-3 rounded-sm bg-light-surface/50 dark:bg-cosmic-surface/50 backdrop-blur-sm">
                <div className="text-lg font-body font-bold text-aurum-500">{s.val}</div>
                <div className="text-[0.5rem] font-mono text-nexus-400 dark:text-cosmic-muted tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-6 left-6 w-6 h-6 border-l-2 border-t-2 border-aurum-500/40" />
        <div className="absolute bottom-6 right-6 w-6 h-6 border-r-2 border-b-2 border-aurum-500/40" />
      </motion.div>

      {/* Right - Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex items-center justify-center p-6 bg-light-base dark:bg-cosmic-base"
      >
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-7 h-7 bg-gradient-to-br from-aurum-500 to-aurum-300 flex items-center justify-center rounded-sm">
              <Sparkles className="w-3.5 h-3.5 text-cosmic-base" />
            </div>
            <span className="text-sm font-body font-bold text-nexus-800 dark:text-white tracking-wider">AURAYA</span>
          </Link>

          <span className="section-number">AUTH // LOGIN</span>
          <h1 className="mt-2 text-2xl font-body font-bold text-nexus-800 dark:text-white tracking-tight">WELCOME BACK.</h1>
          <p className="text-nexus-400 dark:text-cosmic-muted mt-1 font-body text-sm mb-8">Sign in to continue your style journey.</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-body mb-2 rounded-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{error}</span>
            </div>
          )}
          {resent && (
            <div className="flex items-center gap-2 p-3 bg-aurum-500/10 border border-aurum-500/30 text-aurum-600 dark:text-aurum-400 text-xs font-body mb-2 rounded-sm">
              <Send className="w-4 h-4 shrink-0" />
              Confirmation email resent. Check your inbox and spam folder.
            </div>
          )}
          {isEmailNotConfirmed && (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2.5 mb-2 bg-aurum-500/10 border border-aurum-500/40 text-aurum-600 dark:text-aurum-400 font-mono text-xs tracking-widest hover:bg-aurum-500/20 transition-colors disabled:opacity-50 rounded-sm"
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "RESEND CONFIRMATION EMAIL"
              )}
            </button>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-[0.65rem] font-mono text-nexus-400 dark:text-cosmic-muted tracking-widest mb-1.5 block">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-400 dark:text-cosmic-muted" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-light-surface dark:bg-cosmic-surface border border-light-border dark:border-cosmic-border text-sm text-nexus-800 dark:text-white placeholder:text-nexus-400/50 dark:placeholder:text-cosmic-muted/50 focus:outline-none focus:border-aurum-500 transition-colors font-body rounded-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[0.65rem] font-mono text-nexus-400 dark:text-cosmic-muted tracking-widest mb-1.5 block">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-400 dark:text-cosmic-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 bg-light-surface dark:bg-cosmic-surface border border-light-border dark:border-cosmic-border text-sm text-nexus-800 dark:text-white placeholder:text-nexus-400/50 dark:placeholder:text-cosmic-muted/50 focus:outline-none focus:border-aurum-500 transition-colors font-body rounded-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-400 dark:text-cosmic-muted hover:text-nexus-800 dark:hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-nexus justify-center disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "SIGN IN"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-light-border dark:border-cosmic-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-light-base dark:bg-cosmic-base px-3 text-nexus-400 dark:text-cosmic-muted font-mono text-[0.6rem] tracking-widest">OR</span>
            </div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full py-3 bg-light-surface dark:bg-cosmic-surface border border-light-border dark:border-cosmic-border text-nexus-800 dark:text-white font-mono text-sm hover:border-aurum-500 transition-colors disabled:opacity-50 rounded-sm"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "GOOGLE"}
          </button>

          <p className="text-xs text-nexus-400 dark:text-cosmic-muted font-body text-center mt-8">
            NO ACCOUNT?{" "}
            <Link href="/signup" className="text-aurum-500 hover:text-aurum-400 transition-colors font-bold">
              SIGN UP →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
