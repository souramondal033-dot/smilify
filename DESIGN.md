# Smilify Design System

## Purpose & Tone
Global smile-sharing social platform spreading joy across borders. Playful, inclusive, joyful. Soft pastels with bold interaction accents. Toy-like friendliness with genuine warmth.

## Color Palette

| Role | OKLCH | Usage |
|------|-------|-------|
| Background | 0.98 0.01 20 | Warm cream base #FFF8FA |
| Foreground | 0.20 0.02 25 | Warm dark for text |
| Primary (Rose) | 0.72 0.25 12 | CTAs, highlights, Pookie vibes |
| Secondary (Lavender) | 0.85 0.12 280 | Secondary actions, subtle elements |
| Accent (Coral) | 0.68 0.28 25 | Stickers, rewards, energy |
| Destructive | 0.65 0.20 15 | Soft rose for deletion |
| Card | 1.0 0 0 | Pure white for content cards |
| Muted | 0.95 0.02 20 | Backgrounds for secondary sections |

## Typography

| Layer | Font | Usage |
|-------|------|-------|
| Display | Satoshi (700) | Headings, hero, brand moments |
| Body | GeneralSans (600) | Body text, UI labels, pookie chat |
| Mono | GeistMono (400) | Token counts, data, timestamps |

## Shape Language
- Cards: `rounded-3xl` and above — deeply rounded, soft
- Buttons: `rounded-full` for primary CTAs
- Inputs: `rounded-2xl` for form fields
- Micro: `rounded-xl` for badges, small elements
- **Signature:** Oversized radii emphasize playfulness and safety (no sharp corners)

## Structural Zones

| Zone | Treatment | Depth |
|------|-----------|-------|
| Header | White card, soft border-b (pink-50), sticky | Elevated with shadow-pookie |
| Main Content | Warm cream background (#FFF8FA) | Base layer |
| Card Sections | Pure white cards, rounded-3xl, shadow-pookie | Floated above base |
| Bottom Nav | Dark slate with translucent backdrop blur | Fixed, elevated |
| Pookie Chat | Full modal overlay, rounded-3rem | Top layer (z-1000) |
| AccountSettings | Stacked card sections (profile, details, lifecycle) with form inputs | Elevated cards above base |
| PersonalFeed | Toggle header, feed grid (chronological/trending), smile cards | Same as Main Content |
| ContentManagementHub | Header with filters/search, analytics mini-card grid, bulk action row | Grid + action bar on base |

## Spacing & Rhythm
- **Outer padding:** `px-6 py-5` for header/main sections
- **Card padding:** `p-8` for content cards, `p-4` for compact cards
- **Gap spacing:** `gap-4` to `gap-6` for section rhythm
- **Vertical rhythm:** `space-y-6` for breathing room between sections

## Component Patterns
- **Hero CTA:** Gradient pink-to-rose, rounded-full, shadow-pookie-lg, active:scale-95
- **Card hover:** shadow-pookie → shadow-pookie-lg on hover with duration-300
- **Icon buttons:** Circle shape with fill on hover, text-primary
- **Toggle/checkbox:** Smooth fill animation from border to bg-primary
- **Loading:** Gentle pulse-soft animation, no harsh spinners

## Motion & Animation

| Animation | Keyframes | Usage |
|-----------|-----------|-------|
| float | Y-axis drift + rotate | Floating clouds, decorative elements |
| float-slow | Slower Y-drift | Background ambiance |
| bounce-gentle | 8px vertical bounce | Pookie Panda icon, call-to-action |
| pulse-soft | Gentle opacity fade | Status indicators, "Always Happy" dot |
| beat | Scale pulse 1→1.2 | Heart icons, reward moments |

All transitions use `transition-smooth` by default (0.3s cubic-bezier).

## Constraints
- No horizontal scroll on mobile — single column, mobile-first
- No aggressive shadows or glows — pookie aesthetic is soft and approachable
- Animations must feel joyful, not chaotic — synchronized, purposeful
- All colors from OKLCH palette — no hex literals or arbitrary Tailwind colors

## Signature Detail
**Pookie Panda:** Floating 🐼 emoji, bouncing `animate-bounce-gentle`. Full-screen modal, pink header, typing indicators with `pulse-soft`, warm personality.
**AccountSettings:** Profile picture upload (📷), card sections (name/email/bio/phone/location/visibility). Lifecycle: deactivate (7-day grace) and delete. Inputs: `rounded-2xl`, labels `text-muted-foreground`.
**PersonalFeed:** Toggle chronological/trending. Shows only user's smiles with edit/delete. Trending: likes+shares from last 7 days. Card hover: shadow-pookie → shadow-pookie-lg.
**ContentManagementHub:** Grid with search/filter. Mini-stat cards (views/likes/shares). Bulk delete with confirmation. Analytics cards: `rounded-2xl`, accent highlights.

## Dark Mode
Light theme primary. Dark mode uses shifted OKLCH values (background 0.15, foreground 0.92) for readability without losing warmth.

## Mobile First
Stacked bottom navigation. Cards full-width; max-w-md on larger screens. Touch targets: 44px minimum, 56px on mobile. No two-column layouts on small screens.

---
**Design Lead:** Using Satoshi + GeneralSans. OKLCH palette emphasis: warm neutrals + bold rose accent for interaction. Smilify brand = global joy, soft roundness, animated delight, pookie personality.
