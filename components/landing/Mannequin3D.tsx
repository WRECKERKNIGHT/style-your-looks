"use client";

interface Mannequin3DProps {
  className?: string;
}

export function Mannequin3D({ className = "" }: Mannequin3DProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="200" y2="480">
            <stop offset="0%" stopColor="#8C59FF" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#6C2BD9" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4A1A96" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0" y1="0" x2="200" y2="480">
            <stop offset="0%" stopColor="#FFCB20" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#6C2BD9" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="100" cy="45" r="36" stroke="url(#bodyGrad)" strokeWidth="1.5" fill="url(#bodyGrad)" />
        <ellipse cx="100" cy="55" rx="12" ry="2" fill="#8C59FF" opacity="0.2" />

        <rect x="100" y="78" width="12" height="18" rx="6" fill="url(#bodyGrad)" opacity="0.5" />

        <path d="M138 90 L170 96 L172 164 L140 158 Z" fill="url(#bodyGrad)" fillOpacity="0.6" />
        <path d="M62 90 L30 96 L28 164 L60 158 Z" fill="url(#bodyGrad)" fillOpacity="0.6" />

        <path
          d="M70 102 C70 102 80 108 100 108 C120 108 130 102 130 102"
          stroke="url(#bodyGrad)"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
        />

        <rect x="70" y="114" width="60" height="90" rx="8" fill="url(#bodyGrad)" stroke="url(#bodyGrad)" strokeWidth="1" />

        <rect x="60" y="180" width="28" height="100" rx="4" fill="url(#bodyGrad)" fillOpacity="0.6" />
        <rect x="112" y="180" width="28" height="100" rx="4" fill="url(#bodyGrad)" fillOpacity="0.6" />

        <rect x="64" y="288" width="20" height="18" rx="3" fill="#1C0840" />
        <rect x="116" y="288" width="20" height="18" rx="3" fill="#1C0840" />

        <rect x="68" y="210" width="64" height="22" rx="4" fill="url(#glowGrad)" stroke="#FFCB20" strokeWidth="0.5" strokeOpacity="0.3" />

        <circle cx="100" cy="220" r="4" fill="#FFCB20" opacity="0.6" filter="url(#glow)" />

        <rect x="86" y="104" width="28" height="4" rx="2" fill="#FFCB20" opacity="0.15" />
      </svg>
    </div>
  );
}
