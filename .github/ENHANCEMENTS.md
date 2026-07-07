# ✨ ENHANCEMENTS — Improvements to What Already Exists

> This file tracks ideas for making existing features better, deeper, and more polished.
> These are NOT new features — they are refinements to things already built.
> An enhancement makes something good become great.
>
> **Difference from UPGRADES:** Enhancements are about quality, polish, and depth.
> Upgrades are about capability and scope (see UPGRADES.md).
> Difference from POSSIBILITIES: Enhancements are concrete and near-term.
>
> Format: each item has a target (what it improves), a description, and a priority.
> Priority: 🔥 Do soon · ⭐ Do when ready · 💭 Someday

---

## 🎨 Color Explorer Enhancements

### 🔥 Animated entry for swatches on group open
**Target:** `ExplorerClient.tsx` — SubclassesView
When a user drills into a group and the 144 sub-class swatches appear, they currently
pop in instantly. Enhance with a staggered `animation-delay` fade-in — swatches
cascading in left-to-right, row by row. Makes the grid feel like a color universe
revealing itself rather than a page load.

### 🔥 Hover tooltip with color name + ID
**Target:** `ExplorerClient.tsx` — all swatch grids
Currently hovering a sub-class swatch only shows a `title` attribute (browser tooltip).
Replace with a custom floating tooltip showing the color ID, hex value, and HSL
breakdown. Appears on hover with a smooth fade-in, positioned above the swatch.

### ⭐ Render mode transition animation
**Target:** `ExplorerClient.tsx` — RenderModeToggle + all swatches
When switching render modes, swatches currently snap instantly. Add a 200ms
`transition: filter 0.2s ease, opacity 0.15s ease` so the mode change sweeps across
the grid visually — making the transformation feel alive rather than mechanical.

### ⭐ Sub-class grid labels on hover
**Target:** `ExplorerClient.tsx` — SubclassesView grid
The 144-swatch grid currently has no visible labels. On hover, show a small overlay
with the sub-class number (SC001–SC144) inside the swatch, so users know exactly
which sub-class they're about to click into.

### ⭐ Color count badge per group
**Target:** `app/page.tsx` — group cards + `ExplorerClient.tsx` — GroupsView
Replace the plain "144,000 variants" text with a styled badge that also shows the
render mode count dynamically: "144,000 × 5 = 720,000 visual states." Updates
automatically if render modes are ever added or removed.

### 💭 Keyboard navigation in the explorer
**Target:** `ExplorerClient.tsx`
Arrow keys to move between swatches. Enter to select. Escape to go back a level.
Makes the explorer usable without a mouse and more accessible overall.

---

## 📋 Survey Enhancements

### 🔥 Question transition animation between steps
**Target:** `SurveyClient.tsx`
Currently the page jumps between steps. Add a slide-out/slide-in animation when
advancing or going back. The current step slides left as the next one slides in from
the right. Going back reverses direction. Makes the survey feel like a flowing
experience rather than a form.

### 🔥 Swatch glow on selection
**Target:** `SurveyClient.tsx` — ColorPickQuestion + MultiPickQuestion
When a color option is selected, the swatch should pulse with a glow animation —
a quick bloom of the color's own hex value as a `box-shadow`, then settling to a
steady glow. Confirms the selection with a satisfying visual response.

### ⭐ Progress stepper labels on desktop
**Target:** `SurveyClient.tsx` — progress section
The current step labels show just the first word. On desktop (≥768px), show the
full step title beneath each progress pip. On mobile, keep the abbreviated version.

### ⭐ "Why we ask this" tooltip per question
**Target:** `SurveyClient.tsx`
Each question has a phase number badge. Enhance that badge into a clickable info
button — on click, shows a one-sentence explanation of which phase of the project
this data feeds into. Connects the survey experience to the larger vision.

### 💭 Auto-advance on color-pick selection
**Target:** `SurveyClient.tsx` — single-select questions only
When a user makes a single-pick color selection, auto-scroll to the next question
after a 400ms delay (long enough to see the selection confirmed). Reduces friction —
the survey flows without requiring a separate tap. Multi-pick and scale questions
still require manual Next.

---

## 🎯 Profile Page Enhancements

### 🔥 Animated palette reveal
**Target:** `ProfileClient.tsx`
The 6 palette swatches currently appear all at once. Stagger their entrance with
`animation-delay: 0.1s × index` — each swatch fades and scales up in sequence.
Feels like the profile is being assembled in real time.

