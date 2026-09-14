"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { NavItemData } from "./nav-data";

interface NavItemProps {
  item: NavItemData;
  isActive: boolean;
  isHovered: boolean;
  isClicked: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: (e: React.MouseEvent) => void;
}

export const NavItem: React.FC<NavItemProps> = ({
  item,
  isActive,
  isHovered,
  isClicked,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  return (
    <div
      className="relative flex items-center h-full px-3.5 sm:px-4 py-2 cursor-pointer select-none"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* BLUE BORDER BOX OUTLINE — ONLY APPEARS WHEN CLICKED */}
      {isClicked && (
        <motion.div
          layoutId="navbar-active-box"
          className="absolute inset-0 rounded-xl border-2 border-[#0066FF] bg-slate-100/90 shadow-2xs"
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 35,
          }}
        />
      )}

      {/* ITEM TEXT - BOLD INTER FONT, UPPERCASE, WIDE LETTER SPACING */}
      <span
        className={`relative z-10 font-sans text-[11px] font-bold tracking-[0.15em] uppercase transition-colors duration-150 flex items-center gap-1 ${
          isClicked || isActive || isHovered
            ? "text-slate-950 font-extrabold"
            : "text-slate-800 hover:text-slate-950 font-bold"
        }`}
      >
        <span>{item.label}</span>
        <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
      </span>
    </div>
  );
};
