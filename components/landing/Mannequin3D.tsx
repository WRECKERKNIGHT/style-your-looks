"use client";

import { useId } from "react";

interface Mannequin3DProps {
  className?: string;
  withTape?: boolean;
}

export function Mannequin3D({ className = "", withTape = true }: Mannequin3DProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 320 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
        aria-hidden
      >
        <defs>
          <radialGradient id={`halo-${uid}`} cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#CCA066" stopOpacity="0.22" />
            <stop offset="55%" stopColor="#B98B56" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#B98B56" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="1" y2="0.4">
            <stop offset="0%" stopColor="#DCC9A8" />
            <stop offset="26%" stopColor="#F3E9DA" />
            <stop offset="55%" stopColor="#FBF6EC" />
            <stop offset="80%" stopColor="#EBDCC3" />
            <stop offset="100%" stopColor="#C9B18B" />
          </linearGradient>

          <linearGradient id={`hair-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A5236" />
            <stop offset="100%" stopColor="#573A27" />
          </linearGradient>

          <linearGradient id={`pole-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#A0764E" />
            <stop offset="45%" stopColor="#D9B98C" />
            <stop offset="55%" stopColor="#E6CB9F" />
            <stop offset="100%" stopColor="#8A5F3D" />
          </linearGradient>

          <linearGradient id={`base-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E6CB9F" />
            <stop offset="45%" stopColor="#C8963E" />
            <stop offset="100%" stopColor="#8A5F3D" />
          </linearGradient>

          <filter id={`soft-${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="18" />
          </filter>
        </defs>

        {/* warm halo */}
        <ellipse cx="160" cy="300" rx="170" ry="240" fill={`url(#halo-${uid})`} />

        {/* floor shadow */}
        <ellipse
          cx="160"
          cy="606"
          rx="132"
          ry="16"
          fill="#3A2A22"
          opacity="0.22"
          filter={`url(#soft-${uid})`}
        />

        {/* stand pole */}
        <rect x="151" y="322" width="18" height="268" rx="6" fill={`url(#pole-${uid})`} />
        <rect x="156" y="330" width="4" height="250" rx="2" fill="#FBF6EC" opacity="0.35" />

        {/* base plate */}
        <ellipse cx="160" cy="596" rx="98" ry="15" fill="#573A27" opacity="0.55" />
        <ellipse cx="160" cy="591" rx="98" ry="15" fill={`url(#base-${uid})`} stroke="#6F4A30" strokeWidth="1" />
        <ellipse cx="160" cy="588" rx="82" ry="11" fill="#E6CB9F" opacity="0.5" />

        {/* ================= NECK ================= */}
        <path
          d="M146 110 C 146 122, 144 132, 141 146 L 179 146 C 176 132, 174 122, 174 110 C 174 104, 168 100, 160 100 C 152 100, 146 104, 146 110 Z"
          fill={`url(#body-${uid})`}
          stroke="#C9B18B"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />

        {/* neck base shadow */}
        <path d="M146 136 C 152 144, 168 144, 174 136 L 179 146 L 141 146 C 143 141, 144 138, 146 136 Z" fill="#573A27" opacity="0.12" />

        {/* ================= TORSO ================= */}
        <path
          d="M160 150
             C 140 150, 96 152, 60 162
             C 46 166, 48 176, 56 182
             C 70 192, 84 214, 92 228
             C 98 240, 102 244, 104 256
             C 106 276, 92 296, 80 312
             C 76 319, 78 328, 86 330
             C 116 338, 138 342, 160 344
             C 182 342, 204 338, 234 330
             C 242 328, 244 319, 240 312
             C 228 296, 214 276, 216 256
             C 218 244, 222 240, 228 228
             C 236 214, 250 192, 264 182
             C 272 176, 274 166, 260 162
             C 224 152, 180 150, 160 150
             Z"
          fill={`url(#body-${uid})`}
          stroke="#C9B18B"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />

        {/* torso inner shading for volume */}
        <path
          d="M160 150
             C 130 155, 100 176, 100 220
             C 100 262, 118 300, 160 344
             C 118 300, 100 262, 100 220
             C 100 176, 130 155, 160 150 Z"
          fill="#573A27"
          opacity="0.06"
        />
        <path
          d="M160 150
             C 190 155, 220 176, 220 220
             C 220 262, 202 300, 160 344"
          fill="none"
          stroke="#FBF6EC"
          strokeOpacity="0.5"
          strokeWidth="22"
          filter={`url(#soft-${uid})`}
        />

        {/* ================= SEAMS & STITCHING ================= */}
        {/* center front seam (gold) */}
        <path
          d="M160 156 C 158 210, 160 280, 160 338"
          stroke="#B98B56"
          strokeOpacity="0.8"
          strokeWidth="1.3"
          strokeDasharray="3 5"
        />
        {/* shoulder seams */}
        <path d="M62 162 C 92 154, 128 150, 160 150" stroke="#C9B18B" strokeOpacity="0.8" strokeWidth="1.1" strokeDasharray="2 4" />
        <path d="M258 162 C 228 154, 192 150, 160 150" stroke="#C9B18B" strokeOpacity="0.8" strokeWidth="1.1" strokeDasharray="2 4" />
        {/* waist darts */}
        <path d="M92 226 C 108 238, 118 244, 126 250" stroke="#C9B18B" strokeOpacity="0.7" strokeWidth="1" strokeDasharray="2 4" />
        <path d="M228 226 C 212 238, 202 244, 194 250" stroke="#C9B18B" strokeOpacity="0.7" strokeWidth="1" strokeDasharray="2 4" />
        {/* hip darts */}
        <path d="M82 312 C 98 318, 114 322, 130 324" stroke="#C9B18B" strokeOpacity="0.6" strokeWidth="1" strokeDasharray="2 4" />
        <path d="M238 312 C 222 318, 206 322, 190 324" stroke="#C9B18B" strokeOpacity="0.6" strokeWidth="1" strokeDasharray="2 4" />

        {/* tailor's cross-stitch marks */}
        <g stroke="#8A5F3D" strokeOpacity="0.5" strokeWidth="1.2">
          <path d="M128 196 L 134 202 M 134 196 L 128 202" />
          <path d="M192 196 L 198 202 M 198 196 L 192 202" />
          <path d="M146 290 L 152 296 M 152 290 L 146 296" />
          <path d="M168 290 L 174 296 M 174 290 L 168 296" />
        </g>

        {/* ================= HEAD ================= */}
        <path
          d="M160 8
             C 132 8, 118 24, 118 54
             C 118 84, 130 108, 160 112
             C 190 108, 202 84, 202 54
             C 202 24, 188 8, 160 8 Z"
          fill={`url(#body-${uid})`}
          stroke="#C9B18B"
          strokeOpacity="0.55"
          strokeWidth="1.2"
        />

        {/* hair cap */}
        <path
          d="M118 56
             C 118 22, 136 8, 160 8
             C 184 8, 202 22, 202 56
             C 202 50, 188 44, 160 44
             C 132 44, 118 50, 118 56 Z"
          fill={`url(#hair-${uid})`}
        />

        {/* sculpted face — subtle, mannequin-style */}
        <g stroke="#8A5F3D" strokeOpacity="0.45" strokeWidth="1.4" strokeLinecap="round">
          <path d="M132 54 Q 142 50 152 53" />
          <path d="M168 53 Q 178 50 188 54" />
          <path d="M134 66 Q 142 71 150 67" />
          <path d="M170 67 Q 178 71 186 66" />
        </g>
        <path d="M160 74 L 156 84 Q 160 87 164 84" stroke="#8A5F3D" strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M151 96 Q 160 102 169 96" stroke="#B98B56" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M153 99 Q 160 105 167 99" stroke="#B98B56" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />

        {/* hair highlight */}
        <path d="M138 22 C 146 16, 156 13, 166 14" stroke="#EBDCC3" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />

        {/* ================= MEASURING TAPE ================= */}
        {withTape && (
          <g>
            <path
              d="M104 176
                 C 124 194, 130 236, 126 286
                 L 148 288
                 C 152 238, 146 198, 126 180 Z"
              fill="#E9DFCE"
              stroke="#B98B56"
              strokeOpacity="0.9"
              strokeWidth="1.4"
            />
            {/* tape tick marks */}
            <g stroke="#8A5F3D" strokeOpacity="0.7" strokeWidth="1">
              <path d="M128 200 L 140 201" />
              <path d="M127 216 L 139 217" />
              <path d="M126 232 L 138 233" />
              <path d="M125 248 L 137 249" />
              <path d="M125 264 L 137 265" />
              <path d="M125 280 L 137 281" />
            </g>
            {/* metal tape tip */}
            <path d="M125 286 C 125 290, 128 294, 137 294 C 146 294, 149 290, 149 288 L 126 286 Z" fill="#C8963E" stroke="#8A5F3D" strokeWidth="1" />
          </g>
        )}

        {/* subtle bottom fade into base */}
        <path
          d="M112 336 C 132 344, 188 344, 208 336 L 200 348 C 176 352, 144 352, 120 348 Z"
          fill="#573A27"
          opacity="0.18"
        />
      </svg>
    </div>
  );
}
