"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Phone,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  HeartPulse,
  User as UserIcon,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { UserRole } from "@/types/user";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [preferredLang, setPreferredLang] = useState<"en" | "hi" | "te">("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.register({
        full_name: fullName,
        email,
        phone_number: phone,
        password,
        role,
        preferred_language: preferredLang,
      });

      if (res.success && res.data) {
        if (typeof window !== "undefined") {
          localStorage.setItem("medguide_token", res.data.access_token);
        }
        router.push("/onboarding");
      } else {
        setError(
          res.message || "Registration failed. Please check your information."
        );
      }
    } catch {
      setError("Server error during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full pr-4 py-3 min-h-[48px] rounded-lg border text-sm
    bg-white dark:bg-slate-900
    text-slate-900 dark:text-slate-100
    placeholder:text-slate-400
    focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
    transition-colors
  `;

  const labelClass = "block text-sm font-medium mb-1.5";

  return (
    <div
      className="min-h-[85vh] flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ backgroundColor: "var(--teal)" }}
          >
            <HeartPulse className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <span className="font-semibold text-xl" style={{ color: "var(--ink)" }}>
            MedGuide <span style={{ color: "var(--teal)" }}>AI</span>
          </span>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1
            className="font-semibold text-2xl mb-2"
            style={{ color: "var(--ink)" }}
          >
            Create your account
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Free access to AI health guidance and symptom triage
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mb-5 p-3 rounded-lg border flex items-start gap-2 text-sm"
            style={{
              backgroundColor: "var(--emergency-bg)",
              borderColor: "var(--emergency-border)",
              color: "var(--emergency)",
            }}
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Full name */}
          <div>
            <label
              htmlFor="full-name"
              className={labelClass}
              style={{ color: "var(--ink-secondary)" }}
            >
              Full name
            </label>
            <div className="relative">
              <UserIcon
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--muted-light)" }}
                aria-hidden="true"
              />
              <input
                id="full-name"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ramesh Kumar"
                className={`${inputClass} pl-10`}
                style={{ borderColor: "var(--border)" }}
              />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="email"
                className={labelClass}
                style={{ color: "var(--ink-secondary)" }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--muted-light)" }}
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputClass} pl-10`}
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className={labelClass}
                style={{ color: "var(--ink-secondary)" }}
              >
                Phone{" "}
                <span style={{ color: "var(--muted-light)" }}>(optional)</span>
              </label>
              <div className="relative">
                <Phone
                  className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--muted-light)" }}
                  aria-hidden="true"
                />
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className={`${inputClass} pl-10`}
                  style={{ borderColor: "var(--border)" }}
                />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="reg-password"
              className={labelClass}
              style={{ color: "var(--ink-secondary)" }}
            >
              Password
            </label>
            <div className="relative">
              <Lock
                className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--muted-light)" }}
                aria-hidden="true"
              />
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className={`${inputClass} pl-10 pr-12`}
                style={{ borderColor: "var(--border)" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded"
                style={{ color: "var(--muted)" }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Account type + Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="account-type"
                className={labelClass}
                style={{ color: "var(--ink-secondary)" }}
              >
                Account type
              </label>
              <select
                id="account-type"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-3 min-h-[48px] rounded-lg border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                style={{ borderColor: "var(--border)" }}
              >
                <option value={UserRole.PATIENT}>Patient / Citizen</option>
                <option value={UserRole.HEALTHCARE_WORKER}>
                  ASHA / ANM Worker
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="preferred-lang"
                className={labelClass}
                style={{ color: "var(--ink-secondary)" }}
              >
                Preferred language
              </label>
              <select
                id="preferred-lang"
                value={preferredLang}
                onChange={(e) =>
                  setPreferredLang(e.target.value as "en" | "hi" | "te")
                }
                className="w-full px-3 py-3 min-h-[48px] rounded-lg border text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                style={{ borderColor: "var(--border)" }}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              loading || !fullName.trim() || !email.trim() || !password.trim()
            }
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white min-h-[48px] text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            style={{ backgroundColor: "var(--teal)" }}
            onMouseEnter={(e) => {
              if (!loading)
                e.currentTarget.style.backgroundColor = "var(--teal-hover)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--teal)";
            }}
          >
            {loading ? (
              <>
                <span className="loading-dots">
                  <span />
                  <span />
                  <span />
                </span>
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>

        {/* Sign in link */}
        <p
          className="text-sm text-center mt-6"
          style={{ color: "var(--muted)" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: "var(--teal)" }}
          >
            Sign in
          </Link>
        </p>

        {/* Legal */}
        <div
          className="flex items-center justify-center gap-4 mt-8 text-xs"
          style={{ color: "var(--muted-light)" }}
        >
          <Link href="/legal/privacy" className="hover:underline">
            Privacy
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/legal/terms" className="hover:underline">
            Terms
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/legal/disclaimer" className="hover:underline">
            Medical Disclaimer
          </Link>
        </div>
      </div>
    </div>
  );
}
