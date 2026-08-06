"use client";

const bigWords = ["MEASURED", "CUT", "TAILORED", "FITTED", "FINISHED"];
const smallWords = ["PRIVATE", "ON-DEVICE", "47-POINT", "RATIO", "HARMONY", "FIT"];

function BigRow() {
  const content = (key: string) => (
    <span key={key} className="inline-flex items-center">
      {bigWords.map((word, i) => (
        <span key={word} className="inline-flex items-center">
          <span className="type-display italic leading-none text-outline-aurum text-[11.5vw] md:text-[7.5vw] tracking-tight">
            {word}
          </span>
          <span className="mx-[2.5vw] text-[3vw] leading-none text-[var(--accent-caramel)]">
            ✦
          </span>
        </span>
      ))}
      <span className="text-outline-aurum text-[11.5vw] md:text-[7.5vw] leading-none tracking-tight">
        MEASURED
      </span>
    </span>
  );

  return (
    <div className="marquee-container">
      <div
        className="marquee-content"
        style={{ animationDuration: "38s" }}
      >
        {content("a")}
        {content("b")}
      </div>
    </div>
  );
}

function SmallRow() {
  const content = (key: string) => (
    <span key={key} className="inline-flex items-center">
      {smallWords.map((word, i) => (
        <span key={word} className="inline-flex items-center">
          <span className="type-mono text-[2.2vw] md:text-[0.85rem] font-semibold tracking-[0.4em] text-[var(--text-muted)]">
            {word}
          </span>
          <span className="mx-[3.5vw] md:mx-10 text-[var(--accent-caramel)]">
            ·
          </span>
        </span>
      ))}
      <span className="type-mono text-[2.2vw] md:text-[0.85rem] font-semibold tracking-[0.4em] text-[var(--text-muted)]">
        PRIVATE
      </span>
    </span>
  );

  return (
    <div className="marquee-container">
      <div
        className="marquee-content"
        style={{ animationDuration: "52s", animationDirection: "reverse" }}
      >
        {content("a")}
        {content("b")}
      </div>
    </div>
  );
}

export function StatementMarquee() {
  return (
    <section
      aria-label="Our promise"
      className="relative overflow-hidden border-y border-[var(--border-primary)] bg-[var(--bg-tertiary)] py-20 md:py-28"
    >
      <div className="relative z-10 flex flex-col gap-8 md:gap-10">
        <BigRow />
        <SmallRow />
      </div>

      <div className="absolute left-1/2 top-1/2 z-20 hidden -translate-x-1/2 -translate-y-1/2 md:block">
        <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--bg-elevated)]/80 shadow-[var(--card-shadow)] backdrop-blur">
          <svg viewBox="0 0 100 100" className="h-[118px] w-[118px] animate-spin-slow">
            <defs>
              <path
                id="statement-circle"
                d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
              />
            </defs>
            <text
              fill="var(--text-muted)"
              style={{
                fontSize: "8.5px",
                letterSpacing: "0.22em",
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 700,
              }}
            >
              <textPath href="#statement-circle">
                EST. MMXXIV · ZERVEY · ATELIER ·
              </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-base font-semibold italic text-[var(--accent-mocha)]">
              ZERVEY
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
