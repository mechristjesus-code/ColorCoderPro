"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { hslToHex, COLOR_GROUPS } from "@/lib/colors";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";

interface SurveyQuestion {
  id: string;
  phase: number;
  text: string;
  type: "color-pick" | "scale" | "multi-pick";
  options?: { label: string; value: string; hex?: string }[];
  scaleLabels?: [string, string];
}

// ── Questions (24 total across 6 phases) ──────────────────────────────────────

const Q: SurveyQuestion[] = [
  // ── STEP 1: Phase 6 — Color Preferences ──────────────────────────────────
  {
    id: "fav_color", phase: 6,
    text: "Which color family feels most like you?",
    type: "color-pick",
    options: COLOR_GROUPS.filter(g => g.id !== "G13").map(g => ({
      label: g.name, value: g.id, hex: hslToHex(g.hueCenter, 65, 50),
    })),
  },
  {
    id: "least_fav", phase: 6,
    text: "Which color do you tend to avoid or dislike most?",
    type: "color-pick",
    options: COLOR_GROUPS.filter(g => g.id !== "G13").map(g => ({
      label: g.name, value: g.id, hex: hslToHex(g.hueCenter, 65, 50),
    })),
  },
  {
    id: "wear_color", phase: 6,
    text: "Which color would you wear most confidently?",
    type: "color-pick",
    options: [
      { label: "Black", value: "black", hex: hslToHex(0, 0, 10) },
      { label: "White/Cream", value: "white", hex: hslToHex(40, 25, 93) },
      { label: "Navy", value: "navy", hex: hslToHex(220, 65, 22) },
      { label: "Deep Red", value: "deep_red", hex: hslToHex(5, 80, 38) },
      { label: "Forest Green", value: "forest", hex: hslToHex(130, 45, 30) },
      { label: "Warm Brown", value: "brown", hex: hslToHex(22, 50, 35) },
      { label: "Cobalt Blue", value: "cobalt", hex: hslToHex(220, 80, 50) },
      { label: "Burgundy", value: "burgundy", hex: hslToHex(340, 55, 32) },
      { label: "Teal", value: "teal", hex: hslToHex(175, 65, 38) },
    ],
  },

  // ── STEP 2: Phase 7 — Emotions ────────────────────────────────────────────
  {
    id: "calm_color", phase: 7,
    text: "Which color makes you feel most calm and peaceful?",
    type: "color-pick",
    options: [
      { label: "Deep Blue", value: "deep_blue", hex: hslToHex(215, 70, 35) },
      { label: "Soft Green", value: "soft_green", hex: hslToHex(140, 45, 55) },
      { label: "Muted Violet", value: "muted_violet", hex: hslToHex(275, 35, 55) },
      { label: "Warm Beige", value: "warm_beige", hex: hslToHex(35, 30, 75) },
      { label: "Cool Teal", value: "cool_teal", hex: hslToHex(175, 55, 45) },
      { label: "Pale Lavender", value: "pale_lavender", hex: hslToHex(260, 40, 78) },
    ],
  },
  {
    id: "energy_color", phase: 7,
    text: "Which color gives you the most energy and motivation?",
    type: "color-pick",
    options: [
      { label: "Bright Red", value: "bright_red", hex: hslToHex(5, 90, 50) },
      { label: "Vivid Orange", value: "vivid_orange", hex: hslToHex(30, 95, 55) },
      { label: "Electric Yellow", value: "electric_yellow", hex: hslToHex(55, 100, 55) },
      { label: "Hot Pink", value: "hot_pink", hex: hslToHex(330, 90, 55) },
      { label: "Neon Green", value: "neon_green", hex: hslToHex(100, 85, 45) },
      { label: "Bold Teal", value: "bold_teal", hex: hslToHex(175, 80, 40) },
    ],
  },
  {
    id: "joy_color", phase: 7,
    text: "Which color do you most associate with pure joy and happiness?",
    type: "color-pick",
    options: [
      { label: "Sunshine Yellow", value: "sunshine", hex: hslToHex(50, 98, 60) },
      { label: "Coral Orange", value: "coral_orange", hex: hslToHex(18, 88, 62) },
      { label: "Sky Blue", value: "sky_blue", hex: hslToHex(200, 75, 68) },
      { label: "Mint Green", value: "mint", hex: hslToHex(155, 55, 68) },
      { label: "Hot Pink", value: "hot_pink_joy", hex: hslToHex(325, 85, 65) },
      { label: "Lavender", value: "lavender_joy", hex: hslToHex(265, 50, 72) },
    ],
  },
  {
    id: "fear_color", phase: 7,
    text: "Which color do you associate with fear or unease?",
    type: "color-pick",
    options: [
      { label: "Sickly Yellow", value: "sickly_yellow", hex: hslToHex(72, 60, 45) },
      { label: "Dark Red", value: "dark_red_fear", hex: hslToHex(2, 70, 28) },
      { label: "Murky Green", value: "murky_green", hex: hslToHex(95, 30, 30) },
      { label: "Ash Gray", value: "ash_gray", hex: hslToHex(220, 5, 45) },
      { label: "Putrid Brown", value: "putrid_brown", hex: hslToHex(40, 25, 28) },
      { label: "Void Black", value: "void_black", hex: hslToHex(240, 10, 8) },
    ],
  },

  // ── STEP 3: Phase 8 — Feelings ────────────────────────────────────────────
  {
    id: "safety_color", phase: 8,
    text: "Which colors make you feel most safe and grounded? (pick all that apply)",
    type: "multi-pick",
    options: [
      { label: "Earthy Brown", value: "earthy_brown", hex: hslToHex(25, 45, 35) },
      { label: "Forest Green", value: "forest_green", hex: hslToHex(120, 40, 30) },
      { label: "Navy Blue", value: "navy_blue", hex: hslToHex(215, 65, 25) },
      { label: "Warm Gray", value: "warm_gray", hex: hslToHex(30, 8, 55) },
      { label: "Cream White", value: "cream_white", hex: hslToHex(40, 35, 90) },
      { label: "Terracotta", value: "terracotta", hex: hslToHex(15, 60, 48) },
    ],
  },
  {
    id: "creativity_color", phase: 8,
    text: "Which color do you associate with creativity and imagination?",
    type: "color-pick",
    options: [
      { label: "Deep Violet", value: "deep_violet", hex: hslToHex(270, 75, 40) },
      { label: "Magenta", value: "magenta", hex: hslToHex(315, 85, 55) },
      { label: "Cerulean", value: "cerulean", hex: hslToHex(200, 80, 55) },
      { label: "Lime Green", value: "lime_green", hex: hslToHex(85, 80, 50) },
      { label: "Golden Yellow", value: "golden_yellow", hex: hslToHex(48, 95, 55) },
      { label: "Coral", value: "coral", hex: hslToHex(15, 80, 62) },
    ],
  },
  {
    id: "stress_relief", phase: 8,
    text: "When stressed, which color environment helps you recover?",
    type: "color-pick",
    options: [
      { label: "Ocean Blue", value: "ocean_blue", hex: hslToHex(200, 65, 48) },
      { label: "Nature Green", value: "nature_green", hex: hslToHex(120, 42, 42) },
      { label: "Warm Amber", value: "warm_amber", hex: hslToHex(38, 85, 55) },
      { label: "Soft Peach", value: "soft_peach", hex: hslToHex(20, 70, 80) },
      { label: "Stone Gray", value: "stone_gray", hex: hslToHex(210, 10, 58) },
      { label: "Deep Indigo", value: "deep_indigo", hex: hslToHex(245, 55, 35) },
    ],
  },
  {
    id: "comfort_color", phase: 8,
    text: "Which color feels most like home and comfort to you?",
    type: "color-pick",
    options: [
      { label: "Warm Caramel", value: "caramel", hex: hslToHex(32, 65, 52) },
      { label: "Dusty Rose", value: "dusty_rose", hex: hslToHex(350, 38, 70) },
      { label: "Sage Green", value: "sage", hex: hslToHex(130, 25, 60) },
      { label: "Ivory", value: "ivory", hex: hslToHex(45, 45, 92) },
      { label: "Slate Blue", value: "slate_blue", hex: hslToHex(215, 30, 55) },
      { label: "Rust Orange", value: "rust", hex: hslToHex(18, 70, 45) },
    ],
  },

  // ── STEP 4: Phase 9 — Memory & Scales ────────────────────────────────────
  {
    id: "childhood_color", phase: 6,
    text: "Which color most reminds you of a happy memory or childhood?",
    type: "color-pick",
    options: [
      { label: "Sky Blue", value: "sky_blue", hex: hslToHex(205, 75, 70) },
      { label: "Grass Green", value: "grass_green", hex: hslToHex(110, 60, 50) },
      { label: "Sunshine Yellow", value: "sunshine_yellow", hex: hslToHex(50, 95, 65) },
      { label: "Rosy Pink", value: "rosy_pink", hex: hslToHex(345, 65, 75) },
      { label: "Warm Orange", value: "warm_orange", hex: hslToHex(28, 90, 60) },
      { label: "Cloud White", value: "cloud_white", hex: hslToHex(210, 20, 92) },
    ],
  },
  {
    id: "success_color", phase: 10,
    text: "Which colors do you most associate with success and confidence? (pick all that apply)",
    type: "multi-pick",
    options: [
      { label: "Rich Gold", value: "rich_gold", hex: hslToHex(45, 90, 50) },
      { label: "Deep Navy", value: "deep_navy", hex: hslToHex(218, 70, 22) },
      { label: "Emerald", value: "emerald", hex: hslToHex(150, 70, 35) },
      { label: "Jet Black", value: "jet_black", hex: hslToHex(0, 0, 8) },
      { label: "Crimson", value: "crimson", hex: hslToHex(3, 85, 40) },
      { label: "Silver", value: "silver", hex: hslToHex(210, 10, 72) },
    ],
  },
  {
    id: "brightness_pref", phase: 8,
    text: "Do you prefer colors that are dark and deep, or light and airy?",
    type: "scale",
    scaleLabels: ["Dark & Deep", "Light & Airy"],
  },
  {
    id: "saturation_pref", phase: 9,
    text: "Do you prefer muted, earthy tones or vivid, saturated hues?",
    type: "scale",
    scaleLabels: ["Muted & Earthy", "Vivid & Saturated"],
  },

  // ── STEP 5: Phase 10 — Personal Environment ───────────────────────────────
  {
    id: "home_color", phase: 10,
    text: "If you could paint every room in your ideal home, what would the dominant color be?",
    type: "color-pick",
    options: [
      { label: "Warm White", value: "warm_white_home", hex: hslToHex(40, 18, 92) },
      { label: "Sage Green", value: "sage_home", hex: hslToHex(132, 22, 58) },
      { label: "Dusty Blue", value: "dusty_blue_home", hex: hslToHex(210, 28, 62) },
      { label: "Terracotta", value: "terracotta_home", hex: hslToHex(14, 58, 50) },
      { label: "Charcoal", value: "charcoal_home", hex: hslToHex(215, 12, 22) },
      { label: "Blush Pink", value: "blush_home", hex: hslToHex(350, 40, 82) },
      { label: "Ochre Gold", value: "ochre_home", hex: hslToHex(42, 72, 55) },
      { label: "Midnight Navy", value: "navy_home", hex: hslToHex(222, 58, 18) },
    ],
  },
  {
    id: "workspace_color", phase: 10,
    text: "What color palette would make you most productive at work?",
    type: "multi-pick",
    options: [
      { label: "Clean White", value: "clean_white_ws", hex: hslToHex(210, 15, 96) },
      { label: "Focused Blue", value: "focused_blue_ws", hex: hslToHex(215, 70, 45) },
      { label: "Energizing Orange", value: "energizing_ws", hex: hslToHex(28, 88, 58) },
      { label: "Calming Green", value: "calming_ws", hex: hslToHex(145, 38, 48) },
      { label: "Bold Contrast", value: "bold_ws", hex: hslToHex(0, 0, 10) },
      { label: "Warm Neutral", value: "warm_neutral_ws", hex: hslToHex(35, 22, 68) },
    ],
  },
  {
    id: "nature_palette", phase: 9,
    text: "Which natural environment's color palette do you feel most drawn to?",
    type: "color-pick",
    options: [
      { label: "Ocean & Beach", value: "ocean", hex: hslToHex(195, 72, 52) },
      { label: "Deep Forest", value: "forest_nat", hex: hslToHex(125, 48, 28) },
      { label: "Desert Sunset", value: "desert", hex: hslToHex(25, 80, 58) },
      { label: "Arctic Snow", value: "arctic", hex: hslToHex(210, 25, 90) },
      { label: "Mountain Dusk", value: "mountain", hex: hslToHex(255, 28, 45) },
      { label: "Tropical Bloom", value: "tropical", hex: hslToHex(145, 70, 45) },
    ],
  },
  {
    id: "warmth_pref", phase: 9,
    text: "Do you prefer warm or cool tones overall?",
    type: "scale",
    scaleLabels: ["Warm (reds/oranges/yellows)", "Cool (blues/greens/violets)"],
  },

  // ── STEP 6: Phase 11 — Cultural & Vision ──────────────────────────────────
  {
    id: "season_color", phase: 11,
    text: "Which season's color palette resonates most deeply with you?",
    type: "color-pick",
    options: [
      { label: "Spring Bloom", value: "spring", hex: hslToHex(345, 60, 78) },
      { label: "Summer Vivid", value: "summer", hex: hslToHex(55, 92, 60) },
      { label: "Autumn Harvest", value: "autumn", hex: hslToHex(22, 78, 50) },
      { label: "Winter Ice", value: "winter", hex: hslToHex(205, 55, 75) },
    ],
  },
  {
    id: "cultural_color", phase: 11,
    text: "Which color feels most connected to your heritage, culture, or roots?",
    type: "color-pick",
    options: COLOR_GROUPS.filter(g => g.id !== "G13").slice(0, 8).map(g => ({
      label: g.name, value: `cultural_${g.id}`, hex: hslToHex(g.hueCenter, 58, 45),
    })),
  },
  {
    id: "future_color", phase: 11,
    text: "If you had to pick one color to represent your ideal future, which would it be?",
    type: "color-pick",
    options: [
      { label: "Golden", value: "future_gold", hex: hslToHex(48, 92, 52) },
      { label: "Luminous Blue", value: "future_blue", hex: hslToHex(210, 80, 58) },
      { label: "Vital Green", value: "future_green", hex: hslToHex(140, 65, 42) },
      { label: "Radiant Pink", value: "future_pink", hex: hslToHex(330, 80, 65) },
      { label: "Pure White", value: "future_white", hex: hslToHex(210, 10, 95) },
      { label: "Deep Violet", value: "future_violet", hex: hslToHex(270, 65, 48) },
    ],
  },
  {
    id: "color_count_pref", phase: 11,
    text: "When choosing colors for your life, do you prefer simplicity or richness?",
    type: "scale",
    scaleLabels: ["One signature color", "Many colors together"],
  },
  {
    id: "ai_trust_color", phase: 11,
    text: "Which colors make you most trust a brand or person?",
    type: "multi-pick",
    options: [
      { label: "Deep Blue", value: "trust_blue", hex: hslToHex(218, 68, 35) },
      { label: "Forest Green", value: "trust_green", hex: hslToHex(128, 42, 32) },
      { label: "Warm Gold", value: "trust_gold", hex: hslToHex(44, 82, 50) },
      { label: "Classic Black", value: "trust_black", hex: hslToHex(0, 0, 10) },
      { label: "Soft White", value: "trust_white", hex: hslToHex(40, 12, 92) },
      { label: "Rich Burgundy", value: "trust_burgundy", hex: hslToHex(340, 52, 30) },
    ],
  },
];

