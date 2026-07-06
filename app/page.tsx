import Link from "next/link";
import { ArrowRight, Layers, Sparkles, Users, Zap } from "lucide-react";
import { COLOR_GROUPS, hslToHex } from "@/lib/colors";

// Generate a decorative color ring for the hero
function generateRingColors() {
  const colors: string[] = [];
  for (let i = 0; i < 72; i++) {
    const hue = (i / 72) * 360;
    const sat = 70 + Math.sin(i * 0.3) * 20;
    const light = 45 + Math.cos(i * 0.2) * 15;
    colors.push(hslToHex(hue, sat, light));
  }
  return colors;
}

const ringColors = generateRingColors();

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-24 overflow-hidden">
        {/* Radial glow bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)" }} />
        </div>

        {/* Outer color ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full opacity-40 pointer-events-none hidden md:block"
          style={{
            background: `conic-gradient(${ringColors.map((c, i) => `${c} ${(i / ringColors.length) * 360}deg`).join(', ')})`,
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 12px), black calc(100% - 12px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 12px), black calc(100% - 12px))",
          }}
        />

        {/* Inner color ring */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-25 pointer-events-none hidden md:block"
          style={{
            background: `conic-gradient(${ringColors.map((c, i) => `${c} ${(i / ringColors.length) * 360}deg`).join(', ')})`,
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), black calc(100% - 6px))",
          }}
        />

        {/* Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8 border"
            style={{ borderColor: "rgba(201,168,76,0.3)", backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C" }}>
            <Sparkles size={12} />
            1,872,000 Colors · 7,488,000 Visual Representations
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            style={{ fontFamily: "var(--font-playfair)" }}>
            <span className="shimmer-text">The 144,000</span>
            <br />
            <span className="text-white">Color Project</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: "rgba(240,237,232,0.65)" }}>
            A universal color intelligence platform. Every color receives a permanent identity,
            a precise definition, and — through millions of human interactions — an emotional meaning.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/explore"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:brightness-110 hover:scale-105"
              style={{ background: "linear-gradient(135deg, #C9A84C, #E8C96A)", color: "#050508" }}
            >
              Explore the Universe
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/survey"
              className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base border transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: "rgba(240,237,232,0.2)", color: "rgba(240,237,232,0.85)" }}
            >
              Discover Your Colors
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/8 py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "13", label: "Color Groups" },
            { value: "1,872,000", label: "Intrinsic Variants" },
            { value: "7,488,000", label: "Visual Representations" },
            { value: "13", label: "Project Phases" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl md:text-4xl font-bold mb-1 shimmer-text"
                style={{ fontFamily: "var(--font-playfair)" }}>
                {stat.value}
              </div>
              <div className="text-sm" style={{ color: "rgba(240,237,232,0.5)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Color Groups Preview */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              The 13 Color Groups
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: "rgba(240,237,232,0.55)" }}>
              From the foundational Universal Neutral Scale to the 12 RYB color families.
              Each group contains 144,000 precisely defined variants.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {COLOR_GROUPS.map((group) => {
              const swatchHex = hslToHex(
                group.hueCenter,
                group.id === 'G13' ? 20 : 65,
                group.id === 'G13' ? 45 : 50
              );
              return (
                <Link
                  key={group.id}
                  href={`/explore?group=${group.id}`}
                  className="group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    borderColor: "rgba(255,255,255,0.08)",
                    backgroundColor: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                    style={{
                      backgroundColor: swatchHex,
                      boxShadow: `0 0 16px ${swatchHex}55`,
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono" style={{ color: "#C9A84C" }}>{group.id}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(240,237,232,0.5)" }}>
                        {group.category}
                      </span>
                    </div>
                    <div className="font-semibold text-sm mt-0.5 truncate">{group.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: "rgba(240,237,232,0.45)" }}>144,000 variants</div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link href="/explore"
              className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-white"
              style={{ color: "#C9A84C" }}>
              Explore all color groups
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-white/8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
              How the System Works
            </h2>
            <p className="max-w-xl mx-auto" style={{ color: "rgba(240,237,232,0.55)" }}>
              A three-layer architecture that separates color identity from visual presentation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Layers size={24} />,
                title: "Intrinsic Recipes",
                desc: "Every color variant has a permanent ID and precise HSL/RGB/HEX values — its unchanging DNA. 1,872,000 unique identities.",
                color: "#C9A84C",
              },
              {
                icon: <Zap size={24} />,
                title: "Extrinsic Render Styles",
                desc: "Four global render modes — Original, Metallic, Glossy, and Pearlescent — multiply visual representations to 7,488,000.",
                color: "#7C9EE8",
              },
              {
                icon: <Users size={24} />,
                title: "Human Intelligence",
                desc: "Through surveys and interactions, real people assign emotional meaning. The AI learns patterns, not assumptions.",
                color: "#7AE88C",
              },
            ].map((item) => (
              <div key={item.title}
                className="p-6 rounded-2xl border"
                style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${item.color}18`, color: item.color }}>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(240,237,232,0.55)" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Render modes showcase */}
      <section className="py-24 px-6 border-t border-white/8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Five Render Modes
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: "rgba(240,237,232,0.55)" }}>
            Each of the 1,872,000 colors can be presented in five distinct animated visual states.
          </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { label: "Original", desc: "Pure intrinsic color", cls: "" },
              { label: "Metallic", desc: "Animated shimmer sweep", cls: "render-metallic" },
              { label: "Glossy", desc: "High-shine pulsing depth", cls: "render-glossy" },
              { label: "Pearlescent", desc: "Iridescent hue-cycle", cls: "render-pearlescent" },
              { label: "Matte", desc: "Soft flat micro-texture", cls: "render-matte" },
            ].map((mode) => (
              <div key={mode.label} className="flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-1">
                  {[210, 120, 330].map((hue) => {
                    const hex = hslToHex(hue, 70, 50);
                    return (
                      <div
                        key={hue}
                        className={`aspect-square rounded-md relative overflow-hidden ${mode.cls}`}
                        style={{ backgroundColor: hex }}
                      />
                    );
                  })}
                </div>
                <div>
                  <div className="font-semibold text-sm">{mode.label}</div>
                  <div className="text-xs" style={{ color: "rgba(240,237,232,0.45)" }}>{mode.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 border-t border-white/8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            Discover Your Color Identity
          </h2>
          <p className="text-lg mb-10" style={{ color: "rgba(240,237,232,0.55)" }}>
            Take the discovery survey and receive your personal color profile — your emotional palette,
            your primary colors, and what they reveal about you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/survey"
              className="px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #C9A84C, #E8C96A)", color: "#050508" }}>
              Take the Survey
            </Link>
            <Link href="/about"
              className="px-8 py-4 rounded-xl font-semibold text-base border transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: "rgba(240,237,232,0.2)", color: "rgba(240,237,232,0.85)" }}>
              View All 13 Phases
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
