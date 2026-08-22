/**
 * Outfit colour combinations from the Japanese Book of Colour Combinations
 * (組合せ色帖 kumiawase iro-chō). Two mirrored volumes: men's and women's.
 */
import type { Season } from "./japanese-colors";

export interface GarmentColour {
  garment: string;
  colorId: string;
}

export interface OutfitCombo {
  id: string;
  name: string;
  kanji: string;
  romaji: string;
  season: Season;
  occasion: string;
  description: string;
  items: GarmentColour[];
}

export const MEN_COMBOS: OutfitCombo[] = [
  {
    id: "m-sakura-business",
    name: "Sakura Business",
    kanji: "桜ビジネス",
    romaji: "sakura bijinesu",
    season: "spring",
    occasion: "Office & meetings",
    description:
      "Deep kon navy anchors the look while shironeri keeps the contrast crisp. A single sakura accent at the pocket square nods to hanami season without breaking formality.",
    items: [
      { garment: "Suit", colorId: "kon" },
      { garment: "Shirt", colorId: "shironeri" },
      { garment: "Tie", colorId: "ai" },
      { garment: "Pocket square", colorId: "sakura" },
      { garment: "Shoes", colorId: "kurobeni" },
    ],
  },
  {
    id: "m-moegi-casual",
    name: "Moegi Smart Casual",
    kanji: "萌葱カジュアル",
    romaji: "moegi kazharuaru",
    season: "spring",
    occasion: "Weekend outings",
    description:
      "Fresh moegi green over a kinari base is the classic early-spring pairing — new-growth colours on unbleached cloth, worn with sumi for grounding.",
    items: [
      { garment: "Overshirt", colorId: "moegi" },
      { garment: "T-shirt", colorId: "kinari" },
      { garment: "Chinos", colorId: "sumi" },
      { garment: "Sneakers", colorId: "shironeri" },
    ],
  },
  {
    id: "m-ai-shiro-linen",
    name: "Ai & Shiro Linen",
    kanji: "藍と白",
    romaji: "ai to shiro",
    season: "summer",
    occasion: "Summer city days",
    description:
      "Indigo-dyed linen against undyed white is the timeless natsu pairing — the exact palette of Edo-period summer wear. Breathable in colour and history.",
    items: [
      { garment: "Linen shirt", colorId: "ai" },
      { garment: "Trousers", colorId: "shironeri" },
      { garment: "Belt", colorId: "kogecha" },
      { garment: "Loafers", colorId: "kogecha" },
    ],
  },
  {
    id: "m-sora-breeze",
    name: "Sora Breeze",
    kanji: "空のそよぎ",
    romaji: "sora no soyogi",
    season: "summer",
    occasion: "Casual evenings",
    description:
      "Sky-blue sora-iro cools the whole outfit; nezumi trousers keep it adult rather than sporty. Karashi accents add a dry mustard spark.",
    items: [
      { garment: "Polo", colorId: "sora" },
      { garment: "Trousers", colorId: "nezumi" },
      { garment: "Cap", colorId: "karashi" },
      { garment: "Sneakers", colorId: "torinoko" },
    ],
  },
  {
    id: "m-momiji-layers",
    name: "Momiji Layers",
    kanji: "紅葉の重ね",
    romaji: "momiji no kasane",
    season: "autumn",
    occasion: "Autumn weekends",
    description:
      "Layered maple tones — akane knit over kuchiba cotton, grounded by ebicha leather. Built on the kasane (layering) logic of Heian court dress.",
    items: [
      { garment: "Knit", colorId: "akane" },
      { garment: "Overshirt", colorId: "kuchiba" },
      { garment: "Chinos", colorId: "sumi" },
      { garment: "Boots", colorId: "ebicha" },
    ],
  },
  {
    id: "m-kuri-heritage",
    name: "Kuri Heritage",
    kanji: "栗の伝統",
    romaji: "kuri no dentō",
    season: "autumn",
    occasion: "Smart casual dinners",
    description:
      "Chestnut browns move together — kuri jacket, amero knit, kohaku scarf — a tonal study straight from a Meiji-era menswear plate.",
    items: [
      { garment: "Jacket", colorId: "kuri" },
      { garment: "Knit", colorId: "amero" },
      { garment: "Scarf", colorId: "kohaku" },
      { garment: "Trousers", colorId: "rikyu-nezumi" },
    ],
  },
  {
    id: "m-kon-formal",
    name: "Kon Formal",
    kanji: "紺フォーマル",
    romaji: "kon fōmaru",
    season: "winter",
    occasion: "Formal occasions",
    description:
      "The winter formal standard: kon overcoat and sumi turtleneck with kin-iro as the only ornament — gold reserved, never scattered.",
    items: [
      { garment: "Overcoat", colorId: "kon" },
      { garment: "Turtleneck", colorId: "sumi" },
      { garment: "Trousers", colorId: "sumi" },
      { garment: "Watch strap / gloves", colorId: "kin" },
      { garment: "Boots", colorId: "kurobeni" },
    ],
  },
  {
    id: "m-ebicha-evening",
    name: "Ebicha Evening",
    kanji: "海老茶の夜",
    romaji: "ebicha no yoru",
    season: "winter",
    occasion: "Evening events",
    description:
      "Aubergine-dark ebicha reads almost black until lamplight catches it — paired with ruri for depth and suzuhai to lift the chest line.",
    items: [
      { garment: "Sweater", colorId: "ebicha" },
      { garment: "Coat", colorId: "ruri" },
      { garment: "Trousers", colorId: "sumi" },
      { garment: "Scarf", colorId: "suzuhai" },
    ],
  },
];

