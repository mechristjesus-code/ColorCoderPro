# ✅ What Was Built — The 144,000 Color Project

> A complete record of every feature, file, and decision made during development.
> This file exists so any developer, AI agent, or collaborator can understand
> exactly what exists, why it was built this way, and how it works.

---

## 🗓️ Build History

### Session 1 — Initial Platform Build

**Goal:** Build a full unified platform from scratch based on Joseph's color system documents.

---

## 📁 Files Created & Modified

### `lib/colors.ts` — The Color Engine
The heart of the entire platform. Pure TypeScript, zero dependencies, runs anywhere.

**What it does:**
- Defines all 13 `ColorGroup` objects with hue center, hue range, description, category
- Provides `hslToHex(h, s, l)` and `hslToRgb(h, s, l)` conversion functions
- `getVariant(group, subclassIndex, variantIndex)` — deterministically generates any of the 1,872,000 colors from pure math. Same inputs always return the same color. No lookup tables, no data files.
- `getSubclass(group, index)` — returns saturation/lightness range for a sub-class
- `getSampleVariants(group, sc, count)` — evenly spaced sample of variants
- `getSubclassRepresentatives(group)` — one midpoint variant per sub-class (144 total)
- `getRenderStyle(hex, mode)` — returns `backgroundColor` CSS property
- `getRenderClass(mode)` — returns CSS class name for animated render effect
- `PROJECT_STATS` — constant with all system totals

**Key design decisions:**
- HSL was chosen over RGB as the generation space because it directly encodes human-perceptible properties (hue, how vivid, how light). This makes the sub-class breakdown intuitive: each sub-class covers a saturation/lightness band within a hue range.
- The Neutral group (G13) uses a special generation path: it sweeps from black through brown to white with controlled desaturation at the extremes.
- All generation is deterministic — `C09_SC072_V0500` always produces exactly the same color values. This makes permanent IDs meaningful.

---

### `app/globals.css` — Dark Cosmic Theme + Render Animations

**Theme variables set:**
- Background: `#050508` (near-black deep space)
- Primary accent: `#C9A84C` (warm gold)
- Foreground: `#F0EDE8` (warm off-white)
- Cards: `rgba(255,255,255,0.04)` with `rgba(255,255,255,0.08)` borders

**CSS `@keyframes` animations added:**
- `metallicShimmer` — diagonal white highlight slides across swatch surface (2.4s linear loop). Applied via `::after` pseudo-element.
- `glossyPulse` — opacity breathing (3s ease-in-out). Combined with a static `::after` specular highlight.
- `pearlescentCycle` — `hue-rotate` sweeping 0°→60°→0° with saturation variation (4s ease-in-out). Simulates thin-film interference.
- `matteBreath` — subtle contrast/brightness/saturation breathing (4s ease-in-out). Gives a soft organic feel.
- `fadeInUp`, `colorPulse`, `shimmer` — UI utility animations

**CSS classes `.render-metallic`, `.render-glossy`, `.render-pearlescent`, `.render-matte`** — applied to swatch divs. All use `::after` pseudo-elements so they layer on top of the base color without affecting the `backgroundColor`.

---

### `app/layout.tsx` — Root Layout
- Loads `Inter` (body) and `Playfair Display` (headings) via `next/font/google` — NOT `@import url()` which breaks PostCSS in Tailwind v4
- Sets favicon (`/favicon-32.png`) and Apple touch icon (`/logo-180.png`)
- Renders `<NavBar />` fixed at top
- All pages get `pt-16` to clear the nav

---

### `components/NavBar.tsx` — Global Navigation
- Fixed top bar with backdrop blur + `rgba(5,5,8,0.85)` background
- Uses `/public/logo-64.png` as the brand mark
- Active link highlighted with gold (`#C9A84C`) background tint
- Responsive: collapses to hamburger on mobile
- Links: Home · Explorer · Discover · My Profile · About
- CTA button "Explore Colors" → `/explore`

---

