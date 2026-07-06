import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "About & Vision — 144,000 Color Project",
  description: "The 13-phase roadmap for the 144,000 Color Project — from foundation to living color intelligence.",
};

const PHASES = [
  { n: 1,  title: "The Universal Foundation",     series: "What Is Color?",              status: "active",   desc: "Define the entire color universe. The 13 foundational groups, the master hierarchy, rules for organization, permanent numbering system, and core color philosophy." },
  { n: 2,  title: "Build the Master Color Library", series: "Building the Color Universe", status: "active",   desc: "Create every color with unique ID, visual swatch, RGB, HEX, HSL, Lab values, and position in the hierarchy." },
  { n: 3,  title: "Color Recipes",                series: "Creating Every Color",         status: "active",   desc: "Document how each color is created — intrinsic recipe, extrinsic render styles, metallic, gloss, transparent, and texture variations." },
  { n: 4,  title: "Color Relationships",          series: "How Colors Connect",           status: "active",   desc: "Teach the system how colors relate — parent families, child variants, complementary, analogous, triads, and split complements." },
  { n: 5,  title: "Build the AI Color Engine",    series: "Color Intelligence",           status: "building", desc: "Instead of searching manually, users can ask: Show me calm blues. Find colors close to this one. The AI becomes the guide to the color system." },
  { n: 6,  title: "Human Discovery",              series: "Learning From People",         status: "building", desc: "Users begin interacting with colors — answering questions about favorites, dislikes, memories, preferences, personality, and lifestyle." },
  { n: 7,  title: "Emotions",                     series: "The Emotional Language",       status: "future",   desc: "Colors become associated with emotions — joy, peace, confidence, curiosity, hope, energy, reflection. Learned from data, not assumptions." },
  { n: 8,  title: "Feelings",                     series: "How Color Feels",              status: "future",   desc: "Go deeper. Measure comfort, excitement, nostalgia, safety, creativity, focus, and relaxation to create a richer emotional profile." },
  { n: 9,  title: "Frequencies & Patterns",       series: "Hidden Connections",           status: "future",   desc: "Explore additional dimensions — frequency values, visual rhythms, harmonic groupings, mathematical connections, and AI pattern recognition." },
  { n: 10, title: "Personal Color Identity",      series: "Your Color Profile",           status: "future",   desc: "Users receive a personalized profile — primary colors, emotional tendencies, favorite palettes, recommended combinations, and areas to explore." },
  { n: 11, title: "AI Learning Network",          series: "Teaching AI Through Color",    status: "future",   desc: "As more people participate, the AI grows — recognizing global trends, regional differences, cultural influences, age-related preferences." },
  { n: 12, title: "Education & Creation",         series: "Using the Color System",       status: "future",   desc: "Turn knowledge into content — AI videos, lessons, articles, interactive charts, design tools, learning modules, visual demonstrations." },
  { n: 13, title: "Living Color Intelligence",    series: "The Vision",                   status: "future",   desc: "The project becomes an evolving platform where colors, numbers, emotions, frequencies, art, design, education all connect through a universal language." },
];