export const WOMEN_COMBOS: OutfitCombo[] = [
  {
    id: "w-hanami-dress",
    name: "Hanami Dress",
    kanji: "花見ドレス",
    romaji: "hanami doresu",
    season: "spring",
    occasion: "Spring gatherings",
    description:
      "Petal-layered pinks — sakura dress under a torinoko cardigan, finished with a single beni lip-red accessory. The outfit equivalent of falling petals.",
    items: [
      { garment: "Dress", colorId: "sakura" },
      { garment: "Cardigan", colorId: "torinoko" },
      { garment: "Bag", colorId: "kurenai" },
      { garment: "Heels", colorId: "nakafuri" },
    ],
  },
  {
    id: "w-fuji-mist",
    name: "Fuji Mist",
    kanji: "藤の霧",
    romaji: "fuji no kiri",
    season: "spring",
    occasion: "Garden parties",
    description:
      "Wisteria fuji softened by yanagi-nezumi — the pale green-grey of willow shoots keeps the purple airy instead of sweet.",
    items: [
      { garment: "Blouse", colorId: "fuji" },
      { garment: "Skirt", colorId: "yanagi-nezumi" },
      { garment: "Cardigan", colorId: "torinoko" },
      { garment: "Flats", colorId: "sumire" },
    ],
  },
  {
    id: "w-mizu-cool",
    name: "Mizu Cool",
    kanji: "水の涼",
    romaji: "mizu no ryō",
    season: "summer",
    occasion: "Hot summer days",
    description:
      "Water-colour mizu with shironeri — yukata-season logic: the lightest blues and whites to visually lower the temperature.",
    items: [
      { garment: "Dress", colorId: "mizu" },
      { garment: "Stole", colorId: "shironeri" },
      { garment: "Sandals", colorId: "kinari" },
      { garment: "Earrings", colorId: "ruri" },
    ],
  },
  {
    id: "w-sora-picnic",
    name: "Sora Picnic",
    kanji: "空のピクニック",
    romaji: "sora pikunikku",
    season: "summer",
    occasion: "Day trips & picnics",
    description:
      "Sky blue up top, dry karashi below — an unexpected but classical pairing found in summer komon patterns. Yamabuki ribbon ties it together.",
    items: [
      { garment: "Top", colorId: "sora" },
      { garment: "Skirt", colorId: "karashi" },
      { garment: "Ribbon / belt", colorId: "yamabuki" },
      { garment: "Sandals", colorId: "torinoko" },
    ],
  },
  {
    id: "w-momiji-wrap",
    name: "Momiji Wrap",
    kanji: "紅葉ラップ",
    romaji: "momiji rappu",
    season: "autumn",
    occasion: "Autumn dates",
    description:
      "Kurenai crimson wrapped against kogecha leather and amero wool — deep reds that mirror momiji at peak colour, warmed by amber tones.",
    items: [
      { garment: "Wrap dress", colorId: "kurenai" },
      { garment: "Coat", colorId: "amero" },
      { garment: "Boots", colorId: "kogecha" },
      { garment: "Bag", colorId: "ebicha" },
    ],
  },
  {
    id: "w-matcha-latte",
    name: "Matcha Latte",
    kanji: "抹茶ラテ",
    romaji: "matcha rate",
    season: "autumn",
    occasion: "Cafés & errands",
    description:
      "Powdered-tea matcha over milky kinari — quiet, modern, and lifted by a single tamago-iro hair accessory.",
    items: [
      { garment: "Knit", colorId: "matcha" },
      { garment: "Trousers", colorId: "kinari" },
      { garment: "Hair accessory", colorId: "tamago" },
      { garment: "Loafers", colorId: "kuri" },
    ],
  },
  {
    id: "w-beni-statement",
    name: "Beni Statement Coat",
    kanji: "紅のコート",
    romaji: "beni no kōto",
    season: "winter",
    occasion: "Winter statement looks",
    description:
      "One bold gesture: a kurenai-beni coat over a full sumi base. The traditional rule of ichigo ie (one strong colour per outfit) done properly.",
    items: [
      { garment: "Coat", colorId: "kurenai" },
      { garment: "Turtleneck", colorId: "sumi" },
      { garment: "Trousers", colorId: "sumi" },
      { garment: "Gloves", colorId: "kurobeni" },
      { garment: "Bag", colorId: "zakuro" },
    ],
  },
  {
    id: "w-gunjo-elegance",
    name: "Gunjo Elegance",
    kanji: "群青の雅",
    romaji: "gunjo no miyabi",
    season: "winter",
    occasion: "Evening elegance",
    description:
      "Ultramarine gunjo with silver-grey suzuhai — the miyabi (refined) end of winter dressing; shironeri pearls keep the neckline luminous.",
    items: [
      { garment: "Dress", colorId: "gunjo" },
      { garment: "Wrap", colorId: "suzuhai" },
      { garment: "Jewellery", colorId: "shironeri" },
      { garment: "Heels", colorId: "kurobeni" },
    ],
  },
];
