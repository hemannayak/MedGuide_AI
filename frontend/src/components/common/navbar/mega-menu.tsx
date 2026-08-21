"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NavItemData } from "./nav-data";
import { MegaMenuContent } from "./mega-menu-content";

interface MegaMenuProps {
  activeItem: NavItemData | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onLinkClick?: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  activeItem,
  onMouseEnter,
  onMouseLeave,
  onLinkClick,
}) => {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {activeItem && (
        <div
          className="absolute top-full left-0 right-0 z-50 pt-2 px-4 pointer-events-auto flex justify-center"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`w-full max-w-[1240px] ${pathname === "/" ? "bg-[#FFF5EA]/95 border-amber-900/10" : "bg-white/98 border-slate-200/90"} backdrop-blur-xl border rounded-[32px] shadow-[0_24px_70px_rgba(15,23,42,0.14)] p-7 sm:p-10 overflow-hidden`}
          >
            <MegaMenuContent item={activeItem} onLinkClick={onLinkClick} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
