// 144,000 Color Project — Algorithmic Color Generator
// HSL-based procedural generation across 13 groups × 144 sub-classes × 1,000 variants

export interface ColorGroup {
  id: string;
  position: number;
  name: string;
  category: 'Primary' | 'Secondary' | 'Tertiary' | 'Neutral';
  hueCenter: number; // HSL hue degrees
  hueRange: number;  // ± range
  description: string;
  emoji: string;
}

export interface ColorSubclass {
  id: string;
  groupId: string;
  index: number; // 1-144
  name: string;
  saturationRange: [number, number];
  lightnessRange: [number, number];
}

export interface ColorVariant {
  id: string;
  subclassId: string;
  groupId: string;
  variantIndex: number; // 1-1000
  h: number;
  s: number;
  l: number;
  hex: string;
  rgb: { r: number; g: number; b: number };
}

export type RenderMode = 'original' | 'metallic' | 'glossy' | 'pearlescent' | 'matte';

// The 13 color groups
export const COLOR_GROUPS: ColorGroup[] = [
  { id: 'G13', position: 13, name: 'Universal Neutral', category: 'Neutral', hueCenter: 30, hueRange: 30, description: 'The absolute foundational source — Black to White with Brown as center', emoji: '⚫' },
  { id: 'C01', position: 1,  name: 'Red',          category: 'Primary',   hueCenter: 0,   hueRange: 15, description: 'Pure, vibrant reds — passion, energy, power', emoji: '🔴' },
  { id: 'C02', position: 2,  name: 'Red-Orange',   category: 'Tertiary',  hueCenter: 20,  hueRange: 10, description: 'Warm bridge between red and orange', emoji: '🟠' },
  { id: 'C03', position: 3,  name: 'Orange',        category: 'Secondary', hueCenter: 35,  hueRange: 12, description: 'Energetic, creative, warm orange tones', emoji: '🟧' },
  { id: 'C04', position: 4,  name: 'Yellow-Orange', category: 'Tertiary',  hueCenter: 50,  hueRange: 10, description: 'Sun-warmed bridge between orange and yellow', emoji: '🌅' },
  { id: 'C05', position: 5,  name: 'Yellow',        category: 'Primary',   hueCenter: 60,  hueRange: 12, description: 'Luminous yellows — joy, clarity, optimism', emoji: '🟡' },
  { id: 'C06', position: 6,  name: 'Yellow-Green',  category: 'Tertiary',  hueCenter: 80,  hueRange: 12, description: 'Fresh, natural bridge between yellow and green', emoji: '🌿' },
  { id: 'C07', position: 7,  name: 'Green',         category: 'Secondary', hueCenter: 120, hueRange: 20, description: 'Growth, harmony, nature — all greens', emoji: '🟢' },
  { id: 'C08', position: 8,  name: 'Blue-Green',    category: 'Tertiary',  hueCenter: 168, hueRange: 15, description: 'Teal and aqua — calm, depth, water', emoji: '🩵' },
  { id: 'C09', position: 9,  name: 'Blue',          category: 'Primary',   hueCenter: 210, hueRange: 20, description: 'Trust, depth, infinity — all blues', emoji: '🔵' },
  { id: 'C10', position: 10, name: 'Blue-Violet',   category: 'Tertiary',  hueCenter: 250, hueRange: 15, description: 'Deep bridge between blue and violet', emoji: '💙' },
  { id: 'C11', position: 11, name: 'Violet',        category: 'Secondary', hueCenter: 280, hueRange: 20, description: 'Mystery, spirituality, luxury — purples', emoji: '🟣' },
  { id: 'C12', position: 12, name: 'Red-Violet',    category: 'Tertiary',  hueCenter: 330, hueRange: 15, description: 'Romantic bridge between violet and red', emoji: '💜' },
];

// HSL to Hex conversion
export function hslToHex(h: number, s: number, l: number): string {
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sl = s / 100;
  const ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)));
  };
  return { r: f(0), g: f(8), b: f(4) };
}

