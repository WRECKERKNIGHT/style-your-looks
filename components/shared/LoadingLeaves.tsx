type Tone = "coffee" | "gold" | "cream";

const TONES: Record<Tone, { fill: string; stroke: string }> = {
  coffee: { fill: "var(--accent-mocha)", stroke: "var(--accent-mocha)" },
  gold: { fill: "var(--accent-caramel)", stroke: "#8A5F3D" },
  cream: { fill: "#FBF7F0", stroke: "var(--accent-caramel)" },
};

function Leaf({ tone }: { tone: Tone }) {
  const { fill, stroke } = TONES[tone];
  return (
    <svg
      viewBox="0 0 22 38"
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
      strokeLinejoin="round"
      className="w-5 h-8 drop-shadow-sm"
      aria-hidden
    >
      <path d="M11 2 C 17.5 12, 19 24, 11 35 C 3 24, 4.5 12, 11 2 Z" />
      <path
        d="M11 4 L 11 31"
        stroke={stroke}
        strokeWidth="0.8"
        fill="none"
        opacity="0.55"
      />
      <path d="M11 12 L 16 8" stroke={stroke} strokeWidth="0.8" opacity="0.55" />
      <path d="M11 19 L 6 15" stroke={stroke} strokeWidth="0.8" opacity="0.55" />
    </svg>
  );
}

function Bean({ tone }: { tone: Tone }) {
  const { fill, stroke } = TONES[tone];
  return (
    <svg
      viewBox="0 0 16 22"
      fill={fill}
      stroke={stroke}
      strokeWidth="1"
      strokeLinejoin="round"
      className="w-3.5 h-5"
      aria-hidden
    >
      <path d="M8 1 C 13 5, 13 17, 8 21 C 3 17, 3 5, 8 1 Z" />
      <path d="M8 2 C 7 7, 7 15, 8 20" stroke={stroke} strokeWidth="0.7" fill="none" opacity="0.6" />
    </svg>
  );
}

interface StrandSpec {
  left: string;
  height: string;
  tone: Tone;
  delay: number;
  duration: number;
  inverse?: boolean;
  leaves: { top: string; side: "left" | "right"; delay: number; inverse?: boolean }[];
}

export function HangingStrand({ spec }: { spec: StrandSpec }) {
  const { fill, stroke } = TONES[spec.tone];
  return (
    <div
      aria-hidden
      className={`leaf-strand ${spec.inverse ? "leaf-strand-inverse" : ""}`}
      style={{
        left: spec.left,
        height: spec.height,
        animationDelay: `${spec.delay}s`,
        animationDuration: `${spec.duration}s`,
      }}
    >
      <span className="leaf-stem" />
      {spec.leaves.map((leaf, i) => (
        <span
          key={i}
          className={`leaf ${leaf.inverse ? "leaf-inverse" : ""}`}
          style={{
            top: leaf.top,
            left: leaf.side === "left" ? "-12px" : "20px",
            animationDelay: `${leaf.delay}s`,
          }}
        >
          <Leaf tone={spec.tone} />
        </span>
      ))}
      <span className="leaf-drop" style={{ animationDelay: `${spec.delay * 0.6}s` }}>
        <svg
          viewBox="0 0 14 20"
          className="w-3 h-4"
          style={{ fill, stroke }}
          strokeWidth="1"
        >
          <path d="M7 1 C 11 5, 11 15, 7 19 C 3 15, 3 5, 7 1 Z" />
        </svg>
      </span>
      <span className="leaf-drop" style={{ bottom: "22px", animationDelay: `${spec.delay * 0.6 + 0.4}s` }}>
        <Bean tone={spec.tone} />
      </span>
    </div>
  );
}

const STRANDS: StrandSpec[] = [
  {
    left: "4%",
    height: "46vh",
    tone: "cream",
    delay: 0,
    duration: 6,
    leaves: [
      { top: "9%", side: "right", delay: 0.2 },
      { top: "24%", side: "left", delay: 1.1, inverse: true },
      { top: "40%", side: "right", delay: 2 },
    ],
  },
  {
    left: "13%",
    height: "38vh",
    tone: "gold",
    delay: 0.9,
    duration: 5.2,
    leaves: [
      { top: "12%", side: "left", delay: 0.6 },
      { top: "30%", side: "right", delay: 1.6, inverse: true },
      { top: "48%", side: "left", delay: 2.6 },
    ],
  },
  {
    left: "23%",
    height: "30vh",
    tone: "coffee",
    delay: 1.6,
    duration: 5.8,
    inverse: true,
    leaves: [
      { top: "16%", side: "right", delay: 0.9 },
      { top: "38%", side: "left", delay: 2 },
    ],
  },
  {
    left: "72%",
    height: "30vh",
    tone: "coffee",
    delay: 2.2,
    duration: 5.5,
    inverse: true,
    leaves: [
      { top: "14%", side: "left", delay: 1.2 },
      { top: "36%", side: "right", delay: 2.3 },
    ],
  },
  {
    left: "82%",
    height: "40vh",
    tone: "gold",
    delay: 0.5,
    duration: 6.2,
    leaves: [
      { top: "11%", side: "right", delay: 0.4 },
      { top: "28%", side: "left", delay: 1.4, inverse: true },
      { top: "46%", side: "right", delay: 2.4 },
    ],
  },
  {
    left: "92%",
    height: "47vh",
    tone: "cream",
    delay: 1.3,
    duration: 5.9,
    leaves: [
      { top: "8%", side: "left", delay: 0.8 },
      { top: "22%", side: "right", delay: 1.8, inverse: true },
      { top: "38%", side: "left", delay: 2.8 },
    ],
  },
];

export function HangingLeaves() {
  return (
    <>
      {STRANDS.map((spec, i) => (
        <HangingStrand key={i} spec={spec} />
      ))}
    </>
  );
}
