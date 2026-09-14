"use client";

import React from "react";
import { NavItemData } from "./nav-data";
import { MegaMenuLink } from "./mega-menu-link";
import { FeaturedCard } from "./featured-card";

interface MegaMenuContentProps {
  item: NavItemData;
  onLinkClick?: () => void;
}

export const MegaMenuContent: React.FC<MegaMenuContentProps> = ({ item, onLinkClick }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-stretch">
      {/* LEFT & CENTER COLUMNS: CATEGORY SECTIONS (7 OR 8 COLS) */}
      <div className="lg:col-span-7 xl:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {item.sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-2">
            {/* Section Eyebrow Label (Matching Image 2 Reference) */}
            <div className="text-[11px] font-bold tracking-[0.1em] text-slate-400 uppercase px-1 pb-1">
              {section.title}
            </div>

            {/* Section Link Items */}
            <div className="space-y-1">
              {section.items.map((linkItem) => (
                <MegaMenuLink key={linkItem.id} item={linkItem} onClick={onLinkClick} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* RIGHT COLUMN: FEATURED VISUAL CARD (4 OR 5 COLS) */}
      <div className="lg:col-span-5 xl:col-span-4 min-h-[280px]">
        <FeaturedCard data={item.featured} onLinkClick={onLinkClick} />
      </div>
    </div>
  );
};
