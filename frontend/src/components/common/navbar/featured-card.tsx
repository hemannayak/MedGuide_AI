"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FeaturedCardData } from "./nav-data";
import { ArrowUpRight } from "lucide-react";

interface FeaturedCardProps {
  data: FeaturedCardData;
  onLinkClick?: () => void;
}

export const FeaturedCard: React.FC<FeaturedCardProps> = ({ data, onLinkClick }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={data.type}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.2 }}
        className="h-full flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs group"
      >
        {/* TOP SOFT GRADIENT PREVIEW BOX (Exact match to Image 2 Reference) */}
        <Link href={data.ctaHref} onClick={onLinkClick} className="block relative overflow-hidden rounded-xl">
          <div
            className={`relative h-48 rounded-xl bg-gradient-to-br ${data.bgGradient} flex flex-col items-center justify-center p-6 text-white text-center shadow-inner group-hover:scale-[1.02] transition-transform duration-300`}
          >
            <span className="text-[10px] font-mono font-bold tracking-widest text-white/80 uppercase px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-xs mb-2">
              {data.subtitle}
            </span>
            <h4 className="font-sans text-xl sm:text-2xl font-bold leading-tight tracking-tight text-white drop-shadow-xs">
              {data.title}
            </h4>
          </div>
        </Link>

        {/* BOTTOM TITLE & ARROW LINK STRIP (Exact match to Image 2 Reference) */}
        <div className="pt-3 px-1.5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              {data.title}
            </span>
            <p className="text-[11px] text-slate-400 font-normal line-clamp-1">
              {data.description}
            </p>
          </div>
          <Link
            href={data.ctaHref}
            onClick={onLinkClick}
            className="p-1 rounded-full text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all shrink-0 ml-2"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
