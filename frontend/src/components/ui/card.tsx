import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  /** When true, renders with no shadow, just a subtle border */
  flat?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  title,
  subtitle,
  footer,
  flat = false,
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-6 ${
        flat ? "" : "shadow-sm"
      } transition-shadow hover:shadow-md ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-5">
          {title && (
            <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 leading-snug">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--muted)" }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      <div>{children}</div>
      {footer && (
        <div
          className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800"
        >
          {footer}
        </div>
      )}
    </div>
  );
};
