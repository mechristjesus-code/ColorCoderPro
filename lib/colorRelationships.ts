// Color Relationship Engine — The 144,000 Color Project
// Computes harmonic color relationships from any color ID or hue value.
// All relationships are pure math — no lookups, no data files.

import { COLOR_GROUPS, ColorGroup, ColorVariant, getVariant, hslToHex, hslToRgb } from './colors';

export type RelationshipType =
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'split-complementary'
  | 'tetradic'
  | 'double-split';

export interface RelatedColor {
  relationshipType: RelationshipType;
  label: string;           // e.g. "Complementary", "Analogous Left"
  hue: number;             // target hue (0–360)
  hex: string;
  group: ColorGroup;
  variant: ColorVariant;
  angleDiff: number;       // degrees away from source hue
}

export interface ColorRelationships {
  source: { hue: number; hex: string; groupId: string };
  complementary: RelatedColor[];       // 1 color
  analogous: RelatedColor[];           // 2 colors (±30°)
  triadic: RelatedColor[];             // 2 colors (+120°, +240°)
  splitComplementary: RelatedColor[];  // 2 colors (+150°, +210°)
  tetradic: RelatedColor[];            // 3 colors (+90°, +180°, +270°)
  doubleSplit: RelatedColor[];         // 4 colors (±30°, ±150°)
}

// ── Core helpers ─────────────────────────────────────────────────────────────

/** Normalize any hue value into 0–359 range */
function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

/**
 * Find the closest ColorGroup to a given target hue.
 * The Neutral group (G13) is excluded from relationship lookups.
 */
function closestGroup(targetHue: number): ColorGroup {
  const groups = COLOR_GROUPS.filter(g => g.id !== 'G13');
  let best = groups[0];
  let bestDist = Infinity;
  for (const g of groups) {
    // Circular hue distance
    const raw = Math.abs(g.hueCenter - targetHue);
    const dist = Math.min(raw, 360 - raw);
    if (dist < bestDist) { bestDist = dist; best = g; }
  }
  return best;
}

/**
 * Build a RelatedColor from a target hue angle, using:
 * - The closest group to that hue
 * - Sub-class 72 (the middle sub-class) of that group
 * - Variant index driven by the source's own saturation/lightness character
 */
function buildRelated(
  relationshipType: RelationshipType,
  label: string,
  targetHue: number,
  angleDiff: number,
  sourceSat: number,
  sourceLit: number,
): RelatedColor {
  const h = normalizeHue(targetHue);
  const group = closestGroup(h);

  // Pick sub-class and variant that best represent the target hue
  // at a saturation/lightness matching the source's character
  const scIndex = Math.max(1, Math.min(144, Math.round(72 + (sourceSat - 50) * 0.7)));
  const vIndex  = Math.max(1, Math.min(1000, Math.round(500 + (sourceLit - 50) * 5)));

  const variant = getVariant(group, scIndex, vIndex);
  // Override the hex with the exact target hue for visual accuracy
  const hex = hslToHex(h, sourceSat, sourceLit);

  return { relationshipType, label, hue: h, hex, group, variant, angleDiff };
}

// ── Relationship calculators ──────────────────────────────────────────────────

function getComplementary(hue: number, s: number, l: number): RelatedColor[] {
  return [buildRelated('complementary', 'Complementary', hue + 180, 180, s, l)];
}

function getAnalogous(hue: number, s: number, l: number): RelatedColor[] {
  return [
    buildRelated('analogous', 'Analogous Left',  hue - 30, -30, s, l),
    buildRelated('analogous', 'Analogous Right', hue + 30,  30, s, l),
  ];
}

function getTriadic(hue: number, s: number, l: number): RelatedColor[] {
  return [
    buildRelated('triadic', 'Triadic 1', hue + 120, 120, s, l),
    buildRelated('triadic', 'Triadic 2', hue + 240, 240, s, l),
  ];
}