// Generate a specific sub-class definition
export function getSubclass(group: ColorGroup, subclassIndex: number): ColorSubclass {
  const groupId = group.id;
  const scNum = subclassIndex.toString().padStart(3, '0');
  const id = `${groupId}_SC${scNum}`;

  // Divide 144 sub-classes into 12 bands of 12 each
  // Each band covers a different saturation/lightness zone
  const band = Math.floor((subclassIndex - 1) / 12); // 0-11
  const posInBand = ((subclassIndex - 1) % 12); // 0-11

  // Bands: dark-desaturated → dark-saturated → mid-desaturated → mid-saturated → light-desaturated → light-saturated (×2)
  const sMin = 10 + band * 8;
  const sMax = Math.min(100, sMin + 50 + posInBand * 3);
  const lMin = 5 + band * 6;
  const lMax = Math.min(95, lMin + 40 + posInBand * 4);

  return {
    id,
    groupId,
    index: subclassIndex,
    name: `Sub-class ${scNum}`,
    saturationRange: [sMin, sMax],
    lightnessRange: [lMin, lMax],
  };
}

// Generate a specific color variant (deterministic, fast)
export function getVariant(group: ColorGroup, subclassIndex: number, variantIndex: number): ColorVariant {
  const sc = getSubclass(group, subclassIndex);
  const scNum = subclassIndex.toString().padStart(3, '0');
  const vNum = variantIndex.toString().padStart(4, '0');
  const id = `${group.id}_SC${scNum}_V${vNum}`;

  // Deterministic HSL from indices
  const t = (variantIndex - 1) / 999; // 0..1

  // Hue: small variation around group center
  const hueVariation = (group.hueRange * 2) * t - group.hueRange;
  const h = ((group.hueCenter + hueVariation) % 360 + 360) % 360;

  // For neutral group: all grays/browns
  let s: number, l: number;
  if (group.id === 'G13') {
    // Neutral group: sweep from black (l=5,s=0) through brown (l=30,s=35) to white (l=95,s=0)
    const scT = (subclassIndex - 1) / 143;
    if (scT < 0.3) {
      s = scT * 15;
      l = 5 + scT * 30;
    } else if (scT < 0.6) {
      const mid = (scT - 0.3) / 0.3;
      s = 15 + mid * 20;
      l = 14 + mid * 35;
    } else {
      const end = (scT - 0.6) / 0.4;
      s = 35 - end * 35;
      l = 49 + end * 46;
    }
    s += (t - 0.5) * 10;
    l += (t - 0.5) * 8;
  } else {
    const [sMin, sMax] = sc.saturationRange;
    const [lMin, lMax] = sc.lightnessRange;
    s = sMin + t * (sMax - sMin);
    l = lMin + t * (lMax - lMin);
  }

  s = Math.max(0, Math.min(100, s));
  l = Math.max(3, Math.min(97, l));

  const hex = hslToHex(h, s, l);
  const rgb = hslToRgb(h, s, l);

  return { id, subclassId: sc.id, groupId: group.id, variantIndex, h, s, l, hex, rgb };
}

// Get a sample of variants for a sub-class (for display purposes)
export function getSampleVariants(group: ColorGroup, subclassIndex: number, count = 20): ColorVariant[] {
  const variants: ColorVariant[] = [];
  const step = Math.floor(1000 / count);
  for (let i = 0; i < count; i++) {
    variants.push(getVariant(group, subclassIndex, i * step + 1));
  }
  return variants;
}

// Get one representative variant per sub-class
export function getSubclassRepresentatives(group: ColorGroup): ColorVariant[] {
  const variants: ColorVariant[] = [];
  for (let sc = 1; sc <= 144; sc++) {
    variants.push(getVariant(group, sc, 500)); // midpoint variant
  }
  return variants;
}

// Get render mode CSS class name (for animated CSS modes)
export function getRenderClass(mode: RenderMode): string {
  switch (mode) {
    case 'metallic':    return 'render-metallic';
    case 'glossy':      return 'render-glossy';
    case 'pearlescent': return 'render-pearlescent';
    case 'matte':       return 'render-matte';
    default:            return '';
  }
}

// Get render mode CSS style (backgroundColor only — animation handled by CSS class)
export function getRenderStyle(hex: string, mode: RenderMode): React.CSSProperties {
  return { backgroundColor: hex };
}

// Stats
export const PROJECT_STATS = {
  groups: 13,
  mainGroups: 12,
  subclassesPerGroup: 144,
  variantsPerSubclass: 1000,
  variantsPerGroup: 144000,
  totalIntrinsicVariants: 1872000,
  renderModes: 4,
  totalVisualRepresentations: 7488000,
};
