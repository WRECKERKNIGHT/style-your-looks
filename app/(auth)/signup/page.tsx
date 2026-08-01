"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff, Sparkles, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogleSignup() {
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-base dark:bg-cosmic-base p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <div className="w-16 h-16 bg-aurum-600/20 flex items-center justify-center mx-auto mb-6 rounded-sm">
            <CheckCircle2 className="w-8 h-8 text-aurum-600" />
          </div>
          <h1 className="text-2xl font-body font-bold text-nexus-800 dark:text-white tracking-tight mb-2">CHECK YOUR EMAIL.</h1>
          <p className="text-nexus-400 dark:text-cosmic-muted font-body text-sm mb-6">
            We sent a confirmation link to <span className="font-bold text-nexus-800 dark:text-white">{email}</span>. Click it to activate your account.
          </p>
          <Link href="/login" className="btn-nexus inline-flex">
            BACK TO LOGIN
          </Link>
        </motion.div>
      </div>
    );
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
          backgroundImage: "repeating-linear-gradient(-45deg, #6C2BD9 0, #6C2BD9 1px, transparent 0, transparent 50%)",
          backgroundSize: "40px 40px",
        }} />

        <div className="absolute top-20 left-20 w-72 h-72 bg-aurum-500/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-nexus-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-nexus-400 to-nexus-500 flex items-center justify-center mx-auto mb-6 rounded-sm shadow-lg shadow-nexus-400/25">
            <Sparkles className="w-9 h-9 text-white" />
          </div>
          <h2 className="text-4xl font-body font-bold text-nexus-800 dark:text-white mb-3 tracking-tight">
            YOUR BODY
            <br />
            IS NOT AN{" "}
            <span className="text-nexus-400">ALGORITHM.</span>
          </h2>
          <p className="text-nexus-600 dark:text-nexus-200 text-sm max-w-xs mx-auto font-body mt-4">
            Join thousands discovering their perfect look. Free forever.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {[
              { val: "478", label: "FACE POINTS" },
              { val: "15+", label: "BEARD STYLES" },
              { val: "100%", label: "ON-DEVICE" },
            ].map((s) => (
              <div key={s.label} className="border border-light-border dark:border-cosmic-border p-3 rounded-sm bg-light-surface/50 dark:bg-cosmic-surface/50 backdrop-blur-sm">
                <div className="text-lg font-body font-bold text-nexus-400">{s.val}</div>
                <div className="text-[0.5rem] font-mono text-nexus-400 dark:text-cosmic-muted tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-6 left-6 w-6 h-6 border-l-2 border-t-2 border-nexus-400/40" />
        <div className="absolute bottom-6 right-6 w-6 h-6 border-r-2 border-b-2 border-nexus-400/40" />
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
            <span className="text-sm font-body font-bold text-nexus-800 dark:text-white tracking-wider">NEXARI</span>
          </Link>

          <span className="section-number">AUTH // SIGNUP</span>
          <h1 className="mt-2 text-2xl font-body font-bold text-nexus-800 dark:text-white tracking-tight">CREATE ACCOUNT.</h1>
          <p className="text-nexus-400 dark:text-cosmic-muted mt-1 font-body text-sm mb-8">Free forever. No credit card. No BS.</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-body mb-4 rounded-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label className="text-[0.65rem] font-mono text-nexus-400 dark:text-cosmic-muted tracking-widest mb-1.5 block">NAME</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-400 dark:text-cosmic-muted" />
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-light-surface dark:bg-cosmic-surface border border-light-border dark:border-cosmic-border text-sm text-nexus-800 dark:text-white placeholder:text-nexus-400/50 dark:placeholder:text-cosmic-muted/50 focus:outline-none focus:border-aurum-500 transition-colors font-body rounded-sm"
                />
              </div>
            </div>

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
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "CREATE ACCOUNT"}
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
            onClick={handleGoogleSignup}
            disabled={googleLoading}
            className="w-full py-3 bg-light-surface dark:bg-cosmic-surface border border-light-border dark:border-cosmic-border text-nexus-800 dark:text-white font-mono text-sm hover:border-aurum-500 transition-colors disabled:opacity-50 rounded-sm"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "GOOGLE"}
          </button>

          <p className="text-xs text-nexus-400 dark:text-cosmic-muted font-body text-center mt-8">
            ALREADY HAVE AN ACCOUNT?{" "}
            <Link href="/login" className="text-aurum-500 hover:text-aurum-400 transition-colors font-bold">
              SIGN IN →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
