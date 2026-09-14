import React from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";

interface AlertProps {
  type?: "emergency" | "warning" | "info" | "success";
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = "info",
  title,
  children,
  className = "",
}) => {
  const styles = {
    emergency: "bg-red-50 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200",
    warning: "bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200",
    info: "bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-900 dark:text-teal-200",
    success: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200",
  };

  const icons = {
    emergency: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />,
  };

  return (
    <div
      role="alert"
      className={`p-4 border-l-4 rounded-r-lg flex gap-3 shadow-sm ${styles[type]} ${className}`}
    >
      {icons[type]}
      <div className="text-sm space-y-1">
        {title && <h4 className="font-bold text-base leading-tight">{title}</h4>}
        <div>{children}</div>
      </div>
    </div>
  );
};