const STATUS_CONFIG = {
  active:   { label: "Live", color: "#4ADE80", bg: "rgba(74,222,128,0.12)" },
  building: { label: "Building", color: "#C9A84C", bg: "rgba(201,168,76,0.12)" },
  future:   { label: "Planned", color: "rgba(240,237,232,0.4)", bg: "rgba(255,255,255,0.05)" },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 border"
            style={{ borderColor: "rgba(201,168,76,0.3)", backgroundColor: "rgba(201,168,76,0.08)", color: "#C9A84C" }}>
            The Long-Term Vision
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            13 Phases to a<br />
            <span className="shimmer-text">Living Color Intelligence</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed" style={{ color: "rgba(240,237,232,0.6)" }}>
            The 144,000 Color Project is not just a color catalog — it's a universal knowledge system
            where color, numbers, emotions, and human experience connect through AI.
          </p>
        </div>

        {/* Vision summary */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {[
            { title: "The Foundation", desc: "144,000 colors per group × 13 groups = 1,872,000 unique identities with permanent IDs, HSL/RGB/HEX, and intrinsic recipes.", color: "#C9A84C" },
            { title: "The Language", desc: "A permanent numbering system so every color has a name, a number, and a position — a universal language for color communication.", color: "#7C9EE8" },
            { title: "The Intelligence", desc: "Human emotions and AI learning combine to give every color meaning that grows and evolves as millions of people contribute.", color: "#7AE88C" },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-2xl border"
              style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
              <div className="text-xs font-semibold mb-2 tracking-wide uppercase" style={{ color: item.color }}>
                {item.title}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(240,237,232,0.6)" }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Phase timeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: "var(--font-playfair)" }}>
            The Roadmap
          </h2>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px hidden md:block"
              style={{ background: "linear-gradient(to bottom, #C9A84C, rgba(201,168,76,0.1) 70%, transparent)" }} />

            <div className="space-y-4">
              {PHASES.map((phase) => {
                const status = STATUS_CONFIG[phase.status as keyof typeof STATUS_CONFIG];
                return (
                  <div key={phase.n}
                    className="relative flex gap-6 p-5 md:pl-16 rounded-2xl border transition-all duration-200 hover:border-white/15"
                    style={{ borderColor: "rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)" }}>

                    {/* Phase number bubble */}
                    <div className="absolute left-0 md:left-3 top-1/2 -translate-y-1/2 w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10"
                      style={{
                        background: phase.status === "active" ? "linear-gradient(135deg, #C9A84C, #E8C96A)" : "rgba(255,255,255,0.08)",
                        color: phase.status === "active" ? "#050508" : "rgba(240,237,232,0.5)",
                        border: phase.status === "future" ? "1px solid rgba(255,255,255,0.1)" : "none",
                      }}>
                      {phase.n}
                    </div>

                    <div className="flex-1 min-w-0 ml-8 md:ml-0">
                      <div className="flex flex-wrap items-start gap-3 mb-2">
                        <h3 className="font-semibold text-base">{phase.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: status.bg, color: status.color }}>
                          {status.label}
                        </span>
                      </div>
                      <div className="text-xs mb-2 font-medium tracking-wide" style={{ color: "rgba(240,237,232,0.35)" }}>
                        Series: {phase.series}
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(240,237,232,0.55)" }}>
                        {phase.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* System architecture */}
        <div className="mb-16 p-8 rounded-2xl border"
          style={{ borderColor: "rgba(201,168,76,0.2)", backgroundColor: "rgba(201,168,76,0.04)" }}>
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            The System Architecture
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3 text-sm" style={{ color: "#C9A84C" }}>Color Hierarchy</h3>
              <div className="space-y-2 text-sm">
                {[
                  ["13th Group", "Universal Neutral (Black–Brown–White)", "144,000"],
                  ["12 Main Groups", "RYB color wheel families", "1,728,000"],
                  ["Total Intrinsic", "All unique color identities", "1,872,000"],
                  ["× Render Modes", "Original, Metallic, Glossy, Pearlescent", "×4"],
                  ["Total Visual", "Unique visual representations", "7,488,000"],
                ].map(([key, desc, val]) => (
                  <div key={key} className="flex items-center justify-between gap-4 py-2 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div>
                      <div className="font-medium text-xs">{key}</div>
                      <div className="text-xs mt-0.5" style={{ color: "rgba(240,237,232,0.45)" }}>{desc}</div>
                    </div>
                    <div className="font-mono text-sm font-bold flex-shrink-0" style={{ color: "#C9A84C" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-sm" style={{ color: "#7C9EE8" }}>Sub-class Structure</h3>
              <div className="space-y-2 text-sm">
                {[
                  ["Per Group", "144 sub-classes", "144"],
                  ["Per Sub-class", "1,000 variants", "1,000"],
                  ["Variant ID Format", "C01_SC001_V0001"],
                  ["Intrinsic Recipe", "HSL + RGB + HEX + Lab"],
                  ["Extrinsic Styles", "PBR shaders + procedural noise"],
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between gap-4 py-2 border-b"
                    style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    <div className="font-medium text-xs">{row[0]}</div>
                    <div className="font-mono text-xs text-right" style={{ color: "rgba(240,237,232,0.6)" }}>{row[1]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-playfair)" }}>
            Become Part of the Project
          </h2>
          <p className="mb-8 max-w-lg mx-auto" style={{ color: "rgba(240,237,232,0.55)" }}>
            Every survey response helps build the emotional intelligence layer of this system.
            Your preferences shape the future of color understanding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/survey"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #C9A84C, #E8C96A)", color: "#050508" }}>
              Take the Survey
              <ArrowRight size={18} />
            </Link>
            <Link href="/explore"
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-base border transition-all duration-200 hover:bg-white/5"
              style={{ borderColor: "rgba(240,237,232,0.2)", color: "rgba(240,237,232,0.85)" }}>
              Explore Colors
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
