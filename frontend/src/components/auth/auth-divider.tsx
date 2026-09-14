"use client";

import React from "react";

interface AuthDividerProps {
  /** Text displayed in the divider. Defaults to "or" */
  text?: string;
}

/**
 * Horizontal divider with centered text, used between
 * social login and email form sections.
 */
export function AuthDivider({ text = "or" }: AuthDividerProps) {
  return (
    <div className="relative flex items-center justify-center py-1" role="separator">
      <div className="w-full border-t border-slate-200" />
      <span className="absolute bg-white px-3 text-xs text-slate-400 uppercase tracking-widest font-medium select-none">
        {text}
      </span>
    </div>
  );
}
