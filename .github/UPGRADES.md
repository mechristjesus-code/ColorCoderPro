# 🔧 UPGRADES — Capability & Scope Expansions

> This file tracks specific, buildable upgrades — new capabilities, new systems,
> new features that expand what the platform can DO.
> These are concrete enough to start building when the time comes.
>
> **Difference from ENHANCEMENTS:** Upgrades add new power. Enhancements polish
> what's already there. An upgrade changes what's possible. An enhancement changes
> how good it feels.
> Difference from POSSIBILITIES: Upgrades have a clear technical path. Possibilities
> are still visions.
>
> Format: each upgrade has a status, scope estimate, and clear description of
> inputs/outputs so it can be handed to a developer or AI agent directly.
>
> Status: 🟢 Ready to build · 🟡 Needs design first · 🔴 Blocked (dependency listed)

---

## 🖥️ Admin Terminal & Control Panel
**Status:** ✅ BUILT — July 2026
**Scope:** Large (5 API routes, 1 auth lib, 6-panel UI)

Full web-based admin control panel at `/admin`. Password-protected via `ADMIN_PASSWORD` env var.

**Six panels:**
- **Terminal** — interactive shell, command history (↑↓), `cd` support, exit code + duration per command
- **Quick Actions** — 16 one-click buttons (tsc, git, deploy, DB counts, log errors, port check)
- **Git** — live status, one-click add/commit/push/pull, commit message input, recent log
- **Files** — full file browser with drill-down, view + edit + save any file in the project
- **Database** — SQL query runner, read-only by default, preset queries, scrollable table results
- **Logs** — dev server stderr/stdout viewer, filter, line count, auto-color by severity

**AI access:** Every panel's functionality is also available via direct API calls:
```
POST /api/admin/exec     { command, cwd? }          → { stdout, stderr, exitCode }
GET  /api/admin/files?path=   → directory listing / file content
POST /api/admin/files    { path, content }           → write file
POST /api/admin/db       { sql, force? }             → query results
GET  /api/admin/git                                  → branch + status + log
POST /api/admin/git      { op, args? }               → git operation
GET  /api/admin/logs?file=stderr&lines=100           → log lines
```
All routes require `x-admin-password` or `Authorization: Bearer <token>` header.

---

## 🌐 Color Community — Expression & Sharing Platform
**Status:** ✅ BUILT — July 2026
**Scope:** Large (2 DB tables, 4 API routes, 4 new pages)

Full community sharing layer built around color and emotion. Three post types:

- **Text posts** — written emotional expressions tied to a color and emotion tags
- **Photo posts** — image URL shared with color + emotion context
- **Video posts** — YouTube/Vimeo links embedded in feed with reflection text

Three visibility modes: **Public** (name shown), **Anonymous** (shows as "A Blue Soul"),
**Members** (visible only to survey completers via session ID).

Four reaction types: 🌊 Resonates · 💫 Moving · ⚡ Powerful · 🕊️ Peaceful (toggle on/off).

**Pages built:**
- `/community` — paginated feed with filters by type, emotion, color group
- `/community/new` — 4-step creation wizard (type → color → emotions → write/share)
- `/community/[id]` — full post view with reactions

**DB tables:** `posts`, `post_reactions` (with cascade delete)
**API routes:** `GET/POST /api/posts`, `GET/POST /api/posts/[id]`
**Lib:** `lib/posts.ts` — shared constants, emotion colors, YouTube/Vimeo parsers

**Next phase for this feature:**
- Native video upload (replace link-embed with actual hosting)
- Comments system
- Image upload (replace URL with file upload)
- User accounts for persistent identity across sessions

---

## 🔗 Color Relationship Engine
**Status:** ✅ BUILT — July 2026
**Scope:** Medium (1 new lib file + 1 new page + explorer integration)

The core mathematical relationships between colors, computed from any color ID.

