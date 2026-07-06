"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  COLOR_GROUPS, ColorGroup, RenderMode,
  getSubclassRepresentatives, getSampleVariants,
  getVariant, getRenderStyle, getRenderClass, hslToHex,
} from "@/lib/colors";
import { ChevronRight, Grid3X3, Rows3, Copy, Check, Search, X } from "lucide-react";

type ViewLevel = "groups" | "subclasses" | "variants";

function RenderModeToggle({ mode, onChange }: { mode: RenderMode; onChange: (m: RenderMode) => void }) {
  const modes: { id: RenderMode; label: string }[] = [
    { id: "original", label: "Original" },
    { id: "metallic", label: "Metallic" },
    { id: "glossy", label: "Glossy" },
    { id: "pearlescent", label: "Pearl" },
    { id: "matte", label: "Matte" },
  ];
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl border"
      style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)" }}>
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => onChange(m.id)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
          style={{
            backgroundColor: mode === m.id ? "rgba(201,168,76,0.2)" : "transparent",
            color: mode === m.id ? "#C9A84C" : "rgba(240,237,232,0.55)",
          }}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

function ColorSwatch({
  hex, id, label, size = "md", renderMode, onClick
}: {
  hex: string; id?: string; label?: string; size?: "sm" | "md" | "lg";
  renderMode: RenderMode; onClick?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const style = getRenderStyle(hex, renderMode);
  const sizes = { sm: "w-8 h-8", md: "w-12 h-12", lg: "w-16 h-16" };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group flex flex-col gap-1 items-center cursor-pointer" onClick={onClick}>
      <div
        className={`${sizes[size]} rounded-lg relative transition-transform duration-200 group-hover:scale-110`}
        style={{ ...style, boxShadow: `0 0 12px ${hex}44` }}
      >
        <button
          onClick={handleCopy}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
          style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
        >
          {copied ? <Check size={12} className="text-white" /> : <Copy size={12} className="text-white" />}
        </button>
      </div>
      {label && (
        <span className="text-[9px] text-center leading-tight max-w-[60px] truncate"
          style={{ color: "rgba(240,237,232,0.45)" }}>
          {label}
        </span>
      )}
    </div>
  );
}

