"use client";

import React from "react";
import { RiskLevel } from "@/types/symptom";

interface MedBadgeProps {
  level: RiskLevel | "ROUTINE" | "URGENT" | "EMERGENCY" | string;
  size?: "sm" | "md";
}

export const MedBadge: React.FC<MedBadgeProps> = ({ level, size = "md" }) => {
  const normLevel = String(level).toUpperCase();

  const styles: Record<string, { bg: string; text: string; border: string }> = {
    ROUTINE: {
      bg: "bg-emerald-50",
      text: "text-emerald-800",
      border: "border-emerald-200",
    },
    URGENT: {
      bg: "bg-amber-50",
      text: "text-amber-800",
      border: "border-amber-200",
    },
    EMERGENCY: {
      bg: "bg-red-50",
      text: "text-red-700 font-bold",
      border: "border-red-300",
    },
  };

  const style = styles[normLevel] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  };

  const sizeClasses = size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          normLevel === "EMERGENCY"
            ? "bg-red-600 animate-ping"
            : normLevel === "URGENT"
            ? "bg-amber-500"
            : "bg-emerald-600"
        }`}
      />
      {normLevel}
    </span>
  );
};
