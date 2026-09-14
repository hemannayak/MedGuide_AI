"use client";

import React from "react";

interface MedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "hero";
  children: React.ReactNode;
  icon?: React.ReactNode;
  useSerif?: boolean;
}

export const MedButton: React.FC<MedButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  icon,
  useSerif = true,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 transition-all cursor-pointer rounded-full box-border select-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const fontClasses = "font-serif text-lg sm:text-xl font-normal tracking-tight";

  const sizeClasses = {
    sm: "px-4 h-10 text-xs sm:text-sm min-w-[100px]",
    md: "px-6 h-12 text-sm sm:text-base min-w-[120px]",
    lg: "px-8 h-13 text-base min-w-[140px]",
    hero: "px-9 sm:px-10 h-14 sm:h-[58px] text-base sm:text-lg min-w-[160px]",
  };

  const variantClasses = {
    primary:
      "bg-[#222533] text-white hover:bg-[#181A25] shadow-md shadow-[#222533]/15 hover:shadow-lg hover:-translate-y-0.5 border border-[#222533]",
    secondary:
      "bg-[#F4F5F9] text-[#222533] border border-slate-300/80 hover:border-slate-400 hover:bg-white shadow-2xs hover:-translate-y-0.5",
    outline:
      "bg-transparent text-slate-900 border border-slate-300 hover:bg-slate-100",
    danger:
      "bg-red-600 text-white hover:bg-red-700 shadow-md shadow-red-900/10 hover:-translate-y-0.5 border border-red-600",
    ghost:
      "bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60",
  };

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${fontClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
