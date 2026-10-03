"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Clock, Info, RefreshCw, Sparkles } from "lucide-react";
import { MedButton } from "./med-button";

export interface FeedbackStateProps {
  title: string;
  description?: string;
  variant?: "info" | "success" | "warning" | "error" | "empty";
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const MedFeedbackState: React.FC<FeedbackStateProps> = ({
  title,
  description,
  variant = "info",
  actionLabel,
  onAction,
  className = "",
  icon,
}) => {
  const variantStyles = {
    info: {
      bg: "bg-blue-50 border-blue-200/80 text-blue-950",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
    success: {
      bg: "bg-emerald-50 border-emerald-200/80 text-emerald-950",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-200/80 text-amber-950",
      icon: <Clock className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200/80 text-rose-950",
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    empty: {
      bg: "bg-slate-50 border-slate-200 text-slate-800",
      icon: <Sparkles className="w-5 h-5 text-slate-400 shrink-0" />,
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 text-center flex flex-col items-center justify-center transition-all ${currentVariant.bg} ${className}`}
    >
      <div className="mb-3 rounded-full bg-white/80 p-3 shadow-xs">
        {icon || currentVariant.icon}
      </div>
      <h3 className="font-semibold text-base mb-1 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm opacity-80 max-w-md mx-auto leading-relaxed mb-4">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <MedButton
          variant={variant === "error" ? "secondary" : "primary"}
          size="sm"
          onClick={onAction}
          className="mt-1"
        >
          {variant === "error" && <RefreshCw className="w-3.5 h-3.5 mr-1.5" />}
          {actionLabel}
        </MedButton>
      )}
    </div>
  );
};

export const EmptyState = MedFeedbackState;
export default MedFeedbackState;
