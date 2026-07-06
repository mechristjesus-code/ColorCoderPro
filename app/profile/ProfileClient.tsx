"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hslToHex, COLOR_GROUPS, getRenderStyle, getVariant } from "@/lib/colors";
import { ArrowRight, RefreshCw } from "lucide-react";

interface ColorProfile {
  primaryColor: { name: string; hex: string; id: string };
  secondaryColor: { name: string; hex: string; id: string };
  accentColor: { name: string; hex: string; id: string };
  emotionalTone: string;
  keywords: string[];
  lightnessPref: "dark" | "mid" | "light";
  saturationPref: "muted" | "moderate" | "vivid";
  palette: string[];
  personalityNote: string;
}

function deriveProfile(answers: Record<string, unknown>): ColorProfile {
  const favGroup = COLOR_GROUPS.find((g) => g.id === answers.fav_color) ?? COLOR_GROUPS[9];
  const calmOpt = answers.calm_color as string ?? "cool_teal";
  const energyOpt = answers.energy_color as string ?? "bright_red";
  const brightnessVal = (answers.brightness_pref as number) ?? 5;
  const satVal = (answers.saturation_pref as number) ?? 5;

  const lightnessPref: "dark" | "mid" | "light" = brightnessVal <= 3 ? "dark" : brightnessVal >= 7 ? "light" : "mid";
  const saturationPref: "muted" | "moderate" | "vivid" = satVal <= 3 ? "muted" : satVal >= 7 ? "vivid" : "moderate";

  const lMap = { dark: 30, mid: 50, light: 70 };
  const sMap = { muted: 35, moderate: 60, vivid: 85 };
  const L = lMap[lightnessPref];
  const S = sMap[saturationPref];

  const primaryHex = hslToHex(favGroup.hueCenter, S, L);
  const secondaryHex = hslToHex((favGroup.hueCenter + 120) % 360, S - 10, L + 5);
  const accentHex = hslToHex((favGroup.hueCenter + 240) % 360, S - 5, L - 5);

  const primaryVariant = getVariant(favGroup, 72, 500);

  const emotionalTones: Record<string, string> = {
    C01: "Passionate & Bold", C02: "Warm & Dynamic", C03: "Creative & Energetic",
    C04: "Optimistic & Playful", C05: "Joyful & Bright", C06: "Fresh & Natural",
    C07: "Harmonious & Grounded", C08: "Calm & Fluid", C09: "Trustworthy & Deep",
    C10: "Intuitive & Mystical", C11: "Imaginative & Spiritual", C12: "Romantic & Sensitive",
    G13: "Balanced & Timeless",
  };

  const keywordsMap: Record<string, string[]> = {
    C01: ["Passion", "Strength", "Courage"], C02: ["Warmth", "Excitement", "Drive"],
    C03: ["Creativity", "Joy", "Enthusiasm"], C04: ["Optimism", "Playfulness", "Clarity"],
    C05: ["Happiness", "Intelligence", "Energy"], C06: ["Growth", "Freshness", "Vitality"],
    C07: ["Harmony", "Nature", "Balance"], C08: ["Serenity", "Depth", "Flow"],
    C09: ["Trust", "Loyalty", "Wisdom"], C10: ["Intuition", "Mystery", "Insight"],
    C11: ["Imagination", "Luxury", "Spirituality"], C12: ["Romance", "Sensitivity", "Grace"],
    G13: ["Timelessness", "Neutrality", "Foundation"],
  };

  const personalityNotes: Record<string, string> = {
    C01: "You are drawn to intensity and action. Red energy suggests you approach life with passion and a desire to lead. You feel most alive when things are moving.",
    C02: "Your warm, bridge color reveals someone who brings people together — energetic but approachable, creative but grounded.",
    C03: "Orange reveals a social, creative spirit. You thrive in dynamic environments and bring enthusiasm to everything you do.",
    C04: "Your palette reflects optimism and warmth. You help others see the bright side and approach challenges with a can-do attitude.",
    C05: "Yellow energy reveals a quick, curious mind. You value clarity and joy, and you have a gift for bringing lightness to heavy situations.",
    C06: "Fresh and forward-thinking, your color sense blends intellectual curiosity with a love of nature and growth.",
    C07: "Green reflects your grounded, harmonious nature. You seek balance, value relationships, and feel deeply connected to the natural world.",
    C08: "Teal suggests you are calm under pressure, deeply empathetic, and drawn to the space where creativity meets logic.",
    C09: "Blue reveals a thoughtful, trustworthy soul. You value depth over surface, loyalty over novelty, and wisdom over impulse.",
    C10: "Blue-violet reflects an intuitive, introspective nature. You perceive things others miss and are drawn to meaning beneath the surface.",
    C11: "Violet marks the imagination. You are visionary, spiritually curious, and often ahead of your time in thinking.",
    C12: "Red-violet reveals a romantic, deeply feeling soul — sensitive to beauty, attuned to emotion, and drawn to meaningful connection.",
    G13: "Your affinity for neutral tones reveals a timeless, grounded spirit. You value authenticity over trend, substance over flash.",
  };

  const palette = [
    primaryHex,
    secondaryHex,
    accentHex,
    hslToHex(favGroup.hueCenter, S * 0.6, L * 1.2),
    hslToHex((favGroup.hueCenter + 30) % 360, S * 0.8, L),
    hslToHex((favGroup.hueCenter + 180) % 360, S * 0.5, L * 0.8),
  ];

  return {
    primaryColor: { name: favGroup.name, hex: primaryHex, id: primaryVariant.id },
    secondaryColor: { name: COLOR_GROUPS.find((g) => g.hueCenter === (favGroup.hueCenter + 120) % 360)?.name ?? "Complementary", hex: secondaryHex, id: "" },
    accentColor: { name: "Triadic Accent", hex: accentHex, id: "" },
    emotionalTone: emotionalTones[favGroup.id] ?? "Balanced & Thoughtful",
    keywords: keywordsMap[favGroup.id] ?? ["Depth", "Harmony", "Balance"],
    lightnessPref,
    saturationPref,
    palette,
    personalityNote: personalityNotes[favGroup.id] ?? "Your unique color profile reflects a deeply individual approach to life and experience.",
  };
}

