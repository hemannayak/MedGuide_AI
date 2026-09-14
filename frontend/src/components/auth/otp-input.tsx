"use client";

import React, { useRef, useCallback } from "react";

interface OtpInputProps {
  /** Number of OTP digits */
  length?: number;
  /** Current OTP value */
  value: string;
  /** Called with the full OTP string on each change */
  onChange: (otp: string) => void;
  /** Whether inputs are disabled */
  disabled?: boolean;
}

/**
 * OTP code input with individual digit fields and auto-focus advance.
 * Each digit gets its own input; typing auto-advances to the next field,
 * backspace moves back. Built for keyboard and touch accessibility.
 */
export function OtpInput({ length = 6, value, onChange, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const focusInput = useCallback(
    (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus();
      }
    },
    [length]
  );

  const handleChange = useCallback(
    (index: number, inputValue: string) => {
      // Only accept single digit
      const digit = inputValue.replace(/\D/g, "").slice(-1);
      const newDigits = [...digits];
      newDigits[index] = digit;

      const newOtp = newDigits.join("");
      onChange(newOtp);

      // Auto-advance on digit entry
      if (digit && index < length - 1) {
        focusInput(index + 1);
      }
    },
    [digits, length, onChange, focusInput]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        // Move back on backspace when current field is empty
        focusInput(index - 1);
      } else if (e.key === "ArrowLeft" && index > 0) {
        focusInput(index - 1);
      } else if (e.key === "ArrowRight" && index < length - 1) {
        focusInput(index + 1);
      }
    },
    [digits, length, focusInput]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      if (pasted) {
        onChange(pasted);
        focusInput(Math.min(pasted.length, length - 1));
      }
    },
    [length, onChange, focusInput]
  );

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3" role="group" aria-label="Verification code">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digits[index] || ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={`
            w-10 h-12 sm:w-12 sm:h-14
            text-center text-lg font-semibold
            rounded-lg border bg-white text-slate-900
            focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
            ${digits[index] ? "border-slate-300" : "border-slate-200"}
          `}
        />
      ))}
    </div>
  );
}
