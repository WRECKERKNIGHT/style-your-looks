import { getColor } from "@/lib/data/japanese-colors";
import type { OutfitCombo } from "@/lib/data/japanese-color-book";

type Category = "dress" | "outer" | "top" | "bottom" | "shoes" | "accessory";

const OUTER_WORDS = ["suit", "jacket", "coat", "overcoat", "overshirt", "cardigan"];
const DRESS_WORDS = ["dress"];
const BOTTOM_WORDS = ["trouser", "chino", "skirt", "jean", "pant"];
const SHOES_WORDS = ["shoe", "heel", "flat", "sandal", "sneaker", "boot", "loafer"];

function categorize(garment: string): Category {
  const g = garment.toLowerCase();
  if (DRESS_WORDS.some((w) => g.includes(w))) return "dress";
  if (OUTER_WORDS.some((w) => g.includes(w))) return "outer";
  if (BOTTOM_WORDS.some((w) => g.includes(w))) return "bottom";
  if (SHOES_WORDS.some((w) => g.includes(w))) return "shoes";
  return g.split(" ").length > 1 || /tie|square|bag|cap|belt|watch|scarf|glove|ribbon|jewel|earring|hair|stole/.test(g)
    ? "accessory"
    : "top";
}

interface Item {
  garment: string;
  hex: string;
}

/**
 * Deterministic flat-lay illustration of an outfit combo, drawn entirely in
 * inline SVG from the combo's real colour data — no external images, no
 * randomness. Garment silhouettes are simple editorial line art filled with
 * the exact dentōshoku hex values.
 */
export function OutfitIllustration({ combo }: { combo: OutfitCombo }) {
  const items: Item[] = combo.items.map((it) => ({
    garment: it.garment,
    hex: getColor(it.colorId).hex,
  }));

  const by = (cat: Category): Item[] => items.filter((i) => categorize(i.garment) === cat);
  const tops = by("top");
  const outers = by("outer");
  const dresses = by("dress");
  const bottoms = by("bottom");
  const shoes = by("shoes");
  const accessories = by("accessory");

  const topItem = dresses[0] ?? tops[0] ?? null;
  const outerItem = outers[0] ?? null;
  const bottomItem = bottoms[0] ?? null;
  const shoeItem = shoes[0] ?? null;

  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label={`Flat-lay preview of ${combo.name}: ${combo.items
        .map((i) => i.garment)
        .join(", ")}`}
      className="w-full h-full"
    >
      {/* Paper backdrop */}
      <rect width="400" height="300" fill="#F5F1E8" />
      <rect width="400" height="300" fill="url(#weave)" opacity="0.35" />
      <defs>
        <pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3h6M3 0v6" stroke="#E2DAC8" strokeWidth="0.6" />
        </pattern>
        <linearGradient id="foldShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00000022" />
          <stop offset="100%" stopColor="#00000000" />
        </linearGradient>
      </defs>

      {/* ── Top garment (or dress) — upper-left slot ── */}
      {topItem &&
        (dresses.length > 0 ? (
          <g>
            <path
              d={`M120 48 L152 62 L166 96 L146 104 L146 ${dresses[0] ? "238" : "160"} Q200 258 254 238 L254 104 L234 96 L248 62 L280 48 L262 34 L230 44 L200 52 L170 44 L138 34 Z`}
              fill={dresses[0].hex}
              stroke="#3A332B"
              strokeWidth="1.6"
            />
          </g>
        ) : (
          <g>
            {/* Tee/shirt silhouette */}
            <path
              d="M78 66 L112 50 L134 42 L158 50 L192 66 L178 92 L162 82 L162 148 L108 148 L108 82 L92 92 Z"
              fill={topItem.hex}
              stroke="#3A332B"
              strokeWidth="1.6"
            />
            <path d="M134 42 L142 56 L134 64 L126 56 Z" fill="#F5F1E8" stroke="#3A332B" strokeWidth="1.2" />
            <rect x="108" y="140" width="54" height="8" fill="url(#foldShade)" opacity="0.5" />
          </g>
        ))}

      {/* ── Outer layer — upper-right slot ── */}
      {outerItem && (
        <g>
          {/* Open jacket/coat */}
          <path
            d="M232 58 L262 44 L292 58 L306 84 L288 92 L284 76 L284 196 L240 196 L240 76 L236 92 L218 84 Z"
            fill={outerItem.hex}
            stroke="#3A332B"
            strokeWidth="1.6"
          />
          <path d="M262 44 L262 196" stroke="#3A332B" strokeWidth="1.1" opacity="0.55" />
          {outers[1] && (
            <rect x="318" y="70" width="46" height="110" rx="6" fill={outers[1].hex} stroke="#3A332B" strokeWidth="1.3" />
          )}
        </g>
      )}

      {/* ── Bottom — lower-left slot ── */}
      {bottomItem && (
        <g>
          {bottomItem.garment.toLowerCase().includes("skirt") ? (
            <path
              d="M96 176 L172 176 L196 262 L72 262 Z"
              fill={bottomItem.hex}
              stroke="#3A332B"
              strokeWidth="1.6"
            />
          ) : (
            <g>
              {/* Folded trousers */}
              <path
                d="M92 172 L168 172 L174 264 L140 264 L131 208 L122 264 L88 264 Z"
                fill={bottomItem.hex}
                stroke="#3A332B"
                strokeWidth="1.6"
              />
              <path d="M92 184 L168 184" stroke="#3A332B" strokeWidth="1.1" opacity="0.5" />
            </g>
          )}
        </g>
      )}

      {/* ── Shoes — lower-right slot ── */}
      {shoeItem && (
        <g>
          {[0, 1].map((i) => (
            <g key={i}>
              <ellipse cx={252 + i * 62} cy={252} rx="30" ry="9" fill="#00000018" />
              <path
                d={`M${228 + i * 62} 246 Q${228 + i * 62} 232 ${246 + i * 62} 232 Q${276 + i * 62} 232 ${278 + i * 62} 244 L${278 + i * 62} 250 L${228 + i * 62} 250 Z`}
                fill={shoeItem.hex}
                stroke="#3A332B"
                strokeWidth="1.5"
              />
            </g>
          ))}
        </g>
      )}

      {/* ── Accessories — top strip of discs ── */}
      {accessories.length > 0 && (
        <g>
          {accessories.slice(0, 4).map((item, i) => {
            const cx = 316 + (i % 2) * 44 - (accessories.length > 2 ? 20 : 0);
            const cy = accessories.length > 2 ? (i < 2 ? 34 : 74) : 54;
            return (
              <g key={`${item.garment}-${i}`}>
                <circle cx={cx} cy={cy} r="16" fill={item.hex} stroke="#3A332B" strokeWidth="1.4" />
                <circle cx={cx} cy={cy} r="16" fill="url(#foldShade)" opacity="0.25" />
                <text
                  x={cx}
                  y={cy + 3.5}
                  textAnchor="middle"
                  fontSize="7"
                  fontFamily="var(--font-mono, monospace)"
                  fill="#3A332B"
                  opacity="0.75"
                >
                  {item.garment.slice(0, 3).toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {/* Season kanji watermark */}
      <text
        x="386"
        y="282"
        textAnchor="end"
        fontSize="20"
        fontFamily="serif"
        fill="#3A332B"
        opacity="0.14"
      >
        {combo.kanji}
      </text>
    </svg>
  );
}
