/**
 * Community showcase fixtures. These are static sample posts/members that the
 * community page renders when no live posts exist yet — they are clearly
 * labeled as samples in the UI and are never derived from user data.
 */

export interface DemoCommunityPost {
  id: string;
  user: string;
  avatar: string;
  badge: string;
  content: string;
  likes: number;
  comments: number;
  tags: string[];
  time: string;
}

export interface DemoCommunityMember {
  id: string;
  name: string;
  avatar: string;
  badge: string;
  style: string;
  match: number;
}

export const DEMO_FEED: DemoCommunityPost[] = [
  { id: "p1", user: "AriaChen", avatar: "AC", badge: "STYLE ICON", content: "Just completed my full pillar analysis — the color season recommendations were spot on. Turns out I'm a Deep Autumn. Anyone else?", likes: 24, comments: 8, tags: ["color-analysis", "deep-autumn"], time: "2h ago" },
  { id: "p2", user: "MarcoR", avatar: "MR", badge: "RISING STAR", content: "Tried the virtual glasses try-on with the Gold Aviators. Game changer for shopping online.", likes: 18, comments: 5, tags: ["virtual-tryon", "accessories"], time: "4h ago" },
  { id: "p3", user: "StyleBot", avatar: "SB", badge: "AI CURATOR", content: "Weekly trend alert: structured blazers are peaking. Pair with wide-leg trousers for a 10/10 silhouette.", likes: 42, comments: 12, tags: ["trends", "silhouettes"], time: "6h ago" },
  { id: "p4", user: "LenaW", avatar: "LW", badge: "STYLE ICON", content: "My skin health score went from 72 to 88 in 3 months. Routine in bio.", likes: 35, comments: 15, tags: ["skin-health", "routine"], time: "8h ago" },
  { id: "p5", user: "DrewK", avatar: "DK", badge: "NEW", content: "First time using AI style analysis — mind officially blown. The body analysis measurements were within 2% of my tailor's.", likes: 29, comments: 7, tags: ["body-analysis", "first-post"], time: "12h ago" },
];

export const DEMO_MEMBERS: DemoCommunityMember[] = [
  { id: "m1", name: "Priya S.", avatar: "PS", badge: "DIAMOND", style: "Classic Minimalist", match: 94 },
  { id: "m2", name: "James L.", avatar: "JL", badge: "GOLD", style: "Smart Casual", match: 91 },
  { id: "m3", name: "Emma W.", avatar: "EW", badge: "SILVER", style: "Avant-Garde", match: 87 },
  { id: "m4", name: "Carlos M.", avatar: "CM", badge: "GOLD", style: "Streetwear", match: 85 },
  { id: "m5", name: "Yuki T.", avatar: "YT", badge: "DIAMOND", style: "Japanese Minimalist", match: 82 },
];
