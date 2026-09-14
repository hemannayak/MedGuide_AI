"use client";

import React from "react";
import { WifiOff, AlertTriangle, RefreshCw, Clock } from "lucide-react";

interface SystemStateProps {
  type: "offline" | "slow-network" | "voice-error" | "ai-refusal";
  onRetry?: () => void;
  message?: string;
}

export const MedSystemState: React.FC<SystemStateProps> = ({
  type,
  onRetry,
  message,
}) => {
  if (type === "offline") {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-sm">
        <WifiOff className="w-5 h-5 text-slate-500 shrink-0" />
        <div className="flex-1">
          <div className="font-semibold text-xs text-slate-900">Offline Mode Active</div>
          <div className="text-xs text-slate-600">
            {message || "You are currently offline. Cached timeline and emergency numbers remain available."}
          </div>
        </div>
      </div>
    );
  }

  if (type === "slow-network") {
    return (
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
        <Clock className="w-4 h-4 text-amber-600 shrink-0" />
        <div className="flex-1">
          <span className="font-semibold">Slow Network Detected: </span>
          <span>Your request is processing. Please hold on a moment...</span>
        </div>
      </div>
    );
  }

  if (type === "voice-error") {
    return (
      <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>We couldn&apos;t hear you clearly. Please try speaking again or type your query.</span>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1 font-bold text-amber-800 hover:underline shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs space-y-1">
      <div className="font-bold flex items-center gap-1.5 text-slate-900">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        Safety Safeguard Notice
      </div>
      <p className="text-slate-600 leading-relaxed">
        {message || "This query requires clinical verification. MedGuide AI provides preliminary guidance only."}
      </p>
    </div>
  );
};
