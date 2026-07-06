# 🧠 Understanding The 144,000 Color Project

> This file is for any developer, AI agent, or contributor who needs to understand
> the project deeply before working on it. Read this before touching any code.
> It explains the WHY behind every major decision.

---

## The Core Idea — What This Project Actually Is

Most color systems are tools. Pantone is a printing standard. CSS color names are web
conveniences. Color palettes are aesthetic choices.

**This project is different.** It is an attempt to build a *universal language* for color —
one where every possible color has a permanent name, a permanent number, and eventually,
a meaning that was discovered through real human experience rather than assigned by one person.

The creator (Joseph) started from a simple observation: there are exactly 12 positions on
the RYB color wheel, plus a neutral scale. If you organize everything consistently from
those 13 starting points, and you build a deep enough hierarchy, you can give every
perceivable color a permanent, stable identity — like a social security number for colors.

The emotional meaning layer is the long game: instead of saying "blue = calm" (which is
a Western cultural assumption), this system collects responses from millions of people
across cultures, ages, and backgrounds, and lets the AI *discover* what colors mean to
humanity — rather than prescribing it.

---

## The Hierarchy — How the Numbers Work

```
The 13 Groups
│
├── G13 — Universal Neutral Scale (the foundation)
│   └── Black (l=5%) ──► Brown (l=30%, s=35%) ──► White (l=95%)
│       144 sub-classes × 1,000 variants = 144,000 variants
│
├── C01 — Red
├── C02 — Red-Orange
├── C03 — Orange
├── C04 — Yellow-Orange
├── C05 — Yellow
├── C06 — Yellow-Green
├── C07 — Green
├── C08 — Blue-Green
├── C09 — Blue
├── C10 — Blue-Violet
├── C11 — Violet
└── C12 — Red-Violet
    Each: 144 sub-classes × 1,000 variants = 144,000 variants
```

**Why 144?** 144 = 12 × 12. The system uses 12 as its base unit (12 colors on the wheel,
12 sub-units per band). 144 sub-classes per group creates 12 bands of 12 — each band
covering a distinct saturation/lightness zone.

**Why 1,000?** 1,000 variants per sub-class gives enough granularity to distinguish
virtually every perceptible shade within a zone, while keeping the math clean.
1,000 × 144 = 144,000. 144,000 × 13 = 1,872,000.

**The Permanent ID format:** `C09_SC072_V0500`
- `C09` = Blue (group 9)
- `SC072` = Sub-class 72 of 144
- `V0500` = Variant 500 of 1,000 (the exact midpoint)

This ID will never change. Once assigned, it's permanent — like a color's fingerprint.

---

## The Neutral Group (G13) — Why It's the Foundation

The G13 group is not just "grays." It is the **conceptual origin** of all color.

Think of it this way: if you take any color and progressively desaturate it, you eventually
reach a neutral (gray/brown/black/white). The neutral scale is where all colors *came from*
and where they all *return to*. It's the zero point of the color universe.

Brown is the center of G13 — not gray — because brown is where the warm mid-tones live.
A desaturated red becomes brown. A desaturated orange becomes tan. The brown family is the
neutral meeting point of the warm half of the spectrum.

**In the code:** G13 has a special generation path in `getVariant()`. Instead of using the
standard saturation/lightness band system, it sweeps across a gradient:
- Sub-classes 1–43: dark range (l=5%–14%, s=0%–15%) — blacks and near-blacks
- Sub-classes 44–86: brown range (l=14%–49%, s=15%–35%) — all the earth tones
- Sub-classes 87–144: light range (l=49%–95%, s=35%→0%) — tans, beiges, whites

---

## The Render Mode System — Intrinsic vs. Extrinsic

This is the most important conceptual distinction in the whole project.

**Intrinsic recipe** = what the color *is*. The HSL values. The HEX code. The permanent ID.
This never changes. `C09_SC072_V0500` is always that exact blue.

**Extrinsic render style** = how the color *looks* when presented in a specific material
or surface context. The same blue can look completely different as:
- A flat paint swatch (Original)
- A polished metal surface (Metallic)
- A glass or lacquer finish (Glossy)
- A pearl or opal surface (Pearlescent)
- A matte chalk or fabric finish (Matte)

