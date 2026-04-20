import React from "react";

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  ...props
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#1A3C34] text-white hover:bg-[#16332C]",
    secondary: "bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]",
    outline: "border-2 border-[#E5E7EB] text-[#374151] hover:border-[#1A3C34] hover:text-[#1A3C34]",
    danger: "bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FECACA]",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm h-9",
    md: "px-4 py-2 text-[15px] h-12",
    lg: "px-6 py-3 text-base h-14",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