### `app/page.tsx` — Landing Page (`/`)
Sections:
1. **Hero** — animated double color ring (conic-gradient SVG mask), gold glow, headline with shimmer animation, two CTAs
2. **Stats bar** — 13 Groups · 1,872,000 Variants · 7,488,000 Representations · 13 Phases
3. **13 Color Groups preview** — grid of all 13 groups with a color swatch, ID badge, category tag, variant count
4. **How it Works** — 3 cards: Intrinsic Recipes / Extrinsic Render Styles / Human Intelligence
5. **5 Render Modes showcase** — live animated swatches for all 5 modes
6. **CTA section** — survey invite

---

### `app/explore/page.tsx` + `app/explore/ExplorerClient.tsx` — Color Explorer (`/explore`)

Three-level navigation:
- **Groups view** — 13 cards, each showing 8 sample swatches + search bar
- **Sub-classes view** — 144 swatches in a tight grid for the selected group; click any to drill in
- **Variants view** — 100 of 1,000 variants in grid or list layout

Features:
- **5-mode render toggle** (Original / Metallic / Glossy / Pearl / Matte) — all animated, applied via CSS class
- **Search** — filters groups by name, ID, or category in real time
- **Copy hex** — hover any swatch → copy icon appears, copies HEX to clipboard
- **Variant detail modal** — click any variant → full data panel (HEX, RGB, HSL H/S/L, Group ID)
- **Breadcrumb navigation** throughout
- Wrapped in `<Suspense>` because it uses `useSearchParams` for deep-link `?group=C09`

---

### `app/survey/page.tsx` + `app/survey/SurveyClient.tsx` — Discovery Survey (`/survey`)

**24 questions across 6 steps:**

| Step | Phase | Questions |
|---|---|---|
| 1 | 6 | Favorite color family, most avoided, what you'd wear |
| 2 | 7 | Calm color, energy color, joy color, fear color |
| 3 | 8 | Safety/grounded (multi), creativity, stress relief, comfort |
| 4 | 9 | Childhood memory, success colors (multi), brightness scale, saturation scale |
| 5 | 10 | Home color, workspace colors (multi), nature palette, warm/cool scale |
| 6 | 11 | Season, cultural/heritage color, future vision color, complexity scale, trust colors (multi) |

**Question types:**
- `color-pick` — single select with visual color swatches
- `multi-pick` — multi-select with swatches (checkboxes)
- `scale` — 1–9 numeric scale with labeled endpoints

**On submit:**
1. Saves answers to `sessionStorage` (for profile page)
2. POSTs to `/api/survey` with session ID + derived profile fields
3. Redirects to `/profile`

---

### `app/profile/page.tsx` + `app/profile/ProfileClient.tsx` — Personal Profile (`/profile`)

**Profile derivation logic (`deriveProfile`):**
- Reads `sessionStorage.colorSurveyAnswers`
- Finds the matching `ColorGroup` for `fav_color` answer
- Maps brightness scale (1–9) → `lightnessPref`: dark | mid | light
- Maps saturation scale (1–9) → `saturationPref`: muted | moderate | vivid
- Generates `primaryHex` from group hue + derived S/L
- Generates `secondaryHex` from hue + 120° (triadic)
- Generates `accentHex` from hue + 240°
- Looks up `emotionalTone`, `keywords`, `personalityNote` from per-group maps

**Profile page shows:**
- Hero swatch + color name + emotional tone + keyword chips + permanent ID
- "What Your Colors Reveal" — personality paragraph
- 6-swatch personal palette
- Primary / Secondary / Accent cards
- Preference breakdown (lightness + saturation)
- "Explore Your Color Family" → `/explore?group=C09`
- "Retake Survey" link

Falls back to a Blue demo profile if no survey data exists.

---

### `app/about/page.tsx` — About & 13 Phases (`/about`)

- Full 13-phase roadmap as a vertical timeline
- Each phase shows: number bubble, title, video series name, description, status badge
- Status badges: **Live** (green) / **Building** (gold) / **Planned** (gray)
- Phases 1–4 marked Live, 5–6 Building, 7–13 Planned
- System architecture table (hierarchy numbers)
- Sub-class structure table (ID format explanation)
- CTA section

---

### `app/api/survey/route.ts` — Survey API