The power of this distinction: it multiplies the visual representations without changing
the underlying color data. 1,872,000 colors × 5 modes = 9,360,000 visual states, all
derived from the same 1,872,000 permanent identities.

**In the code:** `getRenderStyle()` returns only `{ backgroundColor: hex }`.
The visual effects are handled entirely by CSS classes (`render-metallic`, etc.) that use
`::after` pseudo-elements with `position: absolute; inset: 0` overlaid on top.
This means the base color is always accessible from the DOM as a plain `backgroundColor`,
and the visual effect is purely cosmetic — never corrupting the color data.

---

## The Color Generation Algorithm

The algorithm in `getVariant(group, subclassIndex, variantIndex)` works like this:

```
t = (variantIndex - 1) / 999  →  a normalized 0..1 position within the sub-class

hue:
  hueVariation = group.hueRange × 2 × t - group.hueRange
  h = (group.hueCenter + hueVariation) % 360
  → This sweeps the hue ± hueRange degrees across 1,000 variants

saturation and lightness:
  Each sub-class has a saturationRange [sMin, sMax] and lightnessRange [lMin, lMax]
  s = sMin + t × (sMax - sMin)
  l = lMin + t × (lMax - lMin)
  → Both sweep linearly across the sub-class's assigned zone
```

The 144 sub-classes are organized in 12 bands of 12:
- Band 0 (SC001–SC012): very dark, low saturation
- Band 1 (SC013–SC024): slightly brighter, slightly more saturated
- ...
- Band 11 (SC133–SC144): bright, highly saturated

Within each band, position in the band (0–11) adds variation to the range width,
creating smooth transitions between sub-classes.

**Result:** The color space is sampled in a systematic, perceptually meaningful way —
dark desaturated tones at the bottom, bright vivid tones at the top, with smooth
transitions everywhere.

---

## The Survey System — Why Anonymous, Why This Structure

The survey was designed with one principle: **no forced conclusions**.

Traditional color psychology (e.g., "blue = trustworthy") is based on a handful of
Western academic studies with small samples. This project rejects that approach.
Instead, it gathers raw human responses and lets patterns emerge from the data.

**Why anonymous:** Color preference is personal. Many people have color associations
tied to trauma, culture, or memory. Anonymity removes social pressure to give
"correct" answers. The goal is honest gut reactions, not considered opinions.

**The phase structure mirrors the project roadmap:**
- Phase 6 questions = discovery data (what do you like?)
- Phase 7 questions = emotional data (what does it make you feel?)
- Phase 8 questions = feeling data (deeper than emotion — bodily/comfort level)
- Phase 9 questions = scale/frequency data (relative preferences)
- Phase 10 questions = environmental data (where would you live with this color?)
- Phase 11 questions = cultural/identity data (heritage, future, trust)

Each phase builds the dataset for the corresponding project phase. When Phase 7
(Emotions) is developed, all Phase 7 survey data will be ready to train on.

---

## The Profile Algorithm — How It Derives Your Colors

```
1. Get favGroup = COLOR_GROUPS.find(g => g.id === answers.fav_color)
2. brightnessVal (1–9 scale) → lightnessPref: dark | mid | light
   dark: val ≤ 3, light: val ≥ 7, mid: otherwise
3. satVal (1–9 scale) → saturationPref: muted | moderate | vivid
   muted: val ≤ 3, vivid: val ≥ 7, moderate: otherwise
4. L = { dark: 30, mid: 50, light: 70 }[lightnessPref]
5. S = { muted: 35, moderate: 60, vivid: 85 }[saturationPref]
6. primaryHex = hslToHex(favGroup.hueCenter, S, L)
7. secondaryHex = hslToHex((favGroup.hueCenter + 120) % 360, S-10, L+5)  ← triadic
8. accentHex = hslToHex((favGroup.hueCenter + 240) % 360, S-5, L-5)      ← triadic
```

The personality text, emotional tone, and keywords are looked up from per-group
static maps. These will eventually be replaced by AI-generated insights derived from
aggregate survey data (Phase 11).

---

## The Tech Stack — Why These Choices