function getSplitComplementary(hue: number, s: number, l: number): RelatedColor[] {
  return [
    buildRelated('split-complementary', 'Split Complement A', hue + 150, 150, s, l),
    buildRelated('split-complementary', 'Split Complement B', hue + 210, 210, s, l),
  ];
}

function getTetradic(hue: number, s: number, l: number): RelatedColor[] {
  return [
    buildRelated('tetradic', 'Tetradic 2', hue + 90,  90,  s, l),
    buildRelated('tetradic', 'Tetradic 3', hue + 180, 180, s, l),
    buildRelated('tetradic', 'Tetradic 4', hue + 270, 270, s, l),
  ];
}

function getDoubleSplit(hue: number, s: number, l: number): RelatedColor[] {
  return [
    buildRelated('double-split', 'Double Split A', hue - 30,  -30, s, l),
    buildRelated('double-split', 'Double Split B', hue + 30,   30, s, l),
    buildRelated('double-split', 'Double Split C', hue + 150, 150, s, l),
    buildRelated('double-split', 'Double Split D', hue + 210, 210, s, l),
  ];
}

// ── Main API ──────────────────────────────────────────────────────────────────

/**
 * Compute all harmonic relationships for a given hue + saturation + lightness.
 * This is the primary function — use it from any UI component.
 */
export function computeRelationships(
  hue: number,
  sat: number,
  lit: number,
): ColorRelationships {
  const h = normalizeHue(hue);
  const sourceGroup = closestGroup(h);
  const hex = hslToHex(h, sat, lit);

  return {
    source: { hue: h, hex, groupId: sourceGroup.id },
    complementary:     getComplementary(h, sat, lit),
    analogous:         getAnalogous(h, sat, lit),
    triadic:           getTriadic(h, sat, lit),
    splitComplementary: getSplitComplementary(h, sat, lit),
    tetradic:          getTetradic(h, sat, lit),
    doubleSplit:       getDoubleSplit(h, sat, lit),
  };
}

/**
 * Convenience: compute relationships directly from a ColorVariant.
 */
export function computeRelationshipsFromVariant(variant: { h: number; s: number; l: number; groupId: string }): ColorRelationships {
  return computeRelationships(variant.h, variant.s, variant.l);
}

/**
 * Compute relationships from a hex string (#RRGGBB).
 */
export function computeRelationshipsFromHex(hex: string): ColorRelationships {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = normalizeHue(h * 60);
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return computeRelationships(h, s * 100, l * 100);
}

/**
 * Get just one relationship type by name.
 */
export function getRelationship(
  hue: number, sat: number, lit: number,
  type: RelationshipType,
): RelatedColor[] {
  const all = computeRelationships(hue, sat, lit);
  const map: Record<RelationshipType, RelatedColor[]> = {
    'complementary':      all.complementary,
    'analogous':          all.analogous,
    'triadic':            all.triadic,
    'split-complementary': all.splitComplementary,
    'tetradic':           all.tetradic,
    'double-split':       all.doubleSplit,
  };
  return map[type];
}

// Labels and descriptions for UI display
export const RELATIONSHIP_INFO: Record<RelationshipType, { label: string; desc: string; angle: string }> = {
  'complementary':       { label: 'Complementary',        desc: 'Directly opposite on the color wheel. Maximum contrast, vibrant tension.',          angle: '180°' },
  'analogous':           { label: 'Analogous',            desc: 'Neighbors on the wheel. Harmonious, natural, easy on the eye.',                     angle: '±30°' },
  'triadic':             { label: 'Triadic',              desc: 'Three equally spaced points. Vibrant and balanced.',                                 angle: '120°' },
  'split-complementary': { label: 'Split-Complementary',  desc: 'The two colors adjacent to the complement. Contrast with less tension.',             angle: '±150°' },
  'tetradic':            { label: 'Tetradic / Square',    desc: 'Four colors at 90° intervals. Rich and complex — works best when one dominates.',    angle: '90°' },
  'double-split':        { label: 'Double Split',         desc: 'Six-color harmony: analogous pair + their split complements. Full-spectrum richness.', angle: '±30° + ±150°' },
};
