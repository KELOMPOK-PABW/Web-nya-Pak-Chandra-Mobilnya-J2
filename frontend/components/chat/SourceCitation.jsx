"use client";

import React, { useState } from "react";

/**
 * Expandable source citation footnote — links back to source (product page, review, etc.)
 *
 * Props:
 * - text: string — the claim being cited (e.g., "Baterai 90Wh")
 * - source: { type: 'product' | 'review' | 'spec', label: string, url: string }
 * - defaultOpen?: boolean
 */
export default function SourceCitation({ text, source, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  if (!source) return null;

  return (
    <span className="inline citation-ref">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-0.5 text-[10px] font-medium text-[#1A3C34] hover:text-[#2D6A5E] border-b border-dotted border-[#1A3C34]/30 hover:border-[#1A3C34] transition-colors cursor-pointer bg-transparent px-0 py-0"
      >
        <sup>[sumber]</sup>
        <svg
          width="8"
          height="8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <span className="block mt-1 bg-[#F0FBF8] border border-[#C8EDE8] rounded-lg px-2.5 py-1.5 text-[10px] leading-relaxed">
          {text && (
            <span className="text-[#1A1A1A] font-medium block mb-0.5">&ldquo;{text}&rdquo;</span>
          )}
          <span className="text-gray-500">
            Sumber: {source.label}
          </span>
          {source.url && (
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1A3C34] font-medium hover:underline ml-1"
              onClick={(e) => e.stopPropagation()}
            >
              Buka →
            </a>
          )}
        </span>
      )}
    </span>
  );
}