| Choice | Why |
|---|---|
| **Next.js App Router** | Server components for SEO, client components for interactivity |
| **Tailwind CSS v4** | Co-located styles, no CSS file sprawl. Note: use `next/font` not `@import url()` |
| **No color data files** | 1.87M colors is too much to store. Pure math is instant, deterministic, and infinitely scalable |
| **Drizzle ORM** | Type-safe SQL, works on Cloudflare Workers (no native addons) |
| **PostgreSQL** | JSONB for flexible answer storage, UUID for anonymous session IDs |
| **CSS `::after` for effects** | Keeps base color in `backgroundColor` (always readable), effects are purely visual overlay |
| **`position: relative; overflow: hidden`** | Required on every swatch that uses render classes — otherwise `::after` leaks outside the element |

---

## Critical Rules — Don't Break These

### 1. Never use `@import url(google fonts)` in globals.css
Tailwind v4 + tw-animate-css expand to thousands of lines. Google Font imports after
those lines hit PostCSS's character position limit and crash the build with a `500`.
**Always use `next/font/google` in `app/layout.tsx` instead.**

### 2. Every swatch with a render class needs `position: relative` + `overflow: hidden`
The `::after` pseudo-elements use `position: absolute; inset: 0`. Without `position: relative`
on the parent, the effect element escapes to the nearest positioned ancestor.
Without `overflow: hidden`, the shimmer sweep on Metallic mode leaks outside the rounded corners.

### 3. Don't store color data in a database
The algorithmic generator is the database. A row for every variant would be 1.87M rows.
The generator is deterministic — same ID always produces same color. Store IDs, not values.

### 4. `db/index.ts` uses `cache()` scoped per request — don't change this pattern
Cloudflare Workers isolates forbid reusing I/O objects (DB sockets) across requests.
The `cache()` wrapper from React creates a per-request singleton. This prevents the
cross-request connection reuse that causes Error 1101 on cold starts.

### 5. Survey data is the project's most valuable asset
Every survey response is a data point in a future AI training set. Never delete real
responses. Add soft-delete if needed. Back up the database.

---

## File Map — Where to Find Things

```
/lib/colors.ts              ← Color engine (all generation logic lives here)
/app/globals.css            ← Theme variables + render mode @keyframes
/app/layout.tsx             ← Root layout, fonts, nav
/components/NavBar.tsx      ← Navigation bar
/app/page.tsx               ← Landing page
/app/explore/
  page.tsx                  ← Server wrapper
  ExplorerClient.tsx        ← Full explorer UI (groups → subclasses → variants)
/app/survey/
  page.tsx                  ← Server wrapper
  SurveyClient.tsx          ← 24-question survey, 6 steps, DB save on submit
/app/profile/
  page.tsx                  ← Server wrapper
  ProfileClient.tsx         ← Profile derivation + display
/app/about/page.tsx         ← 13-phase roadmap (pure server component)
/app/api/survey/route.ts    ← POST (save) + GET (list) survey responses
/db/index.ts                ← Drizzle client (request-scoped via React cache)
/db/schemas/survey.ts       ← survey_responses table definition
/public/logo*.png           ← Brand assets
/.github/TODO.md            ← Living task list by phase
/.github/WHAT_I_BUILT.md    ← Build history and file documentation
/.github/UNDERSTANDING.md   ← This file
```

---

## What Doesn't Exist Yet (Highest Priority Next Steps)

1. **Lab color values** — CIELAB is perceptually uniform, essential for "find nearest color"
2. **Color relationship engine** — complementary, analogous, triadic calculators
3. **Natural language search** — "calm blues", "earthy greens" → color results
4. **Analytics dashboard** — aggregate survey responses, most loved colors, trends
5. **Profile persistence** — save profiles to DB with a shareable URL
6. **Hex search in explorer** — type `#FF6B35`, get the closest variant ID

---

## The Long Vision — Where This Is Going

The 144,000 Color Project is not trying to be another design tool.

The permanent ID system is the foundation for a future where:
- A doctor can say "patients in palliative care respond better to colors C07_SC018_V0400 through V0600"
- A teacher can say "students focus better under this specific blue, identified by its permanent ID"
- An AI can say "based on 10 million human responses, this exact color correlates with hope across 47 cultures"
- A person can say "my color is C09_SC072_V0500 — that's the specific shade of blue I feel most like"

The goal is a universal color language — as precise and permanent as the periodic table,
but built on human experience rather than atomic weight.

---

*This document should be updated every time a significant feature is added or a major
architectural decision is made. It is the institutional memory of the project.*