### What it computes:
- **Complementary** — hue + 180° (the direct opposite on the wheel)
- **Analogous** — hue ±30° (neighbors on the wheel, 2 colors)
- **Triadic** — hue + 120°, hue + 240° (3 equidistant points)
- **Split-complementary** — hue + 150°, hue + 210° (softer than full complement)
- **Tetradic / Square** — hue + 90°, hue + 180°, hue + 270° (4 colors)
- **Double Split-complementary** — hue ±30° + hue + 180° ±30° (6 colors)

### What it returns:
For each relationship type: the target hue → find the closest matching color ID in
the 144,000 system → return that variant with hex, ID, group name.

### Where it lives:
- `lib/colorRelationships.ts` — pure math functions, no UI
- `/explore` — "Relationships" tab in the variant detail modal
- `/color/[id]` — future individual color page (see POSSIBILITIES)

---

## 🔍 Advanced Color Search
**Status:** 🟢 Ready to build
**Scope:** Medium (API route + search UI in explorer)

Upgrade the current name-filter search to full multi-mode search:

| Input type | Example | Behavior |
|---|---|---|
| Hex code | `#FF6B35` | Convert to HSL → find nearest variant by Euclidean distance |
| Color ID | `C09_SC072` | Jump directly to that group/subclass |
| Keyword | `calm blue` | Match against group name + emotional keyword index |
| RGB | `255, 107, 53` | Convert → nearest variant |
| HSL | `hsl(215, 70%, 50%)` | Direct nearest variant lookup |

**API route:** `GET /api/colors/search?q=[query]`
Returns top 5 matching color variants with their IDs, hex, and group info.

---

## 📊 Survey Analytics Dashboard
**Status:** 🟢 Ready to build
**Scope:** Medium (new `/admin/analytics` page + DB aggregation queries)

A dashboard showing aggregate patterns from all survey responses.

### Panels to build:
- **Total responses** — count with daily trend sparkline
- **Most loved color** — which group wins `fav_color` most often
- **Most avoided color** — which group wins `least_fav` most often
- **Emotional associations** — which colors most often get paired with calm/joy/fear/energy
- **Lightness distribution** — pie chart of dark/mid/light preference split
- **Saturation distribution** — pie chart of muted/moderate/vivid
- **Response timeline** — bar chart of submissions per day
- **Top 10 primary color groups** — ranked by frequency

**DB queries needed:** `GROUP BY primary_color_group`, `COUNT(*)`, `AVG` on scale fields.
All run against `survey_responses` table via Drizzle ORM.

---

## 💾 Profile Persistence & Shareable URLs
**Status:** 🟡 Needs design first (auth vs. anonymous token decision)
**Scope:** Medium-Large

Currently profiles live only in `sessionStorage` — they disappear when the tab closes.

### Two options (choose one):
1. **Anonymous token** — on survey submit, generate a short token (e.g. `abc123`),
   save profile to DB under that token, redirect to `/profile/abc123`. No account needed.
   Share the URL to share your profile. Simple.
2. **User accounts** — full registration/login. Profiles saved permanently. History tracked.
   Heavier build — use the `register-login` skill when ready.

### DB additions needed:
```
color_profiles table:
  id          UUID PK
  token       TEXT UNIQUE  (for anonymous option)
  answers     JSONB
  primary_color_group TEXT
  emotional_tone TEXT
  palette     JSONB
  created_at  TIMESTAMP
```

### New page: `/profile/[token]` — publicly viewable profile card.

---

## 🎓 Color Education Pages
**Status:** 🟡 Needs content plan first
**Scope:** Large (13 group pages + supporting components)

One dedicated page per color group: `/learn/red`, `/learn/blue`, etc.

### Each page contains:
- Full sub-class spectrum displayed as a gradient strip
- Key color facts (hue range, primary/secondary/tertiary status)
- Emotional associations (from survey data when available, placeholder text until then)
- Cultural meanings (static content, curated)
- Complementary and analogous colors (uses Color Relationship Engine)
- 5 render mode previews for the group's midpoint color
- "Explore this color" → links to `/explore?group=C01`

---

## 🔐 Admin Panel
**Status:** 🟡 Needs auth setup first
**Scope:** Small-Medium (protected route + basic CRUD views)

A password-protected admin area at `/admin`.

