"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Send } from "lucide-react";
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
    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (resendError) {
        setError(resendError.message);
        return;
      }
      setResent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend confirmation email.");
    } finally {
      setResending(false);
    }
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) setError(error.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start Google sign-in.");
    } finally {
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/auraya-logo.svg"
            alt="AURAYA"
            className="h-12 w-auto mx-auto mb-8 drop-shadow-aurum"
          />
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/auraya-logo.svg"
              alt="AURAYA"
              className="h-7 w-auto drop-shadow-aurum"
            />
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
            className="w-full py-3 bg-light-surface dark:bg-cosmic-surface border border-light-border dark:border-cosmic-border text-nexus-800 dark:text-white font-mono text-sm hover:border-aurum-500 transition-colors disabled:opacity-50 rounded-sm flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                  <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.7l6.2 5.2C41 39.6 44 35 44 24c0-1.3-.1-2.6-.4-3.9z" />
                </svg>
                CONTINUE WITH GOOGLE
              </>
            )}
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
