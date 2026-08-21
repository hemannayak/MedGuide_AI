"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HeartPulse, Mail, Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { MedButton } from "@/components/ui/med-button";

interface MedGuideAuthProps {
  mode: "login" | "register";
}

export const MedGuideAuth: React.FC<MedGuideAuthProps> = ({ mode }) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/app/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white border border-[#161A24]/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-[#1C1917] text-white shadow-xs">
              <HeartPulse className="w-5 h-5 text-amber-200" />
            </div>
            <span className="font-semibold text-xl tracking-tight text-[#1C1917]">
              MedGuide <span className="text-[#8C6D46]">AI</span>
            </span>
          </Link>

          <h1 className="font-serif text-2xl text-[#161A24]">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>

          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {mode === "login"
              ? "Sign in to access your health timeline and AI companion"
              : "Register to get personalized multilingual primary care guidance"}
          </p>
        </div>

        {/* OAuth Button */}
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              router.push("/app/dashboard");
            }, 800);
          }}
          className="w-full min-h-[48px] py-3 px-4 rounded-full border border-slate-200 bg-white text-slate-700 font-semibold text-xs flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.29v3.15C3.26 21.3 7.37 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.29C.47 8.21 0 10.05 0 12s.47 3.79 1.29 5.42l3.99-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.58l3.99 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-100 w-full" />
          <span className="bg-white px-3 text-[11px] text-slate-400 uppercase tracking-widest font-semibold absolute">
            or email
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-10 pr-4 min-h-[48px] py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 min-h-[48px] py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 min-h-[48px] py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
              />
            </div>
          </div>

          <MedButton
            variant="primary"
            size="lg"
            className="w-full justify-center min-h-[48px] text-xs font-bold mt-2"
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <span className="flex items-center gap-1.5">
                {mode === "login" ? "Sign In" : "Create Account"}{" "}
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </MedButton>
        </form>

        {/* Footer links */}
        <div className="pt-2 text-center text-xs text-slate-500">
          {mode === "login" ? (
            <span>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold text-[#0F766E] hover:underline">
                Sign up
              </Link>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-[#0F766E] hover:underline">
                Sign in
              </Link>
            </span>
          )}
        </div>

        {/* Privacy badge */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>Encrypted patient authentication</span>
        </div>
      </div>
    </div>
  );
};