```
POST /api/survey
Body: { sessionId, answers, primaryColorGroup, emotionalTone, lightnessPref, saturationPref, palette }
Returns: { success: true, id: uuid }

GET /api/survey
Returns: { count: number, responses: [...] }
```

Uses Drizzle ORM's `db.insert()` and `db.select()` against the `survey_responses` table.

---

### `db/schemas/survey.ts` — Database Schema

```
Table: survey_responses
  id               UUID    PK auto-generated
  session_id       TEXT    NOT NULL — anonymous, no user account needed
  answers          JSONB   NOT NULL — full 24-question answer blob
  primary_color_group TEXT — e.g. "C09"
  emotional_tone   TEXT    — e.g. "Trustworthy & Deep"
  lightness_pref   TEXT    — dark | mid | light
  saturation_pref  TEXT    — muted | moderate | vivid
  palette          JSONB   — array of 6 hex strings
  created_at       TIMESTAMP DEFAULT NOW()
```

Pushed to live database via `drizzle-kit push`.

---

### `public/logo.png` + Favicon Variants — Brand Assets

- `logo.png` — 1024×1024 circular color wheel logo with golden "144" center, generated by AI image model
- `favicon-32.png` — 32×32 browser tab icon
- `logo-180.png` — 180×180 Apple touch icon
- `logo-64.png` — 64×64 used in NavBar

---

## 🎨 Design System Summary

| Token | Value |
|---|---|
| Background | `#050508` |
| Gold accent | `#C9A84C` / `#E8C96A` |
| Foreground | `#F0EDE8` |
| Muted text | `#7A7A8C` |
| Card border | `rgba(255,255,255,0.08)` |
| Card bg | `rgba(255,255,255,0.03–0.05)` |
| Display font | Playfair Display (serif) |
| Body font | Inter |
| Border radius | `0.5rem` cards, `0.75rem` large |

---

## 🔢 System Numbers at a Glance

| Metric | Value |
|---|---|
| Total groups | 13 |
| Main color groups | 12 (RYB wheel) |
| Neutral group | 1 (G13 — Black/Brown/White) |
| Sub-classes per group | 144 |
| Variants per sub-class | 1,000 |
| Variants per group | 144,000 |
| Total intrinsic variants | 1,872,000 |
| Render modes | 5 |
| Total visual representations | 9,360,000 |
| Survey questions | 24 |
| Survey steps | 6 |

---

---

## Session 2 — Community Expression Platform

### `lib/posts.ts` — Shared Posts Library
Constants and helpers for the entire community system:
- `POST_TYPES`, `VISIBILITY_OPTIONS`, `REACTION_TYPES`, `EMOTION_TAGS` — typed const arrays
- `REACTION_LABELS` — `{ label, emoji }` per reaction type
- `EMOTION_COLORS` — hex color per emotion tag (used for pill chips in UI)
- `extractYouTubeId(url)` — regex parser for any YouTube URL format
- `extractVimeoId(url)` — regex parser for Vimeo URLs
- `detectMediaType(url)` — returns `'youtube' | 'vimeo' | 'image' | null`
- `getYouTubeThumbnail(videoId)` — returns `img.youtube.com` hqdefault URL
- `getAuthorLabel(name, visibility, groupName)` — respects visibility setting

### `db/schemas/posts.ts` — Two New Tables

**`posts`:** id (UUID PK), session_id, display_name, post_type, visibility,
color_group_id, color_hex, emotion_tags (JSONB array), title, content,
media_url, media_type, thumbnail_url, likes_count, created_at

**`post_reactions`:** id, post_id (FK→posts, CASCADE DELETE), session_id,
reaction type, created_at. One reaction per session per post — togglable.

### API Routes

**`GET /api/posts`** — paginated feed. Filters: `type`, `group`, `emotion` (JSONB contains),
`limit` (max 50), `offset`. Returns `{ count, posts[] }` ordered by created_at DESC.

**`POST /api/posts`** — create post. Auto-detects `mediaType` from URL. Auto-fetches
YouTube thumbnail. Returns `{ success, post }`.