### Pages:
- `/admin/analytics` — survey response dashboard (see above)
- `/admin/responses` — paginated table of all survey responses, filterable
- `/admin/export` — download survey data as CSV
- `/admin/colors` — future: manually tag color IDs with notes or corrections

**Auth approach:** Simple environment-variable password check (`ADMIN_PASSWORD`)
stored in `.env`. Not full OAuth — just a single shared password protecting the route.
Upgrade to proper auth when multi-admin is needed.

---

## 🌈 Color Relationship Page (`/relationships`)
**Status:** 🔴 Blocked — needs Color Relationship Engine first
**Scope:** Medium

An interactive page where you input any hex code or color ID and see all its
harmonic relationships displayed visually.

### UI layout:
- Center: your selected color (large swatch, full data)
- Surrounding ring: complementary, triadic, analogous, split-complement — all rendered
  as swatches with their IDs, arranged geometrically (like a mini color wheel)
- Toggle between relationship types with a tab selector
- Each related color swatch is clickable — loads that color as the new center

---

## 📱 Mobile Experience Upgrade
**Status:** 🟢 Ready to build
**Scope:** Small-Medium (CSS + layout adjustments)

The platform is responsive but was designed desktop-first. Mobile-specific upgrades:

- Bottom navigation bar on mobile (Home / Explore / Survey / Profile) replacing top nav
- Swipe left/right between survey steps (touch gesture)
- Larger tap targets on swatch grids (min 44×44px per Apple HIG)
- Full-screen swatch detail view on mobile (instead of modal)
- Pull-to-refresh on the explorer

---

## 🔴 Render Mode: Holographic
**Status:** 🟢 Ready to build
**Scope:** Small (CSS only — add to `globals.css` + `colors.ts`)

A 6th render mode: **Holographic** — simulates a foil/holographic surface where
the color shifts dramatically as if the viewing angle is changing. More extreme than
Pearlescent.

```css
@keyframes holographicCycle {
  0%   { filter: hue-rotate(0deg)   saturate(2.2) brightness(1.3); }
  20%  { filter: hue-rotate(60deg)  saturate(2.5) brightness(1.4); }
  40%  { filter: hue-rotate(120deg) saturate(2.0) brightness(1.2); }
  60%  { filter: hue-rotate(200deg) saturate(2.4) brightness(1.5); }
  80%  { filter: hue-rotate(300deg) saturate(2.2) brightness(1.3); }
  100% { filter: hue-rotate(360deg) saturate(2.2) brightness(1.3); }
}
```

Add to `RenderMode` type: `'holographic'`. Add toggle button. Done.

---

## 🧩 Embeddable Color Widget
**Status:** 🟡 Needs iframe/embed design
**Scope:** Medium

A small embeddable widget (`<iframe>`) that anyone can put on their website to show
a specific color ID — or a random color from a group — with its data.

```html
<iframe src="https://colorproject.com/widget/C09_SC072_V0500" />
```

Shows: color swatch, ID, hex code, group name, render mode toggle.
Configurable via URL params: `?mode=metallic&size=compact`.

---

## 📦 Color Data Export API
**Status:** 🟢 Ready to build
**Scope:** Small

Allow export of color data in multiple formats:

- `GET /api/export/group/C09?format=json` → all 144 sub-class reps for Blue as JSON
- `GET /api/export/group/C09?format=csv` → same as CSV
- `GET /api/export/subclass/C09_SC072?format=json` → all 1,000 variants
- Include: id, hex, rgb, hsl, group, subclass fields

Rate-limited. No auth needed for small exports. Large exports (full group) require
a token eventually.

---

## 🔁 Survey Versioning
**Status:** 🟡 Needs schema design first
**Scope:** Small

As the survey grows and questions change, old responses need to stay valid.

Add a `survey_version` field to `survey_responses` (currently implied as v1).
When questions are added or reordered, bump the version. Analytics can then
compare across versions or filter to a specific version's dataset.

---

*Upgrades are the growth layer — they expand what the platform can do.*
*When an upgrade is completed, move it to WHAT_I_BUILT.md and check it off in TODO.md.*
*Last updated: July 2026*
