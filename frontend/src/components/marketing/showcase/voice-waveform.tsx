"use client";

import React from "react";
import { motion } from "framer-motion";

interface VoiceWaveformProps {
  isActive: boolean;
  color?: string;
  barCount?: number;
  className?: string;
}

export const VoiceWaveform: React.FC<VoiceWaveformProps> = ({
  isActive,
  color = "#0F766E",
  barCount = 16,
  className = "",
}) => {
  const defaultHeights = [20, 45, 75, 35, 90, 60, 100, 40, 85, 50, 95, 30, 70, 45, 80, 25];

  return (
    <div className={`flex items-center justify-center gap-1.5 h-10 px-2 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        const baseHeight = defaultHeights[i % defaultHeights.length];
        return (
          <motion.div
            key={i}
            className="w-1 rounded-full"
            style={{ backgroundColor: color }}
            initial={{ height: "6px" }}
            animate={
              isActive
                ? {
                    height: [`${Math.max(8, baseHeight * 0.3)}px`, `${baseHeight * 0.45}px`, `${Math.max(8, baseHeight * 0.2)}px`],
                  }
                : { height: "6px" }
            }
            transition={
              isActive
                ? {
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 0.4 + (i % 5) * 0.12,
                    ease: "easeInOut",
                    delay: (i % 4) * 0.08,
                  }
                : { duration: 0.2 }
            }
          />
        );
      })}
    </div>
  );
};
