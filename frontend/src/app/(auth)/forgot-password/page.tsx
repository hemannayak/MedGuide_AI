"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, Button } from "react-aria-components";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { AuthTextField } from "@/components/auth/auth-text-field";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call — backend endpoint not yet implemented
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);

    // Navigate to verification page with email context
    router.push(`/verify-email?email=${encodeURIComponent(email)}&type=reset`);
  };

  return (
    <div
      className="min-h-[85vh] flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="auth-card auth-animate-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="auth-icon-box">
            <KeyRound className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1
            className="font-semibold text-2xl mb-2"
            style={{ color: "var(--ink)" }}
          >
            Forgot password?
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No worries, we&apos;ll send you reset instructions.
          </p>
        </div>

        {/* Form */}
        <Form onSubmit={handleSubmit} className="space-y-4" validationBehavior="native">
          <AuthTextField
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="Enter your email"
            icon={<Mail className="w-4 h-4" aria-hidden="true" />}
            isRequired
            autoComplete="email"
          />

          <Button
            type="submit"
            isDisabled={loading || !email.trim()}
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
                Sending...
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </Form>

        {/* Back to login */}
        <div className="flex justify-center mt-6">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            style={{ color: "var(--muted)" }}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Back to log in
          </Link>
        </div>
      </div>
    </div>
  );
}