type Answers = Record<string, string | string[] | number>;

const STEPS = [
  { title: "Color Preferences",     phase: 6,  questions: [0, 1, 2] },
  { title: "Emotional Associations",phase: 7,  questions: [3, 4, 5, 6] },
  { title: "Personal Feelings",     phase: 8,  questions: [7, 8, 9, 10] },
  { title: "Memory & Identity",     phase: 9,  questions: [11, 12, 13, 14] },
  { title: "Your Environment",      phase: 10, questions: [15, 16, 17, 18] },
  { title: "Culture & Vision",      phase: 11, questions: [19, 20, 21, 22, 23] },
];

// ── Question Components ───────────────────────────────────────────────────────

function ColorPickQuestion({ question, value, onChange }: {
  question: SurveyQuestion; value: string | undefined; onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {question.options?.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)}
          className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200"
          style={{
            borderColor: value === opt.value ? opt.hex ?? "#C9A84C" : "rgba(255,255,255,0.08)",
            backgroundColor: value === opt.value ? `${opt.hex ?? "#C9A84C"}18` : "rgba(255,255,255,0.03)",
            boxShadow: value === opt.value ? `0 0 14px ${opt.hex ?? "#C9A84C"}44` : "none",
          }}>
          {opt.hex && (
            <div className="w-9 h-9 rounded-lg flex-shrink-0"
              style={{ backgroundColor: opt.hex, boxShadow: `0 0 8px ${opt.hex}66` }} />
          )}
          <span className="text-sm font-medium leading-snug">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function MultiPickQuestion({ question, value, onChange }: {
  question: SurveyQuestion; value: string[] | undefined; onChange: (v: string[]) => void;
}) {
  const selected = value ?? [];
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {question.options?.map((opt) => {
        const isSelected = selected.includes(opt.value);
        return (
          <button key={opt.value} onClick={() => toggle(opt.value)}
            className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200"
            style={{
              borderColor: isSelected ? opt.hex ?? "#C9A84C" : "rgba(255,255,255,0.08)",
              backgroundColor: isSelected ? `${opt.hex ?? "#C9A84C"}18` : "rgba(255,255,255,0.03)",
              boxShadow: isSelected ? `0 0 12px ${opt.hex ?? "#C9A84C"}33` : "none",
            }}>
            {opt.hex && (
              <div className="w-9 h-9 rounded-lg flex-shrink-0"
                style={{ backgroundColor: opt.hex }} />
            )}
            <span className="text-sm font-medium leading-snug">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ScaleQuestion({ question, value, onChange }: {
  question: SurveyQuestion; value: number | undefined; onChange: (v: number) => void;
}) {
  const val = value ?? 5;
  const labels = question.scaleLabels ?? ["Low", "High"];
  return (
    <div className="space-y-5">
      <div className="flex justify-between text-sm" style={{ color: "rgba(240,237,232,0.55)" }}>
        <span>{labels[0]}</span><span>{labels[1]}</span>
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
          <button key={n} onClick={() => onChange(n)}
            className="flex-1 h-10 rounded-lg font-mono text-sm font-medium transition-all duration-150"
            style={{
              backgroundColor: val === n ? "#C9A84C" : "rgba(255,255,255,0.06)",
              color: val === n ? "#050508" : "rgba(240,237,232,0.5)",
              transform: val === n ? "scale(1.12)" : "scale(1)",
            }}>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SurveyClient() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);

  const currentStep = STEPS[stepIndex];
  const stepQuestions = currentStep.questions.map(i => Q[i]);

  const stepComplete = stepQuestions.every(q => {
    const a = answers[q.id];
    if (q.type === "multi-pick") return Array.isArray(a) && a.length > 0;
    return a !== undefined && a !== "";
  });

  const handleAnswer = (id: string, value: string | string[] | number) =>
    setAnswers(prev => ({ ...prev, [id]: value }));

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(s => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    sessionStorage.setItem("colorSurveyAnswers", JSON.stringify(answers));

    // Derive profile fields for DB
    const favGroup = COLOR_GROUPS.find(g => g.id === answers.fav_color) ?? COLOR_GROUPS[9];
    const brightnessVal = (answers.brightness_pref as number) ?? 5;
    const satVal = (answers.saturation_pref as number) ?? 5;
    const lightnessPref = brightnessVal <= 3 ? "dark" : brightnessVal >= 7 ? "light" : "mid";
    const saturationPref = satVal <= 3 ? "muted" : satVal >= 7 ? "vivid" : "moderate";

    // Generate session ID
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          answers,
          primaryColorGroup: favGroup.id,
          emotionalTone: favGroup.name,
          lightnessPref,
          saturationPref,
          palette: [],
        }),
      });
    } catch {
      // Non-blocking — proceed to profile even if save fails
    }

    setTimeout(() => router.push("/profile"), 600);
  };

  if (submitting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #C9A84C, #E8C96A)" }}>
          <CheckCircle size={32} color="#050508" />
        </div>
        <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)" }}>
          Building your color profile…
        </h2>
        <p className="text-sm" style={{ color: "rgba(240,237,232,0.5)" }}>
          Analyzing your answers across {STEPS.length} discovery phases
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
            Color Discovery Survey
          </h1>
          <p className="text-sm" style={{ color: "rgba(240,237,232,0.5)" }}>
            Phase {currentStep.phase} · {currentStep.title} · {Q.length} questions total
          </p>
        </div>

        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-2 text-xs" style={{ color: "rgba(240,237,232,0.4)" }}>
            <span>Step {stepIndex + 1} of {STEPS.length}</span>
            <span>{Math.round(((stepIndex + 1) / STEPS.length) * 100)}% complete</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%`, background: "linear-gradient(90deg, #C9A84C, #E8C96A)" }} />
          </div>
          <div className="flex gap-1 mt-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex-1 h-1 rounded-full transition-all duration-300"
                style={{ backgroundColor: i <= stepIndex ? "#C9A84C" : "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-[9px] text-center flex-1"
                style={{ color: i === stepIndex ? "#C9A84C" : "rgba(240,237,232,0.25)" }}>
                {s.title.split(" ")[0]}
              </div>
            ))}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-10">
          {stepQuestions.map((question) => (
            <div key={question.id} className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: "linear-gradient(135deg, #C9A84C, #E8C96A)", color: "#050508" }}>
                  {question.phase}
                </div>
                <h3 className="text-lg font-semibold leading-snug">{question.text}</h3>
              </div>
              {question.type === "color-pick" && (
                <ColorPickQuestion question={question} value={answers[question.id] as string}
                  onChange={v => handleAnswer(question.id, v)} />
              )}
              {question.type === "multi-pick" && (
                <MultiPickQuestion question={question} value={answers[question.id] as string[]}
                  onChange={v => handleAnswer(question.id, v)} />
              )}
              {question.type === "scale" && (
                <ScaleQuestion question={question} value={answers[question.id] as number}
                  onChange={v => handleAnswer(question.id, v)} />
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pb-12">
          <button onClick={() => setStepIndex(s => Math.max(0, s - 1))} disabled={stepIndex === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-30"
            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(240,237,232,0.7)" }}>
            <ArrowLeft size={16} />
            Back
          </button>
          <button onClick={handleNext} disabled={!stepComplete}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-30 hover:brightness-110"
            style={{
              background: stepComplete ? "linear-gradient(135deg, #C9A84C, #E8C96A)" : "rgba(255,255,255,0.1)",
              color: stepComplete ? "#050508" : "rgba(240,237,232,0.4)",
            }}>
            {stepIndex === STEPS.length - 1 ? "Get My Color Profile" : "Next Step"}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
