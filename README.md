# The 144,000 Color Project

> A living color intelligence platform — 1,872,000 color variants with permanent identities, discovering emotional meaning through human interaction and AI.

---

## What This Is

The 144,000 Color Project is a universal color knowledge system built on a precise hierarchical framework:

- **13 Color Groups** — The 13th Universal Neutral Group (Black–Brown–White) as the foundational source, plus 12 RYB color families
- **144 Sub-classes** per group — each covering a distinct saturation/lightness zone
- **1,000 variants** per sub-class — algorithmically generated with permanent IDs
- **1,872,000 total intrinsic color variants** — every one with a unique ID (e.g. `C09_SC072_V0500`), HSL/RGB/HEX values
- **5 Render Modes** — Original, Metallic (animated shimmer), Glossy (pulse highlight), Pearlescent (hue-cycle), Matte
- **7,488,000+ total visual representations**

---

## Platform Features

### 🎨 Color Explorer (`/explore`)
- Browse all 13 color groups → 144 sub-classes → 1,000 variants
- Toggle between 5 animated CSS render modes
- Search by color name, group ID, or category
- Click any swatch for full color data (HEX, RGB, HSL, permanent ID)
- Grid and list layouts

### 🔍 Discovery Survey (`/survey`)
- 24 questions across 6 discovery phases (Phases 6–11)
- Phase 6: Color preferences · Phase 7: Emotions · Phase 8: Feelings
- Phase 9: Memory & scales · Phase 10: Environment · Phase 11: Culture & Vision
- All responses saved anonymously to PostgreSQL

### 🎯 Personal Color Profile (`/profile`)
- Personalized primary/secondary/accent colors from survey
- Emotional tone, personality keywords, 6-swatch palette
- Links back to your color family in the explorer

### 📖 About & 13 Phases (`/about`)
- Interactive 13-phase roadmap (Live / Building / Planned)
- Full system architecture breakdown

---

## Color System Architecture

```
Color ID format:  C09_SC072_V0500
                   │    │      └── Variant index (0001–1000)
                   │    └──────── Sub-class index (001–144)
                   └───────────── Group ID

13 Groups × 144 Sub-classes × 1,000 Variants = 1,872,000 intrinsic colors
1,872,000 × 5 render modes = 9,360,000 visual representations
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| Styling | Tailwind CSS v4 + CSS `@keyframes` animations |
| Components | shadcn/ui + Radix UI primitives |
| Database | PostgreSQL via Drizzle ORM |
| Color generation | Pure algorithmic HSL — zero static data files |
| Fonts | Playfair Display + Inter via `next/font/google` |
| Deployment | Cloudflare Workers via OpenNext |

---

## Database Schema

```sql
survey_responses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT NOT NULL,          -- anonymous session
  answers         JSONB NOT NULL,         -- full 24-question answer blob
  primary_color_group TEXT,               -- e.g. "C09"
  emotional_tone  TEXT,
  lightness_pref  TEXT,                   -- dark | mid | light
  saturation_pref TEXT,                   -- muted | moderate | vivid
  palette         JSONB,
  created_at      TIMESTAMP DEFAULT NOW()
)
```

---

## Getting Started

```bash
pnpm install
cp .env.example .env
# Add DATABASE_URL to .env
pnpm db:migrate
pnpm dev         # → http://localhost:13000
```

---

## The 13 Phases Roadmap

| Phase | Title | Status |
|---|---|---|
| 1–4 | Foundation, Library, Recipes, Relationships | ✅ Live |
| 5–6 | AI Engine, Human Discovery | 🔨 Building |
| 7–13 | Emotions → Living Color Intelligence Platform | 📋 Planned |

---

*The 144,000 Color Project — every color has a permanent identity.*