### 🔥 Copy full palette as HEX list
**Target:** `ProfileClient.tsx`
Add a "Copy Palette" button beneath the 6 swatches. One click copies all 6 hex values
as a newline-separated list to the clipboard. Useful for designers who want to take
their personal palette into Figma, Photoshop, or any other tool.

### ⭐ "What this means for design" section
**Target:** `ProfileClient.tsx`
Below the palette, add a short section showing the profile's colors applied to a
mini UI mockup — a button, a card, a text block — so users can see their colors
working together in a real context. Static but personalized.

### ⭐ Color temperature label
**Target:** `ProfileClient.tsx` — preference breakdown section
Add a third preference chip alongside lightness and saturation: **Temperature**
(warm / neutral / cool), derived from the `fav_color` group's hue position on the wheel.
Reds/oranges/yellows = warm. Blues/violets = cool. Greens/neutrals = balanced.

### 💭 Profile share image generation
**Target:** `ProfileClient.tsx`
A "Download My Color Card" button that generates a styled PNG of the profile —
showing the primary color swatch, emotional tone, palette swatches, and permanent ID.
Shareable on social media. Built using HTML Canvas or a server-side render route.

---

## 🗺️ About Page Enhancements

### ⭐ Phase completion percentage bar
**Target:** `app/about/page.tsx`
Next to each phase's status badge, add a thin horizontal progress bar showing
estimated % completion. Phase 1–4 at 100%. Phase 5–6 at ~30%. Phase 7–13 at 0%.
Updates as work progresses — a visual sense of the project's momentum.

### ⭐ Animated phase number on scroll
**Target:** `app/about/page.tsx`
As the user scrolls down the roadmap, each phase number bubble animates into view
(scale from 0.5 to 1.0 with a bounce easing) when it enters the viewport.
Uses `IntersectionObserver`. Makes the roadmap feel alive as you descend through it.

### 💭 Phase click-to-expand detail
**Target:** `app/about/page.tsx`
Each phase row is currently static. Make them expandable — click to reveal the full
list of features planned for that phase (pulled from TODO.md data), a link to related
survey questions, and an estimated timeline. Accordion pattern using Radix UI.

---

## 🧭 Navigation & Global Enhancements

### 🔥 Active page indicator in NavBar
**Target:** `components/NavBar.tsx`
The active link currently gets a background tint. Enhance with a thin gold underline
(`border-bottom: 2px solid #C9A84C`) that slides in with a `scaleX` transform from 0
to 1 on mount. A more refined active state than a background tint alone.

### ⭐ Page transition fade
**Target:** `app/layout.tsx`
Wrap `{children}` in a client component that applies a subtle `opacity: 0 → 1`
fade on route change. 150ms ease. Removes the jarring hard-cut between pages and
makes the platform feel like a cohesive experience.

### ⭐ "Back to top" button on long pages
**Target:** Global (About, Survey, Explorer)
A small floating button that appears after scrolling 400px down, anchored bottom-right.
Gold circle with an up arrow. Smooth-scrolls to top on click. Essential on the About
page (very long) and the Explorer variants view.

### 💭 Keyboard shortcut overlay
**Target:** Global
Press `?` anywhere to show a modal with keyboard shortcuts: `E` → Explorer,
`S` → Survey, `P` → Profile, `A` → About, `Escape` → close modal / go back.
Makes power users feel at home.

---

## 🌑 Landing Page Enhancements

### 🔥 Color ring uses real animated render mode
**Target:** `app/page.tsx` — hero section
The conic-gradient color ring in the hero is static. Add a slow `rotate` animation
(one full rotation every 60 seconds). Also add a second counter-rotating ring at a
slightly different speed — creating a hypnotic, living color wheel effect.

### ⭐ Stats bar count-up animation
**Target:** `app/page.tsx` — stats bar
The numbers 1,872,000 and 7,488,000 count up from 0 when they first enter the
viewport. Uses `IntersectionObserver` + a `requestAnimationFrame` counter. Turns
raw numbers into a moment of revelation as the scale of the system sinks in.

### ⭐ Group cards color on hover
**Target:** `app/page.tsx` — 13 Color Groups grid
When hovering a group card, the card's border color transitions to match the group's
primary hue, and a subtle glow with that color's hex value appears. Each card becomes
a window into its color.

---

*Enhancements are the craft layer — they make users feel the care that went into this.*
*Last updated: July 2026*
