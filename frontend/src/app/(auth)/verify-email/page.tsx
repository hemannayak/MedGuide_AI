"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "react-aria-components";
import { Mail, ArrowLeft, ArrowRight } from "lucide-react";
import { OtpInput } from "@/components/auth/otp-input";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "your email";
  const type = searchParams.get("type") || "register"; // "register" | "reset"

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleVerify = useCallback(async () => {
    if (otp.length < 6) return;
    setLoading(true);

    // Simulate API call — backend verification endpoint not yet implemented
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);

    if (type === "reset") {
      // Navigate to login after password reset verification
      router.push("/login");
    } else {
      // Navigate to onboarding after registration verification
      router.push("/onboarding");
    }
  }, [otp, type, router]);

  const handleResend = useCallback(() => {
    if (resendCountdown > 0) return;
    setResendCountdown(60);
    // Simulate resend — backend endpoint not yet implemented
  }, [resendCountdown]);

  return (
    <div
      className="min-h-[85vh] flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="auth-card auth-animate-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="auth-icon-box">
            <Mail className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-8">
          <h1
            className="font-semibold text-2xl mb-2"
            style={{ color: "var(--ink)" }}
          >
            Check your email
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            We sent a verification {type === "reset" ? "code" : "link"} to
          </p>
          <p
            className="text-sm font-medium mt-1"
            style={{ color: "var(--ink)" }}
          >
            {email}
          </p>
        </div>

        {!showOtp ? (
          /* Initial state — prompt to enter code */
          <div className="space-y-4">
            <Button
              onPress={() => setShowOtp(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white min-h-[48px] text-sm
                transition-all cursor-pointer
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F766E]
                hover:opacity-90 pressed:scale-[0.98]"
              style={{ backgroundColor: "var(--teal)" }}
            >
              Enter code manually
            </Button>
          </div>
        ) : (
          /* OTP entry state */
          <div className="space-y-5 auth-animate-in">
            <OtpInput
              value={otp}
              onChange={setOtp}
              disabled={loading}
            />

            <Button
              onPress={handleVerify}
              isDisabled={loading || otp.length < 6}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white min-h-[48px] text-sm
                transition-all cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F766E]
                hover:opacity-90 pressed:scale-[0.98]"
              style={{ backgroundColor: "var(--teal)" }}
            >
              {loading ? (
                <>
                  <span className="loading-dots">
                    <span />
                    <span />
                    <span />
                  </span>
                  Verifying...
                </>
              ) : (
                <>
                  Verify
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </Button>

            {/* Resend */}
            <p
              className="text-sm text-center"
              style={{ color: "var(--muted)" }}
            >
              Didn&apos;t receive the code?{" "}
              {resendCountdown > 0 ? (
                <span className="font-medium">
                  Resend in {resendCountdown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
                  style={{ color: "var(--teal)" }}
                >
                  Resend code
                </button>
              )}
            </p>
          </div>
        )}

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

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-[85vh] flex items-center justify-center"
          style={{ backgroundColor: "var(--background)" }}
        >
          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