const DEFAULT_PROFILE: ColorProfile = {
  primaryColor: { name: "Blue", hex: hslToHex(210, 65, 50), id: "C09_SC072_V0500" },
  secondaryColor: { name: "Green Complement", hex: hslToHex(330, 55, 55), id: "" },
  accentColor: { name: "Triadic Accent", hex: hslToHex(90, 55, 48), id: "" },
  emotionalTone: "Trustworthy & Deep",
  keywords: ["Trust", "Loyalty", "Wisdom"],
  lightnessPref: "mid",
  saturationPref: "moderate",
  palette: [
    hslToHex(210, 65, 50), hslToHex(330, 55, 55), hslToHex(90, 55, 48),
    hslToHex(210, 39, 60), hslToHex(240, 52, 50), hslToHex(30, 32, 40),
  ],
  personalityNote: "Blue reveals a thoughtful, trustworthy soul. You value depth over surface, loyalty over novelty, and wisdom over impulse.",
};

export function ProfileClient() {
  const [profile, setProfile] = useState<ColorProfile | null>(null);
  const [hasSurvey, setHasSurvey] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("colorSurveyAnswers");
    if (raw) {
      try {
        const answers = JSON.parse(raw);
        setProfile(deriveProfile(answers));
        setHasSurvey(true);
      } catch {
        setProfile(DEFAULT_PROFILE);
      }
    } else {
      setProfile(DEFAULT_PROFILE);
    }
  }, []);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm" style={{ color: "rgba(240,237,232,0.4)" }}>Building your profile…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          {!hasSurvey && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs mb-6 border"
              style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.04)", color: "rgba(240,237,232,0.5)" }}>
              Demo profile — <Link href="/survey" className="underline" style={{ color: "#C9A84C" }}>take the survey</Link> for your real results
            </div>
          )}
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
            Your Color Profile
          </h1>
          <p className="text-sm" style={{ color: "rgba(240,237,232,0.5)" }}>
            Based on your emotional associations and color preferences
          </p>
        </div>

        {/* Primary color hero */}
        <div className="relative mb-8 rounded-3xl overflow-hidden p-8 border"
          style={{
            borderColor: `${profile.primaryColor.hex}33`,
            background: `linear-gradient(135deg, ${profile.primaryColor.hex}22 0%, rgba(5,5,8,0.9) 60%)`,
          }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl"
                style={{
                  backgroundColor: profile.primaryColor.hex,
                  boxShadow: `0 0 40px ${profile.primaryColor.hex}66, 0 0 80px ${profile.primaryColor.hex}22`,
                }} />
            </div>
            <div>
              <div className="text-xs font-mono mb-2" style={{ color: "rgba(240,237,232,0.45)" }}>
                Primary Color Identity
              </div>
              <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
                {profile.primaryColor.name}
              </h2>
              <div className="text-sm mb-3" style={{ color: "#C9A84C" }}>
                {profile.emotionalTone}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.keywords.map((kw) => (
                  <span key={kw} className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{ borderColor: `${profile.primaryColor.hex}44`, backgroundColor: `${profile.primaryColor.hex}18`, color: profile.primaryColor.hex }}>
                    {kw}
                  </span>
                ))}
              </div>
              <div className="font-mono text-xs" style={{ color: "rgba(240,237,232,0.35)" }}>
                {profile.primaryColor.hex.toUpperCase()} · {profile.primaryColor.id}
              </div>
            </div>
          </div>
        </div>

        {/* Personality note */}
        <div className="mb-8 p-6 rounded-2xl border"
          style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
          <h3 className="font-semibold mb-3">What Your Colors Reveal</h3>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(240,237,232,0.65)" }}>
            {profile.personalityNote}
          </p>
        </div>

        {/* Color palette */}
        <div className="mb-8">
          <h3 className="font-semibold mb-4">Your Personal Palette</h3>
          <div className="grid grid-cols-6 gap-2">
            {profile.palette.map((hex, i) => (
              <div key={i} className="group flex flex-col gap-2 items-center">
                <div
                  className="w-full aspect-square rounded-xl transition-transform duration-200 group-hover:scale-110"
                  style={{ backgroundColor: hex, boxShadow: `0 0 16px ${hex}44` }}
                />
                <span className="text-[9px] font-mono" style={{ color: "rgba(240,237,232,0.4)" }}>
                  {hex.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Color details grid */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Primary", color: profile.primaryColor },
            { label: "Secondary", color: profile.secondaryColor },
            { label: "Accent", color: profile.accentColor },
          ].map(({ label, color }) => (
            <div key={label} className="p-4 rounded-xl border"
              style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
              <div className="w-full h-20 rounded-lg mb-3"
                style={{ backgroundColor: color.hex, boxShadow: `0 0 20px ${color.hex}44` }} />
              <div className="text-xs mb-1" style={{ color: "rgba(240,237,232,0.45)" }}>{label}</div>
              <div className="font-semibold text-sm">{color.name}</div>
              <div className="font-mono text-xs mt-1" style={{ color: "rgba(240,237,232,0.35)" }}>
                {color.hex.toUpperCase()}
              </div>
            </div>
          ))}
        </div>

        {/* Preferences */}
        <div className="mb-10 p-6 rounded-2xl border"
          style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
          <h3 className="font-semibold mb-4">Your Color Preferences</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs mb-1" style={{ color: "rgba(240,237,232,0.45)" }}>Lightness Preference</div>
              <div className="font-medium capitalize">{profile.lightnessPref} tones</div>
            </div>
            <div>
              <div className="text-xs mb-1" style={{ color: "rgba(240,237,232,0.45)" }}>Saturation Preference</div>
              <div className="font-medium capitalize">{profile.saturationPref} hues</div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={`/explore?group=${COLOR_GROUPS.find((g) => g.name === profile.primaryColor.name)?.id ?? "C09"}`}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:brightness-110"
            style={{ background: "linear-gradient(135deg, #C9A84C, #E8C96A)", color: "#050508" }}>
            Explore Your Color Family
            <ArrowRight size={16} />
          </Link>
          <Link href="/survey"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 hover:bg-white/5"
            style={{ borderColor: "rgba(240,237,232,0.2)", color: "rgba(240,237,232,0.8)" }}>
            <RefreshCw size={16} />
            Retake Survey
          </Link>
        </div>
      </div>
    </div>
  );
}
