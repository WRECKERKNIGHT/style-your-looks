"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Mail, Lock, User, Eye, EyeOff } from "lucide-react";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left - Visual */}
      <div className="hidden lg:flex flex-1 bg-[#3C2A21] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3C2A21] via-[#2B1E16] to-[#3C2A21]" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#C89D7C]/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-[#C89D7C]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Start Your Style Journey</h2>
          <p className="text-[#C89D7C] text-lg max-w-sm">
            Join thousands discovering their perfect look with AI-powered analysis.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm mx-auto">
            {["478 Points", "0 Photos Saved", "100% Free"].map((stat) => (
              <div key={stat} className="bg-white/10 rounded-xl p-3">
                <span className="text-xs text-[#C89D7C] font-medium">{stat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#3C2A21] flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-[#C89D7C]" />
            </div>
            <span className="text-xl font-bold text-[#3C2A21]">
              Aura<span className="text-[#C89D7C]">Style</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-[#3C2A21] mb-1">Create your account</h1>
          <p className="text-[#8B7D6B] mb-8">Free forever. No credit card required.</p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#3C2A21] mb-1.5 block">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8B7D6B]" />
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-[#E8E0D8] rounded-xl text-sm text-[#3C2A21] placeholder:text-[#8B7D6B] focus:outline-none focus:border-[#C89D7C] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#3C2A21] mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8B7D6B]" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FDFBF7] border border-[#E8E0D8] rounded-xl text-sm text-[#3C2A21] placeholder:text-[#8B7D6B] focus:outline-none focus:border-[#C89D7C] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#3C2A21] mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#8B7D6B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-10 py-3 bg-[#FDFBF7] border border-[#E8E0D8] rounded-xl text-sm text-[#3C2A21] placeholder:text-[#8B7D6B] focus:outline-none focus:border-[#C89D7C] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7D6B] hover:text-[#3C2A21]"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <button className="w-full py-3 bg-[#3C2A21] text-white rounded-xl font-medium hover:bg-[#2B1E16] transition-colors">
              Create Account
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E8E0D8]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-[#8B7D6B]">or continue with</span>
              </div>
            </div>

            <button className="w-full py-3 bg-[#F4EFEA] text-[#3C2A21] rounded-xl font-medium hover:bg-[#EDE5DC] transition-colors text-sm">
              Continue with Google
            </button>
          </div>

          <p className="text-sm text-[#8B7D6B] text-center mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-[#C89D7C] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
