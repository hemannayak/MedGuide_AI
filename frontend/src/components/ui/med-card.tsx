"use client";

import React from "react";

interface MedCardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const MedCard: React.FC<MedCardProps> = ({
  children,
  className = "",
  hoverEffect = true,
  padding = "md",
}) => {
  const paddingClasses = {
    none: "p-0",
    sm: "p-4 sm:p-5",
    md: "p-6 sm:p-8",
    lg: "p-8 sm:p-10",
  };

  return (
    <div
      className={`bg-white border border-[#161A24]/10 rounded-2xl shadow-sm ${
        hoverEffect
          ? "transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#0F766E]/20"
          : ""
      } ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
};
