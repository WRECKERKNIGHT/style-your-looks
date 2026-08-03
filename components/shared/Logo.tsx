"use client";

import { useId } from "react";

interface LogoProps {
  className?: string;
  title?: string;
}

export function Logo({ className = "", title = "ZERVEY" }: LogoProps) {
  const gradientId = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <svg
      viewBox="0 0 280 64"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0"
          y1="0"
          x2="280"
          y2="64"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#3A2A22" />
          <stop offset="50%" stopColor="#8A5F3D" />
          <stop offset="100%" stopColor="#C8963E" />
        </linearGradient>
      </defs>
      <g transform="translate(8, 18)" fill={`url(#${gradientId})`}>
        <polygon points="14,2 20,2 7,28 1,28" />
        <polygon points="26,2 32,2 45,28 39,28" />
        <polygon points="8,18 38,18 38,23 8,23" />
        <polygon points="20,2 26,2 26,9 20,9" />
      </g>
      <text
        x="62"
        y="42"
        fontFamily="'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
        fontSize="34"
        fontWeight="800"
        letterSpacing="4"
        fill={`url(#${gradientId})`}
      >
        ZERVEY
      </text>
    </svg>
  );
}
