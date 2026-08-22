/**
 * Traditional Japanese colours (伝統色 dentōshoku) used by the
 * Japanese Book of Colour Combinations.
 */

export type Season = "spring" | "summer" | "autumn" | "winter";

export type ColorFamily =
  | "white"
  | "grey"
  | "black"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "pink"
  | "purple"
  | "brown"
  | "gold";

export interface JapaneseColor {
  id: string;
  name: string;
  kanji: string;
  romaji: string;
  hex: string;
  family: ColorFamily;
}

export const SEASONS: { id: Season; label: string; kanji: string; romaji: string }[] = [
  { id: "spring", label: "Spring", kanji: "春", romaji: "haru" },
  { id: "summer", label: "Summer", kanji: "夏", romaji: "natsu" },
  { id: "autumn", label: "Autumn", kanji: "秋", romaji: "aki" },
  { id: "winter", label: "Winter", kanji: "冬", romaji: "fuyu" },
];

export const JAPANESE_COLORS: JapaneseColor[] = [
  { id: "shironeri", name: "Shironeri", kanji: "白練", romaji: "shironeri", hex: "#FCFAF2", family: "white" },
  { id: "torinoko", name: "Torinoko", kanji: "鳥子", romaji: "torinoko", hex: "#F8F4E6", family: "white" },
  { id: "kinari", name: "Kinari", kanji: "生成", romaji: "kinari", hex: "#E8E3D3", family: "white" },
  { id: "nezumi", name: "Nezumi", kanji: "鼠色", romaji: "nezumi-iro", hex: "#91989F", family: "grey" },
  { id: "suzuhai", name: "Suzu-hai", kanji: "錫灰", romaji: "suzuhai", hex: "#C4C0B2", family: "grey" },
  { id: "rikyu-nezumi", name: "Rikyu-nezumi", kanji: "利休鼠", romaji: "rikyu-nezumi", hex: "#888E7E", family: "grey" },
  { id: "sumi", name: "Sumi", kanji: "墨", romaji: "sumi", hex: "#2B2A28", family: "black" },
  { id: "kurobeni", name: "Kuro-beni", kanji: "黒紅", romaji: "kurobeni", hex: "#3B2D2E", family: "black" },
  { id: "ai", name: "Ai", kanji: "藍色", romaji: "ai-iro", hex: "#165E83", family: "blue" },
  { id: "kon", name: "Kon", kanji: "紺色", romaji: "kon-iro", hex: "#223A70", family: "blue" },
  { id: "ruri", name: "Ruri", kanji: "瑠璃色", romaji: "ruri-iro", hex: "#1E50A2", family: "blue" },
  { id: "gunjo", name: "Gunjo", kanji: "群青", romaji: "gunjo", hex: "#3A5BA0", family: "blue" },
  { id: "chigusa", name: "Chigusa", kanji: "千草", romaji: "chigusa-iro", hex: "#316AA0", family: "blue" },
  { id: "sora", name: "Sora-iro", kanji: "空色", romaji: "sora-iro", hex: "#A0D8EF", family: "blue" },
  { id: "mizu", name: "Mizu", kanji: "水色", romaji: "mizu-iro", hex: "#86CEEB", family: "blue" },
  { id: "moegi", name: "Moegi", kanji: "萌葱", romaji: "moegi", hex: "#839B5C", family: "green" },
  { id: "matcha", name: "Matcha", kanji: "抹茶", romaji: "matcha", hex: "#C5C56A", family: "green" },
  { id: "yanagi-nezumi", name: "Yanagi-nezumi", kanji: "柳鼠", romaji: "yanaginezumi", hex: "#B9C2AC", family: "green" },
  { id: "tokiwa", name: "Tokiwa", kanji: "常磐", romaji: "tokiwa-iro", hex: "#007B43", family: "green" },
  { id: "matsuba", name: "Matsuba", kanji: "松葉", romaji: "matsuba-iro", hex: "#63825B", family: "green" },
  { id: "aotake", name: "Aotake", kanji: "青竹", romaji: "aotake", hex: "#7EBEA5", family: "green" },
  { id: "yamabuki", name: "Yamabuki", kanji: "山吹", romaji: "yamabuki-iro", hex: "#F8B500", family: "yellow" },
  { id: "karashi", name: "Karashi", kanji: "芥子色", romaji: "karashi-iro", hex: "#D0AF4C", family: "yellow" },
  { id: "tamago", name: "Tamago-iro", kanji: "卵色", romaji: "tamago-iro", hex: "#FAD689", family: "yellow" },
  { id: "kuchiba", name: "Kuchiba", kanji: "黄土", romaji: "kuchiba-iro", hex: "#B16931", family: "yellow" },
  { id: "kohaku", name: "Kohaku", kanji: "琥珀", romaji: "kohaku", hex: "#BF783A", family: "gold" },
  { id: "kin", name: "Kin-iro", kanji: "金色", romaji: "kin-iro", hex: "#E6B422", family: "gold" },
  { id: "akane", name: "Akane", kanji: "茜色", romaji: "akane-iro", hex: "#B7282E", family: "red" },
  { id: "kurenai", name: "Kurenai", kanji: "紅色", romaji: "kurenai", hex: "#D0104C", family: "red" },
  { id: "shu", name: "Shu", kanji: "朱色", romaji: "shu-iro", hex: "#E56A54", family: "red" },
  { id: "sango", name: "Sango-shu", kanji: "珊瑚朱", romaji: "sango-shu", hex: "#EE836F", family: "pink" },
  { id: "nakafuri", name: "Nakafuri", kanji: "中紅", romaji: "nakafuri", hex: "#EC8CA1", family: "pink" },
  { id: "sakura", name: "Sakura-iro", kanji: "桜色", romaji: "sakura-iro", hex: "#FEDFE1", family: "pink" },
  { id: "zakuro", name: "Zakuro", kanji: "石榴色", romaji: "zakuro-iro", hex: "#C73148", family: "red" },
  { id: "fuji", name: "Fuji-iro", kanji: "藤色", romaji: "fuji-iro", hex: "#B28FCE", family: "purple" },
  { id: "sumire", name: "Sumire", kanji: "菫色", romaji: "sumire-iro", hex: "#706CAA", family: "purple" },
  { id: "edomurasaki", name: "Edomurasaki", kanji: "江戸紫", romaji: "edomurasaki", hex: "#745399", family: "purple" },
  { id: "kogecha", name: "Kogecha", kanji: "孤茶", romaji: "kogecha", hex: "#6E3F26", family: "brown" },
  { id: "ebicha", name: "Ebicha", kanji: "海老茶", romaji: "ebicha", hex: "#6A2834", family: "brown" },
  { id: "kuri", name: "Kuri-iro", kanji: "栗色", romaji: "kuri-iro", hex: "#87413B", family: "brown" },
  { id: "kaba", name: "Kaba-iro", kanji: "樺色", romaji: "kaba-iro", hex: "#C79D66", family: "brown" },
  { id: "amero", name: "Amero", kanji: "飴色", romaji: "amero", hex: "#DBC596", family: "brown" },
];

const COLOR_INDEX = new Map(JAPANESE_COLORS.map((c) => [c.id, c]));

export function getColor(id: string): JapaneseColor {
  const color = COLOR_INDEX.get(id);
  if (!color) throw new Error(`Unknown colour id: ${id}`);
  return color;
}

/** Best text colour (dark/light) to overlay on a given swatch. */
export function readableTextColor(hex: string): "#111111" | "#FFFFFF" {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 150 ? "#111111" : "#FFFFFF";
}
