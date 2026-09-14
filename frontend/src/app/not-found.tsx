"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div
      className="min-h-[80vh] flex items-center justify-center px-4 py-16"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="auth-animate-in max-w-lg text-center">
        {/* 404 label */}
        <p
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--teal)" }}
        >
          404 error
        </p>

        {/* Heading */}
        <h1
          className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal mb-6"
          style={{ color: "var(--ink)" }}
        >
          We can&apos;t find that page
        </h1>

        {/* Description */}
        <p
          className="text-base sm:text-lg mb-10 max-w-md mx-auto"
          style={{ color: "var(--muted)" }}
        >
          Sorry, the page you are looking for doesn&apos;t exist or has been
          moved.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm min-h-[48px] min-w-[140px]
              border transition-all cursor-pointer
              hover:bg-slate-50 pressed:scale-[0.98]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F766E]"
            style={{
              color: "var(--ink)",
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
            }}
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Go back
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-white text-sm min-h-[48px] min-w-[140px]
              transition-all hover:opacity-90
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0F766E]"
            style={{ backgroundColor: "var(--teal)" }}
          >
            Take me home
          </Link>
        </div>
      </div>
    </div>
  );
}