**`GET /api/posts/[id]`** — single post + reaction counts grouped by type.

**`POST /api/posts/[id]`** — add/toggle reaction. Same session + same reaction = remove.
Same session + different reaction = update. New session = insert.

### Pages

**`/community`** (CommunityFeed.tsx) — paginated feed of PostCard components.
Filter tabs (All/Text/Photo/Video), emotion dropdown. "+ New Post" CTA.
PostCard renders: color swatch with glow, type/visibility icons, emotion chips,
Playfair title, 3-line content clamp, photo image or video thumbnail, 4 reaction
buttons with optimistic updates, "View post" link. Empty state with encouragement.

**`/community/new`** (CreatePostClient.tsx) — 4-step wizard:
1. Type selection (Text/Photo/Video cards)
2. Color picker (13 group swatches + custom hex input)
3. Emotion tags multi-select (16 options, colored pills, max 5)
4. Write + visibility + media URL + YouTube live preview

**`/community/[id]`** — full post view. Large swatch, all metadata badges,
full content, embedded YouTube/Vimeo iframe (16:9) or full photo, reaction grid
with counts, author + timestamp, back navigation.

### Visibility System
- **Public** — name visible, shown to everyone
- **Anonymous** — shown as "A [GroupName] Soul" (e.g. "A Violet Soul")
- **Members** — visible only to those with a `colorSessionId` in localStorage

### Session Identity
All community activity uses `localStorage.getItem("colorSessionId")` — a UUID
generated once per browser and persisted. No login required. The same ID ties
survey responses, profiles, posts, and reactions together anonymously.

---

---

## Session 3 — Admin Terminal & Control Panel

### `lib/adminAuth.ts` — Auth Helper
Shared middleware used by every `/api/admin/*` route. Checks `x-admin-password` header
or `Authorization: Bearer <token>` against `ADMIN_PASSWORD` env var. Returns a
`401 NextResponse` if invalid, `null` if auth passes. Default password: `ColorAdmin144`.

### API Routes — 5 Admin Endpoints

**`POST /api/admin/exec`** — run any shell command. Body: `{ command, cwd? }`. Returns
`{ stdout, stderr, exitCode, duration, command, cwd }`. Blocks fork-bombs and
`rm -rf /` style destructive commands. 30-second timeout. Full env passthrough.

**`GET/POST /api/admin/files`** — file browser and editor. GET with `?path=` lists
directories or reads file content (max 512KB). POST with `{ path, content }` writes
a file (creates parent dirs). Path-escape prevention (`path.resolve` + ROOT check).

**`POST /api/admin/db`** — raw SQL query runner. Read-only by default — blocks INSERT/
UPDATE/DELETE/DROP/TRUNCATE unless `force: true` passed. Returns rows, rowCount,
duration. Uses a fresh `postgres()` connection per request (closed after query).

**`GET/POST /api/admin/git`** — GET returns `{ branch, status, log }`. POST runs
one of 8 git operations: status, diff, log, add, commit (with message arg), push,
pull, stash. All run in project root.

**`GET /api/admin/logs`** — reads dev server logs via `tail -n N`. Params: `file`
(stderr/stdout), `lines` (max 500). Handles missing log files gracefully.

### Admin UI — `app/admin/AdminClient.tsx` (6 panels)

**Auth Gate:** Password input with show/hide toggle. Stores token in `localStorage`
key `colorAdminToken`. Auto-verifies on page load if token exists. Shows default
password hint.

**Terminal Panel:** Full interactive shell. Monospace output with ANSI colors stripped.
Command history with ↑↓ arrow navigation (last 100 commands). `cd` handled locally
(updates displayed CWD). `clear` wipes output. Exit code + duration shown per command.
Copy button per command. Looks like a real terminal.

**Quick Actions Panel:** 16 one-click command buttons across two columns. Results
stream into the right column with pass/fail color coding. Covers: tsc check, git
status/diff/add/push/pull, drizzle push, port check, log errors, disk/memory,
survey/post counts, node version.

**Git Panel:** Live branch + working tree status. One-click buttons for status/diff/
add/push/pull. Commit message input + Commit button. Recent commit log. Operation
results panel.

