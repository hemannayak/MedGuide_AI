"use client";

import React, { useState } from "react";
import {
  TextField,
  Label,
  Input,
  FieldError,
  Text,
} from "react-aria-components";
import { Eye, EyeOff } from "lucide-react";

interface AuthTextFieldProps {
  /** Label text for the field */
  label: string;
  /** HTML input type */
  type?: "text" | "email" | "password" | "tel";
  /** Input name attribute */
  name: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Leading icon element */
  icon?: React.ReactNode;
  /** Whether the field is required */
  isRequired?: boolean;
  /** Auto-complete hint */
  autoComplete?: string;
  /** Description text below the field */
  description?: string;
  /** External error message */
  errorMessage?: string;
  /** Additional class names for the wrapper */
  className?: string;
  /** Extra content to the right of the label (e.g. "Forgot password?" link) */
  labelSuffix?: React.ReactNode;
  minLength?: number;
}

export function AuthTextField({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  icon,
  isRequired = false,
  autoComplete,
  description,
  errorMessage,
  className = "",
  labelSuffix,
  minLength,
}: AuthTextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && showPassword ? "text" : type;

  return (
    <TextField
      name={name}
      value={value}
      onChange={onChange}
      isRequired={isRequired}
      isInvalid={!!errorMessage}
      className={`flex flex-col gap-1.5 ${className}`}
    >
      <div className="flex items-center justify-between">
        <Label className="block text-sm font-medium text-slate-700">
          {label}
        </Label>
        {labelSuffix && <div>{labelSuffix}</div>}
      </div>

      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}

        <Input
          type={resolvedType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          className={`
            w-full min-h-[48px] py-3 rounded-lg border text-sm
            bg-white text-slate-900 placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-[#0F766E]
            transition-colors
            ${icon ? "pl-10" : "pl-4"}
            ${isPassword ? "pr-12" : "pr-4"}
            ${errorMessage ? "border-red-400" : "border-slate-200"}
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-600 hover:text-slate-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      {description && (
        <Text slot="description" className="text-xs text-slate-400">
          {description}
        </Text>
      )}

      {(
        <FieldError className="text-xs text-red-600 flex items-center gap-1">
          {errorMessage}
        </FieldError>
      )}
    </TextField>
  );
}