function GroupsView({ renderMode, onSelectGroup, searchQuery }: {
  renderMode: RenderMode;
  onSelectGroup: (g: ColorGroup) => void;
  searchQuery: string;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return COLOR_GROUPS;
    const q = searchQuery.toLowerCase();
    return COLOR_GROUPS.filter(
      (g) => g.name.toLowerCase().includes(q) || g.id.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div>
      {searchQuery && (
        <p className="text-sm mb-4" style={{ color: "rgba(240,237,232,0.45)" }}>
          {filtered.length} group{filtered.length !== 1 ? "s" : ""} matching &ldquo;{searchQuery}&rdquo;
        </p>
      )}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((group) => {
        const reps = useMemo(() => {
          // Show 8 sample swatches per group
          const samples = [];
          for (let sc = 1; sc <= 144; sc += 18) {
            samples.push(getVariant(group, sc, 500));
          }
          return samples;
        }, [group.id]);

        return (
          <div
            key={group.id}
            onClick={() => onSelectGroup(group)}
            className="p-5 rounded-2xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-white/20"
            style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-medium" style={{ color: "#C9A84C" }}>{group.id}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(240,237,232,0.45)" }}>
                    {group.category}
                  </span>
                </div>
                <h3 className="font-semibold text-base">{group.name}</h3>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(240,237,232,0.45)" }}>
                  {group.description}
                </p>
              </div>
              <ChevronRight size={16} style={{ color: "rgba(240,237,232,0.3)" }} className="mt-1 flex-shrink-0" />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {reps.map((v) => (
                <div
                  key={v.id}
                  className={`w-7 h-7 rounded-md relative overflow-hidden ${getRenderClass(renderMode)}`}
                  style={getRenderStyle(v.hex, renderMode)}
                />
              ))}
            </div>

            <div className="mt-3 text-xs" style={{ color: "rgba(240,237,232,0.35)" }}>
              144 sub-classes · 144,000 variants
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}

function SubclassesView({ group, renderMode, onSelectSubclass, onBack }: {
  group: ColorGroup; renderMode: RenderMode;
  onSelectSubclass: (sc: number) => void; onBack: () => void;
}) {
  const reps = useMemo(() => getSubclassRepresentatives(group), [group.id]);

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button onClick={onBack} className="transition-colors hover:text-white" style={{ color: "#C9A84C" }}>
          All Groups
        </button>
        <ChevronRight size={14} style={{ color: "rgba(240,237,232,0.3)" }} />
        <span>{group.name}</span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
          {group.name}
        </h2>
        <p className="text-sm" style={{ color: "rgba(240,237,232,0.5)" }}>
          {group.description} · 144 sub-classes · 144,000 total variants
        </p>
      </div>

      <div className="grid grid-cols-8 sm:grid-cols-12 md:grid-cols-16 lg:grid-cols-18 gap-1.5">
        {reps.map((v, i) => {
          const scIndex = i + 1;
          return (
            <div
              key={v.id}
              className="group relative cursor-pointer"
              onClick={() => onSelectSubclass(scIndex)}
              title={`Sub-class ${scIndex.toString().padStart(3, '0')}\n${v.hex}`}
            >
              <div
                className={`w-full aspect-square rounded-md transition-transform duration-150 group-hover:scale-125 group-hover:z-10 relative overflow-hidden ${getRenderClass(renderMode)}`}
                style={{ ...getRenderStyle(v.hex, renderMode), boxShadow: `0 0 8px ${v.hex}33` }}
              />
            </div>
          );
        })}
      </div>

      <p className="text-xs mt-4" style={{ color: "rgba(240,237,232,0.35)" }}>
        Click any swatch to explore its 1,000 variants
      </p>
    </div>
  );
}

function VariantsView({ group, subclassIndex, renderMode, onBack }: {
  group: ColorGroup; subclassIndex: number; renderMode: RenderMode; onBack: () => void;
}) {
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [selectedVariant, setSelectedVariant] = useState<ReturnType<typeof getVariant> | null>(null);

  const variants = useMemo(() => getSampleVariants(group, subclassIndex, 100), [group.id, subclassIndex]);
  const scId = `${group.id}_SC${subclassIndex.toString().padStart(3, '0')}`;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <button onClick={() => onBack()} className="transition-colors hover:text-white" style={{ color: "#C9A84C" }}>
          All Groups
        </button>
        <ChevronRight size={14} style={{ color: "rgba(240,237,232,0.3)" }} />
        <button onClick={() => onBack()} style={{ color: "rgba(240,237,232,0.6)" }}
          className="hover:text-white transition-colors">
          {group.name}
        </button>
        <ChevronRight size={14} style={{ color: "rgba(240,237,232,0.3)" }} />
        <span>Sub-class {subclassIndex.toString().padStart(3, '0')}</span>
      </div>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
            {scId}
          </h2>
          <p className="text-sm" style={{ color: "rgba(240,237,232,0.5)" }}>
            Showing 100 of 1,000 variants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLayout("grid")}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: layout === "grid" ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)", color: layout === "grid" ? "#C9A84C" : "rgba(240,237,232,0.5)" }}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setLayout("list")}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: layout === "list" ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)", color: layout === "list" ? "#C9A84C" : "rgba(240,237,232,0.5)" }}>
            <Rows3 size={16} />
          </button>
        </div>
      </div>

      {layout === "grid" ? (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {variants.map((v) => (
            <div key={v.id} className="group cursor-pointer" onClick={() => setSelectedVariant(v)}>
              <div
                className={`w-full aspect-square rounded-lg transition-transform duration-150 group-hover:scale-110 relative overflow-hidden ${getRenderClass(renderMode)}`}
                style={{ ...getRenderStyle(v.hex, renderMode), boxShadow: `0 0 10px ${v.hex}44` }}
              />
              <div className="text-[8px] text-center mt-1 font-mono" style={{ color: "rgba(240,237,232,0.35)" }}>
                {v.hex}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {variants.map((v) => (
            <div key={v.id}
              className="flex items-center gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:border-white/20"
              style={{ borderColor: "rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.02)" }}
              onClick={() => setSelectedVariant(v)}>
              <div className={`w-10 h-10 rounded-lg flex-shrink-0 relative overflow-hidden ${getRenderClass(renderMode)}`}
                style={{ ...getRenderStyle(v.hex, renderMode), boxShadow: `0 0 10px ${v.hex}55` }} />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-xs" style={{ color: "#C9A84C" }}>{v.id}</div>
                <div className="font-mono text-xs mt-0.5" style={{ color: "rgba(240,237,232,0.5)" }}>
                  {v.hex.toUpperCase()} · HSL({Math.round(v.h)}°, {Math.round(v.s)}%, {Math.round(v.l)}%)
                </div>
              </div>
              <div className="text-xs" style={{ color: "rgba(240,237,232,0.35)" }}>
                RGB({v.rgb.r}, {v.rgb.g}, {v.rgb.b})
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Variant detail modal */}
      {selectedVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
          onClick={() => setSelectedVariant(null)}>
          <div className="rounded-2xl p-8 max-w-sm w-full border"
            style={{ backgroundColor: "#0D0D14", borderColor: "rgba(255,255,255,0.12)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className={`w-full h-40 rounded-xl mb-6 relative overflow-hidden ${getRenderClass(renderMode)}`}
              style={{ ...getRenderStyle(selectedVariant.hex, renderMode), boxShadow: `0 0 40px ${selectedVariant.hex}66` }} />
            <div className="font-mono text-sm mb-4" style={{ color: "#C9A84C" }}>{selectedVariant.id}</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["HEX", selectedVariant.hex.toUpperCase()],
                ["RGB", `${selectedVariant.rgb.r}, ${selectedVariant.rgb.g}, ${selectedVariant.rgb.b}`],
                ["Hue", `${Math.round(selectedVariant.h)}°`],
                ["Saturation", `${Math.round(selectedVariant.s)}%`],
                ["Lightness", `${Math.round(selectedVariant.l)}%`],
                ["Group", selectedVariant.groupId],
              ].map(([k, val]) => (
                <div key={k} className="p-3 rounded-lg" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                  <div className="text-xs mb-1" style={{ color: "rgba(240,237,232,0.45)" }}>{k}</div>
                  <div className="font-mono text-xs font-medium">{val}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setSelectedVariant(null)}
              className="mt-6 w-full py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(240,237,232,0.7)" }}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchBar({ query, onChange }: { query: string; onChange: (q: string) => void }) {
  return (
    <div className="relative flex-1 max-w-xs">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: "rgba(240,237,232,0.4)" }} />
      <input
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by name or hex…"
        className="w-full pl-9 pr-8 py-2 rounded-xl text-sm outline-none border"
        style={{
          backgroundColor: "rgba(255,255,255,0.05)",
          borderColor: "rgba(255,255,255,0.1)",
          color: "#F0EDE8",
        }}
      />
      {query && (
        <button onClick={() => onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2"
          style={{ color: "rgba(240,237,232,0.4)" }}>
          <X size={12} />
        </button>
      )}
    </div>
  );
}

function ExplorerInner() {
  const searchParams = useSearchParams();
  const initialGroup = searchParams.get("group");

  const [renderMode, setRenderMode] = useState<RenderMode>("original");
  const [viewLevel, setViewLevel] = useState<ViewLevel>(initialGroup ? "subclasses" : "groups");
  const [selectedGroup, setSelectedGroup] = useState<ColorGroup | null>(
    initialGroup ? (COLOR_GROUPS.find((g) => g.id === initialGroup) ?? null) : null
  );
  const [selectedSubclass, setSelectedSubclass] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectGroup = (g: ColorGroup) => {
    setSelectedGroup(g);
    setViewLevel("subclasses");
  };

  const handleSelectSubclass = (sc: number) => {
    setSelectedSubclass(sc);
    setViewLevel("variants");
  };

  const handleBack = () => {
    if (viewLevel === "variants") {
      setViewLevel("subclasses");
      setSelectedSubclass(null);
    } else {
      setViewLevel("groups");
      setSelectedGroup(null);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
              Color Explorer
            </h1>
            <p className="text-sm mt-1" style={{ color: "rgba(240,237,232,0.5)" }}>
              13 groups · 1,872 sub-classes · 1,872,000 variants
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {viewLevel === "groups" && (
              <SearchBar query={searchQuery} onChange={setSearchQuery} />
            )}
            <RenderModeToggle mode={renderMode} onChange={setRenderMode} />
          </div>
        </div>

        {viewLevel === "groups" && (
          <GroupsView renderMode={renderMode} onSelectGroup={handleSelectGroup} searchQuery={searchQuery} />
        )}
        {viewLevel === "subclasses" && selectedGroup && (
          <SubclassesView
            group={selectedGroup}
            renderMode={renderMode}
            onSelectSubclass={handleSelectSubclass}
            onBack={handleBack}
          />
        )}
        {viewLevel === "variants" && selectedGroup && selectedSubclass && (
          <VariantsView
            group={selectedGroup}
            subclassIndex={selectedSubclass}
            renderMode={renderMode}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
}

export function ExplorerClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: "rgba(240,237,232,0.4)" }}>Loading color universe…</div>
      </div>
    }>
      <ExplorerInner />
    </Suspense>
  );
}
