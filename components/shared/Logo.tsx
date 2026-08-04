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
      viewBox="0 0 360 96"
      role="img"
      aria-label={title}
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-mocha)" />
          <stop offset="50%" stopColor="var(--accent-caramel)" />
          <stop offset="100%" stopColor="var(--accent-honey)" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(8, 8) scale(0.4) translate(-320, -140)"
      >
        <path
          d="M 350 200 C 320 160, 370 140, 400 140 C 430 140, 480 160, 450 200 C 420 240, 340 280, 340 310 C 340 330, 360 340, 390 340"
          strokeWidth="12"
        />
        <path
          d="M 450 280 C 480 320, 430 340, 400 340 C 370 340, 320 320, 350 280 C 380 240, 460 200, 460 170 C 460 150, 440 140, 410 140"
          strokeWidth="12"
        />
        <path
          d="M 400 205 C 385 205, 380 185, 400 175 C 410 170, 412 160, 400 155"
          strokeWidth="8"
        />
      </g>
      <text
        x="92"
        y="62"
        fontFamily="'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"
        fontSize="34"
        fontWeight="300"
        letterSpacing="8"
        fill={`url(#${gradientId})`}
      >
        ZERVEY
      </text>
    </svg>
  );
}
