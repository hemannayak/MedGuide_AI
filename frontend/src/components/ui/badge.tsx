import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "routine" | "urgent" | "emergency" | "info" | "neutral";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "info",
  className = "",
}) => {
  const styles = {
    routine: "badge-routine font-semibold px-2.5 py-1 text-xs rounded-full inline-flex items-center gap-1",
    urgent: "badge-urgent font-semibold px-2.5 py-1 text-xs rounded-full inline-flex items-center gap-1",
    emergency: "badge-emergency font-bold px-3 py-1.5 text-xs rounded-full inline-flex items-center gap-1 emergency-pulse uppercase tracking-wider",
    info: "bg-amber-50 text-[#8C6D46] dark:bg-stone-800 dark:text-amber-200 border border-amber-200 dark:border-stone-700 font-medium px-2.5 py-1 text-xs rounded-full inline-flex items-center gap-1",
    neutral: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 font-medium px-2.5 py-1 text-xs rounded-full inline-flex items-center gap-1",
  };

  return <span className={`${styles[variant]} ${className}`}>{children}</span>;
};