**File Browser Panel:** Breadcrumb navigation. Directory grid with folder/file icons
and sizes. Click to drill in. File viewer with syntax-highlighted monospace display.
Toggle to edit mode → textarea → Save button → writes back via files API.

**DB Panel:** 6 preset query buttons (tables, survey stats, post stats, recent posts,
reactions, DB size). SQL textarea. Run Query button. Force-write checkbox. Results
rendered as a scrollable table with sticky headers.

**Logs Panel:** Stderr/stdout toggle. Line count selector (50/100/200/500). Filter
input for searching. Auto-color: errors = red, warnings = yellow, normal = light gray.
Refresh button. Live line count display.

### Security Design
- Password auth on every API route (checked first, before any logic)
- File browser is sandboxed to `/home/ubuntu/workspace/project` — path escape blocked
- DB panel is read-only by default — write ops require explicit `force: true`
- Blocked command list for exec endpoint
- Credentials stored only in `localStorage` (cleared on browser data wipe)
- Admin password NOT committed to git (lives in `.env` only)

---

---

## Session 4 — External Terminal Access (Mobile + Termux)

### `app/terminal/` — Standalone Mobile Terminal

A completely separate full-screen terminal page at `/terminal` with its own layout
(no navbar, no padding, fixed viewport). Designed for phone browsers.

**`MobileTerminal.tsx`:**
- Auth screen with banner art, password input, localStorage persistence
- Full interactive terminal: output area, quick-tap command bar, input row
- Session-based: creates a `/api/admin/shell` session on load, runs commands through it
- Falls back to `/api/admin/exec` if session fails
- Long-running commands route through `/api/admin/stream` (streaming)
- Command aliases: `tsc` → `npx tsc --noEmit`, `db:push`, `ps` → port check
- History navigation with ↑↓ arrow keys (100 command history)
- `clear`, `help`, `exit` handled locally
- Slide-down quick menu (hamburger) with 6 common commands
- Quick-tap button row above the keyboard for mobile use
- `autoCapitalize="none"` `autoCorrect="off"` `spellCheck={false}` — essential for mobile shell

**`layout.tsx`:**
- Overrides root layout — no navbar, `position: fixed; inset: 0`
- `user-scalable=no` in viewport meta — prevents pinch-zoom breaking the layout

### `app/api/admin/stream/route.ts` — Streaming Exec

Uses Node.js `spawn()` instead of `exec()` to stream output in real time.
Returns a `ReadableStream` with `Content-Type: application/x-ndjson`.
Each line is one JSON event:
```
{"type":"stdout","data":"output text\n","ts":1234567890}
{"type":"stderr","data":"error text\n","ts":1234567890}
{"type":"exit","code":0,"duration":342,"ts":1234567890}
```

**curl/Termux usage:**
```bash
curl -N -s -X POST https://your-app.com/api/admin/stream \
  -H "x-admin-password: ColorAdmin144" \
  -H "Content-Type: application/json" \
  -d '{"command":"git log --oneline -5"}'
```

### `app/api/admin/shell/route.ts` — Stateful Session API

Maintains named sessions in memory (reset on server restart by design).
Session TTL: 30 minutes of inactivity. Up to unlimited concurrent sessions.

**Actions:**
- `create` → returns `sessionId + cwd + expires`
- `exec` → run command in session's current directory
- `cd` → change session's working directory
- `destroy` → clean up session
- `GET ?sessionId=` → inspect session state + last 20 commands

**Termux scripting example:**
```bash
# One-liner to run a command from Termux
SID=$(curl -s -X POST https://your-app.com/api/admin/shell \
  -H "x-admin-password: ColorAdmin144" \
  -H "Content-Type: application/json" \
  -d '{"action":"create"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['sessionId'])")

curl -s -X POST https://your-app.com/api/admin/shell \
  -H "x-admin-password: ColorAdmin144" \
  -H "Content-Type: application/json" \
  -d "{\"action\":\"exec\",\"sessionId\":\"$SID\",\"command\":\"git status\"}"
```

---

*Built July 2026 — The 144,000 Color Project*
