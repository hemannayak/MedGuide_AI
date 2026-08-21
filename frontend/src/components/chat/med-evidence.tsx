"use client";

import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, ExternalLink, ShieldCheck } from "lucide-react";
import { SourceCitation } from "@/types/ai";

interface MedEvidenceProps {
  sources?: SourceCitation[];
}

export const MedEvidence: React.FC<MedEvidenceProps> = ({ sources }) => {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return (
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-[#8C6D46] shrink-0" />
        <span>Grounded in verified healthcare guidance</span>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-slate-200/60 text-xs">
      {/* Collapsed Header Bar */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-50/70 hover:bg-amber-50 border border-amber-200/80 text-[#1C1917] font-medium transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#8C6D46] shrink-0" />
          <span>Source-backed guidance ({sources.length} clinical references)</span>
        </div>
        <div className="flex items-center gap-1 text-[#8C6D46] text-[11px] font-semibold">
          <span>{expanded ? "Hide sources" : "View sources"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </div>
      </button>

      {/* Expanded Details List */}
      {expanded && (
        <div className="mt-2.5 space-y-2 pl-1 animate-fade-in">
          {sources.map((src, idx) => (
            <div
              key={src.citation_id || idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 space-y-1"
            >
              <div className="flex items-start justify-between gap-2 font-semibold text-slate-900 text-xs">
                <span>
                  [{src.citation_id}] {src.title || "Clinical Health Protocol"}
                </span>
                {src.source_url && (
                  <a
                    href={src.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8C6D46] hover:underline inline-flex items-center gap-0.5 shrink-0 text-[11px]"
                  >
                    Link <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                <span>Publisher: {src.publisher || "WHO / Ministry Guidelines"}</span>
                {src.section_title && <span> &bull; Section: {src.section_title}</span>}
                {src.page_number && <span> &bull; Page {src.page_number}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
