"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Button } from "react-aria-components";
import {
  Lock,
  Mail,
  Phone,
  ArrowRight,
  AlertCircle,
  HeartPulse,
  User as UserIcon,
} from "lucide-react";
import { api } from "@/lib/api/client";
import { UserRole } from "@/types/user";
import { AuthTextField } from "@/components/auth/auth-text-field";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.PATIENT);
  const [preferredLang, setPreferredLang] = useState<"en" | "hi" | "te">("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

  const selectClass =
    "w-full px-3 py-3 min-h-[48px] rounded-lg border border-slate-200 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E] transition-colors";

  return (
    <div
      className="min-h-[85vh] flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="auth-card auth-animate-in">
        {/* Brand Icon */}
        <div className="flex justify-center mb-6">
          <Link
            href="/"
            className="auth-icon-box"
            style={{ backgroundColor: "var(--teal)" }}
            aria-label="MedGuide AI Home"
          >
            <HeartPulse className="w-6 h-6 text-white" aria-hidden="true" />
          </Link>
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
        <Form onSubmit={handleSubmit} className="space-y-4" validationBehavior="native">
          {/* Full name */}
          <AuthTextField
            label="Full name"
            name="full-name"
            type="text"
            value={fullName}
            onChange={setFullName}
            placeholder="Ramesh Kumar"
            icon={<UserIcon className="w-4 h-4" aria-hidden="true" />}
            isRequired
            autoComplete="name"
          />

          {/* Email + Phone row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AuthTextField
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" aria-hidden="true" />}
              isRequired
              autoComplete="email"
            />

            <AuthTextField
              label="Phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={setPhone}
              placeholder="+91 98765 43210"
              icon={<Phone className="w-4 h-4" aria-hidden="true" />}
              autoComplete="tel"
              description="Optional"
            />
          </div>

          {/* Password */}
          <AuthTextField
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Minimum 8 characters"
            icon={<Lock className="w-4 h-4" aria-hidden="true" />}
            isRequired
            autoComplete="new-password"
          />

          {/* Account type + Language row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="account-type"
                className="block text-sm font-medium text-slate-700"
              >
                Account type
              </label>
              <select
                id="account-type"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className={selectClass}
              >
                <option value={UserRole.PATIENT}>Patient / Citizen</option>
                <option value={UserRole.HEALTHCARE_WORKER}>
                  ASHA / ANM Worker
                </option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="preferred-lang"
                className="block text-sm font-medium text-slate-700"
              >
                Preferred language
              </label>
              <select
                id="preferred-lang"
                value={preferredLang}
                onChange={(e) =>
                  setPreferredLang(e.target.value as "en" | "hi" | "te")
                }
                className={selectClass}
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            isDisabled={
              loading || !fullName.trim() || !email.trim() || !password.trim()
            }
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white min-h-[48px] text-sm
              transition-all cursor-pointer
              disabled:opacity-50 disabled:cursor-not-allowed
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F766E]
              hover:opacity-90 pressed:scale-[0.98] mt-2"
            style={{ backgroundColor: "var(--teal)" }}
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
          </Button>
        </Form>

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
          className="flex items-center justify-center gap-4 mt-6 pt-5 border-t text-xs"
          style={{ borderColor: "var(--border)", color: "var(--muted-light)" }}
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
