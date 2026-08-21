"use client";

import React from "react";
import { Volume2, Mic, Globe2, FileText } from "lucide-react";
import { motion } from "framer-motion";

export type CapabilityTabId = "voice" | "speech" | "ocr";

interface TabItem {
  id: CapabilityTabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabItem[] = [
  {
    id: "voice",
    label: "Voice Guidance",
    icon: <Volume2 className="w-4 h-4" />,
  },
  {
    id: "speech",
    label: "Speech to Text",
    icon: <Mic className="w-4 h-4" />,
  },
  {
    id: "ocr",
    label: "Prescription OCR",
    icon: <FileText className="w-4 h-4" />,
  },
];

interface ShowcaseTabsProps {
  activeTab: CapabilityTabId;
  onSelectTab: (tabId: CapabilityTabId) => void;
}

export const ShowcaseTabs: React.FC<ShowcaseTabsProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <div
      role="tablist"
      aria-label="MedGuide AI Capabilities"
      className="flex items-center justify-between border-b border-slate-100 bg-[#FAFAF8]/90 p-2 sm:p-4 overflow-x-auto no-scrollbar gap-2 sm:gap-4 max-w-full"
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex items-center justify-center gap-2 px-5 sm:px-8 py-2.5 rounded-full transition-all cursor-pointer shrink-0 text-xs sm:text-sm font-medium ${
              isActive
                ? "bg-white text-indigo-950 font-semibold shadow-xs border border-indigo-500/80"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/60 border border-transparent"
            }`}
          >
            <span className={isActive ? "text-indigo-600" : "text-slate-400"}>
              {tab.icon}
            </span>

            <span>{tab.label}</span>

            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 border border-indigo-500/80 rounded-full pointer-events-none"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
