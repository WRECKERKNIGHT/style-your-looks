# AuraStyle Massive Redesign Plan

## Vision
Transform from dark cyber/brutalist VHS theme → **warm vintage British gentleman's club** aesthetic with off-white/beige/coffee palette, expanded typography, 3D interactive mannequin, unique scroll effects per section, and massively expanded UI.

---

## Color Palette Transformation

### Old (Cyber Brutalist)
| Token | Hex | Usage |
|-------|-----|-------|
| void | #0A0A0A | Background |
| bone | #F0EDE6 | Text |
| acid | #BFFF00 | Accent |
| electric | #00D4FF | Secondary |
| neon-pink | #FF2D7B | Tertiary |
| smoke | #1A1A1A | Cards |

### New (Old British / Vintage Gentleman)
| Token | Hex | Usage |
|-------|-----|-------|
| parchment | #F5F0E8 | Primary background |
| cream | #FFF8F0 | Card backgrounds |
| espresso | #2C1810 | Primary text |
| coffee | #5C3D2E | Secondary text |
| tan | #C4A882 | Borders, muted |
| amber | #B8860B | Primary accent (gold) |
| burgundy | #722F37 | Secondary accent |
| olive | #556B2F | Tertiary accent |
| slate | #4A4A4A | Muted text |
| charcoal | #1A1A1A | Dark elements |

### Typography
- **Display**: Playfair Display (serif, British elegance)
- **Body**: DM Sans (clean, modern complement)
- **Mono**: JetBrains Mono (keep for data/labels)

---

## Task Breakdown (6 Parallel Subagents)

### Task 1: Design System Foundation
**Files:** tailwind.config.ts, globals.css, app/layout.tsx, lib/constants.ts
- Replace all color tokens with new British palette
- Add Playfair Display + DM Sans fonts
- Update globals.css: remove scanlines/noise/CRT, add elegant grain, warm shadows, gold accents
- Update layout.tsx: add Lenis SmoothScroll provider, remove CRT classes
- Update constants.ts: adjust color palettes to new warm tones
- Add new CSS utilities: `.elegant-shadow`, `.gold-glow`, `.vintage-border`, `.paper-texture`

### Task 2: 3D Interactive Mannequin
**New files:** components/landing/Mannequin3D.tsx, components/shared/Scene3D.tsx
**Dependencies to install:** three, @react-three/fiber, @react-three/drei
- Create a Three.js scene with a stylized 3D mannequin/torso
- Mannequin auto-rotates on idle, responds to scroll position
- Material: warm cream/ivory with gold wireframe overlay
- Clothing color overlay system driven by palette selections
- Camera orbit controls for user interaction
- Lighting: warm ambient + directional for vintage feel
- Replace SVG wireframe in MannequinSection with 3D component

### Task 3: Landing Page Scroll Effects
**Files:** All components/landing/*.tsx
Each section gets a UNIQUE scroll-driven effect:

1. **HeroSection**: Text split reveal (each word slides in from different direction), parallax depth layers (bg grid moves at 0.3x, mid elements at 0.6x, foreground at 1x), image Ken Burns effect
2. **MannequinSection**: Scroll-locked rotation (mannequin rotates as you scroll), viewport-pinned with 3D depth, feature labels fly in from edges with spring physics
3. **FeaturesSection**: Horizontal scroll with card tilt (perspective transform on scroll), cards scale from 0.8→1.0 and rotate slightly, progress bar with glow
4. **HowItWorksSection**: Step-by-step reveal with scroll-triggered counter animation, each step slides in from alternating sides, connecting line draws itself
5. **CommunitySection**: Cards enter with stagger + slight Y rotation, marquee with parallax speed variation, background pattern shifts on scroll
6. **CtaSection**: Text scales from massive to normal, background color transitions, particle/sparkle effects

### Task 4: Dashboard Pages Expansion
**Files:** All app/(dashboard)/*.tsx, components/analysis/*.tsx
- ScoreGauge: 2x larger, animated fill on mount, glow effect at threshold, decorative ring
- MetricBar: Taller (h-4→h-6), animated width, percentage label, color gradient fill
- AnalysisResults: Card-based layout with hover effects, animated score counters, expanded grooming suggestions with preview thumbnails
- Dashboard home: Larger cards (p-8), animated stat counters, welcome message with typewriter effect
- Each analysis page: Expanded hero area, larger upload zone, full-width results, animated transitions between states

### Task 5: Shared Components + Interactions
**Files:** components/shared/*, new cursor/loading components
- Custom cursor component (coffee-colored dot + amber ring follower)
- Page transition overlay (vertical blinds effect)
- Loading screen with animated logo + progress
- Toast notification system for analysis completion
- Floating action button for quick navigation
- Enhanced ImageUploader: larger dropzone, preview with zoom, elegant file info display
- New: AnimatedCounter, TiltCard, ParallaxLayer, TextReveal, MagneticButton components

### Task 6: Integration + Polish
**Files:** Cross-cutting concerns
- Wire 3D mannequin into landing page and dashboard mannequin page
- Ensure all scroll effects work together without conflicts
- Responsive breakpoints for all new large layouts
- Performance: lazy-load 3D scene, optimize animations for 60fps
- Accessibility: prefers-reduced-motion support, focus states, ARIA labels
- Final typography pass: ensure consistent heading hierarchy across all pages
