"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left - Visual */}
      <div className="hidden lg:flex flex-1 bg-linen items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative diagonal lines */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
          backgroundImage: "repeating-linear-gradient(45deg, #B8860B 0, #B8860B 1px, transparent 0, transparent 50%)",
          backgroundSize: "40px 40px",
        }} />

        <div className="relative z-10 text-center">
          <div className="w-16 h-16 bg-amber flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-ivory" />
          </div>
          <h2 className="text-4xl font-display font-bold text-espresso mb-3 tracking-tight">
            YOUR FACE
            <br />
            IS NOT A{" "}
            <span className="text-gradient-gold">TREND.</span>
          </h2>
          <p className="text-coffee text-sm max-w-xs mx-auto font-body mt-4">
            AI analysis that runs in your browser. Zero server calls. Your data stays yours.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {[
              { val: "478", label: "POINTS" },
              { val: "0", label: "SERVERS" },
              { val: "FREE", label: "FOREVER" },
            ].map((s) => (
              <div key={s.label} className="vintage-border p-3">
                <div className="text-lg font-display font-bold text-amber">{s.val}</div>
                <div className="text-[0.5rem] font-mono text-coffee tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Corner ornaments */}
        <div className="absolute top-6 left-6 w-6 h-6 border-l-2 border-t-2 border-amber/40" />
        <div className="absolute bottom-6 right-6 w-6 h-6 border-r-2 border-b-2 border-amber/40" />
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-parchment">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-10">
            <div className="w-7 h-7 bg-amber flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-ivory" />
            </div>
            <span className="text-sm font-display font-bold text-espresso tracking-wider">AURASTYLE</span>
          </Link>

          <span className="section-number">AUTH // LOGIN</span>
          <h1 className="mt-2 text-2xl font-display font-bold text-espresso tracking-tight">WELCOME BACK.</h1>
          <p className="text-coffee mt-1 font-body text-sm mb-8">Sign in to continue your style journey.</p>

          <div className="space-y-4">
            <div>
              <label className="text-[0.65rem] font-mono text-coffee tracking-widest mb-1.5 block">EMAIL</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-cream border border-tan text-sm text-espresso placeholder:text-coffee/50 focus:outline-none focus:border-amber transition-colors font-body"
                />
              </div>
            </div>

            <div>
              <label className="text-[0.65rem] font-mono text-coffee tracking-widest mb-1.5 block">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-cream border border-tan text-sm text-espresso placeholder:text-coffee/50 focus:outline-none focus:border-amber transition-colors font-body"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee hover:text-espresso transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button className="w-full btn-gold justify-center">
              SIGN IN
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-tan" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-parchment px-3 text-coffee font-mono text-[0.6rem] tracking-widest">OR</span>
              </div>
            </div>

            <button className="w-full py-3 bg-cream border border-tan text-espresso font-mono text-sm hover:border-amber transition-colors">
              GOOGLE
            </button>
          </div>

          <p className="text-xs text-coffee font-body text-center mt-8">
            NO ACCOUNT?{" "}
            <Link href="/signup" className="text-amber hover:text-amber-light transition-colors font-bold">
              SIGN UP →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
