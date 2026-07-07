"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  computeRelationships,
  computeRelationshipsFromHex,
  RELATIONSHIP_INFO,
  RelationshipType,
  RelatedColor,
  ColorRelationships,
} from "@/lib/colorRelationships";
import { COLOR_GROUPS, hslToHex, getRenderClass, getRenderStyle, RenderMode } from "@/lib/colors";
import { Copy, Check, ArrowRight, RotateCcw } from "lucide-react";

// ── Types & constants ────────────────────────────────────────────────────────

const TABS: { id: RelationshipType; short: string }[] = [
  { id: "complementary",       short: "Complement" },
  { id: "analogous",           short: "Analogous" },
  { id: "triadic",             short: "Triadic" },
  { id: "split-complementary", short: "Split" },
  { id: "tetradic",            short: "Tetradic" },
  { id: "double-split",        short: "Double Split" },
];

const DEFAULT_HUE = 210;
const DEFAULT_SAT = 70;
const DEFAULT_LIT = 50;

// ── Sub-components ────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy}
      className="p-1 rounded transition-colors hover:bg-white/10"
      style={{ color: copied ? "#C9A84C" : "rgba(240,237,232,0.4)" }}>
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  );
}

function SwatchCard({
  hex, label, subLabel, renderMode, onClick, isSource = false
}: {
  hex: string; label: string; subLabel?: string;
  renderMode: RenderMode; onClick?: () => void; isSource?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-col gap-2 ${onClick ? "cursor-pointer group" : ""}`}
    >
      <div
        className={`w-full aspect-square rounded-xl relative overflow-hidden transition-transform duration-200 ${onClick ? "group-hover:scale-105" : ""} ${getRenderClass(renderMode)}`}
        style={{
          ...getRenderStyle(hex, renderMode),
          boxShadow: isSource
            ? `0 0 32px ${hex}88, 0 0 64px ${hex}33`
            : `0 0 16px ${hex}55`,
          outline: isSource ? `2px solid ${hex}` : "none",
          outlineOffset: "3px",
        }}
      />
      <div className="text-center">
        <div className="text-xs font-semibold truncate">{label}</div>
        {subLabel && (
          <div className="text-[10px] font-mono mt-0.5" style={{ color: "rgba(240,237,232,0.4)" }}>
            {subLabel}
          </div>
        )}
      </div>
    </div>
  );
}

function ColorWheel({ hue, relationships }: { hue: number; relationships: ColorRelationships }) {
  const SIZE = 220;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 82;
  const INNER = 28;

  // Generate the wheel gradient
  const stops = Array.from({ length: 36 }, (_, i) => {
    const h = i * 10;
    return `hsl(${h},80%,55%) ${h}deg`;
  }).join(", ");

  // Position a dot on the wheel circle given a hue
  const dotPos = (h: number, radius = R) => {
    const angle = (h - 90) * (Math.PI / 180);
    return {
      x: CX + radius * Math.cos(angle),
      y: CY + radius * Math.sin(angle),
    };
  };

  const activeTab = "complementary"; // show all dots
  const allRelated = [
    ...relationships.complementary,
    ...relationships.analogous,
    ...relationships.triadic,
  ];

  const sourceDot = dotPos(hue);
  const sourceHex = hslToHex(hue, 70, 50);

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="flex-shrink-0">
      {/* Color wheel ring */}
      <defs>
        <radialGradient id="wheelFade" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
        </radialGradient>
      </defs>
      <circle cx={CX} cy={CY} r={R + 18} fill={`conic-gradient(${stops})`} />
      <circle cx={CX} cy={CY} r={R + 18} fill="url(#wheelFade)" />
      <circle cx={CX} cy={CY} r={R - 18} fill="#050508" />

      {/* Lines from center to dots */}
      {allRelated.map((rel) => {
        const p = dotPos(rel.hue);
        return (
          <line key={`line-${rel.hue}`}
            x1={CX} y1={CY} x2={p.x} y2={p.y}
            stroke={rel.hex} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3,3" />
        );
      })}
      <line x1={CX} y1={CY} x2={sourceDot.x} y2={sourceDot.y}
        stroke={sourceHex} strokeWidth="1.5" strokeOpacity="0.6" />

      {/* Related color dots */}
      {allRelated.map((rel) => {
        const p = dotPos(rel.hue);
        return (
          <circle key={`dot-${rel.hue}`}
            cx={p.x} cy={p.y} r={7}
            fill={rel.hex}
            stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" />
        );
      })}

      {/* Source dot (on top) */}
      <circle cx={sourceDot.x} cy={sourceDot.y} r={10}
        fill={sourceHex}
        stroke="white" strokeWidth="2.5" />
      <circle cx={CX} cy={CY} r={4} fill={sourceHex} opacity={0.5} />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function RelationshipsClient() {
  const [hue, setHue]       = useState(DEFAULT_HUE);
  const [sat, setSat]       = useState(DEFAULT_SAT);
  const [lit, setLit]       = useState(DEFAULT_LIT);
  const [hexInput, setHexInput] = useState("");
  const [hexError, setHexError] = useState(false);
  const [activeTab, setActiveTab] = useState<RelationshipType>("complementary");
  const [renderMode, setRenderMode] = useState<RenderMode>("original");

  const sourceHex = useMemo(() => hslToHex(hue, sat, lit), [hue, sat, lit]);
  const sourceGroup = useMemo(() => {
    const groups = COLOR_GROUPS.filter(g => g.id !== "G13");
    let best = groups[0];
    let bestDist = Infinity;
    for (const g of groups) {
      const raw = Math.abs(g.hueCenter - hue);
      const dist = Math.min(raw, 360 - raw);
      if (dist < bestDist) { bestDist = dist; best = g; }
    }
    return best;
  }, [hue]);

  const relationships = useMemo(() => computeRelationships(hue, sat, lit), [hue, sat, lit]);
  const activeColors  = useMemo(() => {
    const map = {
      complementary: relationships.complementary,
      analogous: relationships.analogous,
      triadic: relationships.triadic,
      "split-complementary": relationships.splitComplementary,
      tetradic: relationships.tetradic,
      "double-split": relationships.doubleSplit,
    };
    return map[activeTab] ?? [];
  }, [relationships, activeTab]);

  const info = RELATIONSHIP_INFO[activeTab];

  const handleHexInput = (raw: string) => {
    setHexInput(raw);
    const val = raw.trim();
    const hex = val.startsWith("#") ? val : `#${val}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setHexError(false);
      const rel = computeRelationshipsFromHex(hex);
      // derive HSL from the source hex
      const r = parseInt(hex.slice(1,3), 16) / 255;
      const g = parseInt(hex.slice(3,5), 16) / 255;
      const b = parseInt(hex.slice(5,7), 16) / 255;
      const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max-min;
      let h = 0;
      if (d) {
        if (max === r) h = ((g-b)/d) % 6;
        else if (max === g) h = (b-r)/d + 2;
        else h = (r-g)/d + 4;
        h = ((h * 60) % 360 + 360) % 360;
      }
      const l = (max+min)/2;
      const s = d ? d / (1 - Math.abs(2*l - 1)) : 0;
      setHue(Math.round(h));
      setSat(Math.round(s * 100));
      setLit(Math.round(l * 100));
    } else if (val.length > 3) {
      setHexError(true);
    }
  };

  const handleReset = () => {
    setHue(DEFAULT_HUE); setSat(DEFAULT_SAT); setLit(DEFAULT_LIT);
    setHexInput(""); setHexError(false);
  };

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
            Color Relationship Engine
          </h1>
          <p className="text-sm" style={{ color: "rgba(240,237,232,0.5)" }}>
            Complementary · Analogous · Triadic · Split · Tetradic · Double Split
          </p>
        </div>

        {/* Top panel: source controls + wheel */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* Controls */}
          <div className="p-6 rounded-2xl border space-y-5"
            style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-xl flex-shrink-0 relative overflow-hidden ${getRenderClass(renderMode)}`}
                style={{ ...getRenderStyle(sourceHex, renderMode), boxShadow: `0 0 28px ${sourceHex}88` }} />
              <div>
                <div className="font-semibold">{sourceGroup.name}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="font-mono text-xs" style={{ color: "rgba(240,237,232,0.55)" }}>{sourceHex.toUpperCase()}</span>
                  <CopyButton text={sourceHex.toUpperCase()} />
                </div>
                <div className="text-xs mt-0.5" style={{ color: "rgba(240,237,232,0.35)" }}>
                  HSL({hue}°, {sat}%, {lit}%)
                </div>
              </div>
            </div>

            {/* Hex input */}
            <div>
              <label className="text-xs mb-1 block" style={{ color: "rgba(240,237,232,0.5)" }}>
                Paste a HEX code to start
              </label>
              <input
                type="text" value={hexInput} onChange={e => handleHexInput(e.target.value)}
                placeholder="#FF6B35 or FF6B35"
                className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none border"
                style={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  borderColor: hexError ? "#ff6b6b" : "rgba(255,255,255,0.1)",
                  color: "#F0EDE8",
                }}
              />
              {hexError && <p className="text-xs mt-1" style={{ color: "#ff6b6b" }}>Invalid hex — use format #RRGGBB</p>}
            </div>

            {/* HSL sliders */}
            <div className="space-y-3">
              {([
                { label: "Hue", value: hue, min: 0, max: 359, onChange: setHue, unit: "°",
                  track: `linear-gradient(to right, hsl(0,${sat}%,${lit}%), hsl(60,${sat}%,${lit}%), hsl(120,${sat}%,${lit}%), hsl(180,${sat}%,${lit}%), hsl(240,${sat}%,${lit}%), hsl(300,${sat}%,${lit}%), hsl(360,${sat}%,${lit}%))` },
                { label: "Saturation", value: sat, min: 0, max: 100, onChange: setSat, unit: "%",
                  track: `linear-gradient(to right, hsl(${hue},0%,${lit}%), hsl(${hue},100%,${lit}%))` },
                { label: "Lightness", value: lit, min: 5, max: 95, onChange: setLit, unit: "%",
                  track: `linear-gradient(to right, hsl(${hue},${sat}%,5%), hsl(${hue},${sat}%,50%), hsl(${hue},${sat}%,95%))` },
              ] as const).map(({ label, value, min, max, onChange, unit, track }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: "rgba(240,237,232,0.45)" }}>
                    <span>{label}</span><span>{value}{unit}</span>
                  </div>
                  <input type="range" min={min} max={max} value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ background: track }} />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-white/10"
                style={{ color: "rgba(240,237,232,0.5)" }}>
                <RotateCcw size={12} /> Reset
              </button>
              {/* Render mode mini-toggle */}
              <div className="flex items-center gap-1 ml-auto">
                {(["original","metallic","glossy","pearlescent"] as RenderMode[]).map(m => (
                  <button key={m} onClick={() => setRenderMode(m)}
                    className="px-2 py-1 rounded text-[10px] font-medium capitalize transition-all"
                    style={{
                      backgroundColor: renderMode === m ? "rgba(201,168,76,0.2)" : "rgba(255,255,255,0.05)",
                      color: renderMode === m ? "#C9A84C" : "rgba(240,237,232,0.45)",
                    }}>
                    {m === "pearlescent" ? "Pearl" : m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Color Wheel */}
          <div className="p-6 rounded-2xl border flex flex-col items-center justify-center gap-4"
            style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
            <ColorWheel hue={hue} relationships={relationships} />
            <p className="text-xs text-center" style={{ color: "rgba(240,237,232,0.35)" }}>
              White dot = your color · Colored dots = relationships
            </p>
          </div>
        </div>

        {/* Relationship tabs */}
        <div className="flex flex-wrap gap-1 mb-6">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const info = RELATIONSHIP_INFO[tab.id];
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  backgroundColor: isActive ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.05)",
                  color: isActive ? "#C9A84C" : "rgba(240,237,232,0.55)",
                  border: `1px solid ${isActive ? "rgba(201,168,76,0.35)" : "rgba(255,255,255,0.07)"}`,
                }}>
                <span>{tab.short}</span>
                <span className="opacity-50">{info.angle}</span>
              </button>
            );
          })}
        </div>

        {/* Relationship info bar */}
        <div className="p-4 rounded-xl mb-6 border"
          style={{ borderColor: "rgba(201,168,76,0.15)", backgroundColor: "rgba(201,168,76,0.06)" }}>
          <div className="flex items-start gap-3">
            <div className="text-sm font-semibold" style={{ color: "#C9A84C" }}>{info.label}</div>
            <div className="text-xs leading-relaxed mt-0.5" style={{ color: "rgba(240,237,232,0.6)" }}>{info.desc}</div>
          </div>
        </div>

        {/* Source + related swatches */}
        <div className="p-6 rounded-2xl border"
          style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
          <div className={`grid gap-6`}
            style={{ gridTemplateColumns: `repeat(${Math.min(6, 1 + activeColors.length)}, minmax(0, 1fr))` }}>

            {/* Source */}
            <div className="flex flex-col gap-2">
              <div className={`w-full aspect-square rounded-xl relative overflow-hidden ${getRenderClass(renderMode)}`}
                style={{
                  ...getRenderStyle(sourceHex, renderMode),
                  boxShadow: `0 0 24px ${sourceHex}77`,
                  outline: "2px solid rgba(255,255,255,0.25)",
                  outlineOffset: "3px",
                }} />
              <div className="text-center">
                <div className="text-xs font-semibold">Your Color</div>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="font-mono text-[10px]" style={{ color: "rgba(240,237,232,0.4)" }}>
                    {sourceHex.toUpperCase()}
                  </span>
                  <CopyButton text={sourceHex.toUpperCase()} />
                </div>
              </div>
            </div>

            {/* Related colors */}
            {activeColors.map((rel, i) => (
              <div key={`${rel.hue}-${i}`} className="flex flex-col gap-2">
                <div
                  className={`w-full aspect-square rounded-xl relative overflow-hidden cursor-pointer group transition-transform duration-150 hover:scale-105 ${getRenderClass(renderMode)}`}
                  style={{
                    ...getRenderStyle(rel.hex, renderMode),
                    boxShadow: `0 0 16px ${rel.hex}55`,
                  }}
                  onClick={() => { setHue(rel.hue); setSat(sat); setLit(lit); setHexInput(""); }}
                  title="Click to use this color as your source"
                />
                <div className="text-center">
                  <div className="text-xs font-semibold leading-tight">{rel.label}</div>
                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="font-mono text-[10px]" style={{ color: "rgba(240,237,232,0.4)" }}>
                      {rel.hex.toUpperCase()}
                    </span>
                    <CopyButton text={rel.hex.toUpperCase()} />
                  </div>
                  <div className="text-[9px] mt-0.5" style={{ color: "rgba(240,237,232,0.3)" }}>
                    {rel.group.name} · {rel.hue}°
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs mt-5" style={{ color: "rgba(240,237,232,0.3)" }}>
            Click any related color to make it your new source and explore its relationships.
          </p>
        </div>

        {/* Full harmony palette */}
        <div className="mt-6 p-5 rounded-2xl border"
          style={{ borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.02)" }}>
          <h3 className="text-sm font-semibold mb-4">Full Harmony Palette — All Relationships</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { hex: sourceHex, label: "Source" },
              ...relationships.complementary.map(r => ({ hex: r.hex, label: "Comp." })),
              ...relationships.analogous.map(r => ({ hex: r.hex, label: "Ana." })),
              ...relationships.triadic.map(r => ({ hex: r.hex, label: "Tri." })),
              ...relationships.splitComplementary.map(r => ({ hex: r.hex, label: "Split" })),
            ].map(({ hex, label }, i) => (
              <div key={`palette-${i}`} className="group flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-lg relative overflow-hidden cursor-pointer transition-transform hover:scale-110 ${getRenderClass(renderMode)}`}
                  style={{ ...getRenderStyle(hex, renderMode), boxShadow: `0 0 10px ${hex}44` }}
                  onClick={() => { const h = computeRelationshipsFromHex(hex).source.hue; setHue(h); setHexInput(""); }} />
                <span className="text-[8px]" style={{ color: "rgba(240,237,232,0.3)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Link to explorer */}
        <div className="mt-8 text-center">
          <Link href="/explore"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-white"
            style={{ color: "#C9A84C" }}>
            Explore this color in the full system
            <ArrowRight size={14} />
          </Link>
        </div>

      </div>
    </div>
  );
}
