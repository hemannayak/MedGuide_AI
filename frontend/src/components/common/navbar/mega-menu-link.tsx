"use client";

import React from "react";
import Link from "next/link";
import { NavLinkItem } from "./nav-data";

interface MegaMenuLinkProps {
  item: NavLinkItem;
  onClick?: () => void;
}

export const MegaMenuLink: React.FC<MegaMenuLinkProps> = ({ item, onClick }) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className="group flex items-start gap-3.5 p-3 rounded-2xl transition-all duration-200 hover:bg-slate-50 border border-transparent hover:border-slate-200/60"
    >
      {/* Icon Box (Matching Image 2: Clean rounded squircle box with soft warm icon color) */}
      <div
        className={`w-10 h-10 rounded-2xl ${item.iconBg} border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-all duration-200`}
      >
        {item.stepNumber ? (
          <span className={`font-mono text-xs font-bold ${item.iconColor}`}>
            {item.stepNumber}
          </span>
        ) : (
          <Icon className={`w-4.5 h-4.5 ${item.iconColor}`} />
        )}
      </div>

      {/* Title & Description (Matching Image 2) */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200">
            {item.title}
          </span>
          {item.tag && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold tracking-wider">
              {item.tag}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-xs text-slate-400 font-normal mt-0.5 leading-snug line-clamp-2">
            {item.description}
          </p>
        )}
      </div>
    </Link>
  );
};
