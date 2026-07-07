"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Type, Image, Video, ChevronLeft, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import { POST_TYPES, VISIBILITY_OPTIONS, EMOTION_TAGS, EMOTION_COLORS, extractYouTubeId } from "@/lib/posts";
import { COLOR_GROUPS, hslToHex } from "@/lib/colors";

const BG = "#050508";
const CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C96A";
const FG = "#F0EDE8";
const FG_DIM = "rgba(240,237,232,0.55)";

type Step = 1 | 2 | 3 | 4;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("colorSessionId");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("colorSessionId", id); }
  return id;
}

export function CreatePostClient() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [postType, setPostType] = useState<string>("text");
  const [colorHex, setColorHex] = useState("#C9A84C");
  const [colorGroupId, setColorGroupId] = useState("C01");
  const [emotions, setEmotions] = useState<string[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const canNext = step === 1
    ? true
    : step === 2 ? true
    : step === 3 ? emotions.length >= 1
    : content.trim().length > 0;

  function toggleEmotion(tag: string) {
    setEmotions(prev =>
      prev.includes(tag) ? prev.filter(e => e !== tag) : prev.length < 5 ? [...prev, tag] : prev
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const sessionId = getSessionId();
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, postType, colorHex, colorGroupId, emotions, displayName: displayName || null, visibility, title: title || null, content, mediaUrl: mediaUrl || null }),
      });
      if (!res.ok) throw new Error("Failed to submit");
      setSuccess(true);
      setTimeout(() => router.push("/community"), 1800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: BG, color: FG }}>
      <div className="w-full max-w-xl">
        <StepDots step={step} />
        <div className="rounded-2xl p-8 mt-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          {step === 1 && <StepType postType={postType} setPostType={setPostType} />}
          {step === 2 && <StepColor colorHex={colorHex} setColorHex={setColorHex} colorGroupId={colorGroupId} setColorGroupId={setColorGroupId} />}
          {step === 3 && <StepEmotions emotions={emotions} toggleEmotion={toggleEmotion} />}
          {step === 4 && !success && (
            <StepStory
              postType={postType} displayName={displayName} setDisplayName={setDisplayName}
              visibility={visibility} setVisibility={setVisibility} title={title} setTitle={setTitle}
              content={content} setContent={setContent} mediaUrl={mediaUrl} setMediaUrl={setMediaUrl}
              error={error}
            />
          )}
          {success && <SuccessView />}
        </div>
        {!success && (
          <div className="flex justify-between mt-6">
            <button onClick={() => step > 1 ? setStep((step - 1) as Step) : router.push("/community")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: CARD, border: `1px solid ${BORDER}`, color: FG }}>
              <ChevronLeft size={16} /> Back
            </button>
            {step < 4 ? (
              <button onClick={() => canNext && setStep((step + 1) as Step)} disabled={!canNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity"
                style={{ background: canNext ? GOLD : BORDER, color: canNext ? "#050508" : FG_DIM, opacity: canNext ? 1 : 0.6 }}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={!canNext || submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: canNext ? GOLD : BORDER, color: canNext ? "#050508" : FG_DIM }}>
                {submitting ? <><Loader2 size={16} className="animate-spin" /> Sharing…</> : "Share Story"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StepDots({ step }: { step: Step }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {([1, 2, 3, 4] as Step[]).map(s => (
        <div key={s} className="rounded-full transition-all"
          style={{ width: s === step ? 28 : 10, height: 10, background: s === step ? GOLD : s < step ? GOLD_LIGHT : BORDER }} />
      ))}
    </div>
  );
}

function StepType({ postType, setPostType }: { postType: string; setPostType: (t: string) => void }) {
  const types = [
    { id: "text",  Icon: Type,  title: "Text",  desc: "Write a reflection, poem, or story about your color." },
    { id: "photo", Icon: Image, title: "Photo",  desc: "Share an image that captures your color's essence." },
    { id: "video", Icon: Video, title: "Video",  desc: "Link a YouTube or Vimeo video about your color story." },
  ];
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair)", color: FG }}>Choose your format</h2>
      <p className="text-sm mb-6" style={{ color: FG_DIM }}>What kind of story will you share?</p>
      <div className="flex flex-col gap-3">
        {types.map(({ id, Icon, title, desc }) => {
          const active = postType === id;
          return (
            <button key={id} onClick={() => setPostType(id)} className="flex items-start gap-4 p-4 rounded-xl text-left transition-all"
              style={{ background: active ? "rgba(201,168,76,0.12)" : CARD, border: `1.5px solid ${active ? GOLD : BORDER}` }}>
              <div className="mt-0.5 rounded-lg p-2" style={{ background: active ? "rgba(201,168,76,0.2)" : BORDER }}>
                <Icon size={20} style={{ color: active ? GOLD_LIGHT : FG_DIM }} />
              </div>
              <div>
                <div className="font-semibold text-sm mb-0.5" style={{ color: active ? GOLD_LIGHT : FG }}>{title}</div>
                <div className="text-xs" style={{ color: FG_DIM }}>{desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepColor({ colorHex, setColorHex, colorGroupId, setColorGroupId }:
  { colorHex: string; setColorHex: (h: string) => void; colorGroupId: string; setColorGroupId: (g: string) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair)", color: FG }}>Choose your color</h2>
      <p className="text-sm mb-6" style={{ color: FG_DIM }}>Which color speaks to you right now?</p>
      <div className="grid grid-cols-7 gap-2 mb-5">
        {COLOR_GROUPS.map(group => {
          const hex = hslToHex(group.hueCenter, 65, 50);
          const active = colorGroupId === group.id;
          return (
            <button key={group.id} title={group.name} onClick={() => { setColorGroupId(group.id); setColorHex(hex); }}
              className="rounded-lg transition-all aspect-square"
              style={{ background: hex, border: `2px solid ${active ? "#fff" : "transparent"}`,
                boxShadow: active ? `0 0 12px ${hex}88` : "none", transform: active ? "scale(1.12)" : "scale(1)" }} />
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <div className="rounded-lg w-10 h-10 flex-shrink-0" style={{ background: colorHex, border: `1px solid ${BORDER}` }} />
        <div className="flex-1">
          <label className="text-xs mb-1 block" style={{ color: FG_DIM }}>Custom hex color</label>
          <input value={colorHex} onChange={e => setColorHex(e.target.value)} placeholder="#C9A84C"
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, color: FG }} />
        </div>
      </div>
    </div>
  );
}

function StepEmotions({ emotions, toggleEmotion }: { emotions: string[]; toggleEmotion: (t: string) => void }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-playfair)", color: FG }}>Tag the emotions</h2>
      <p className="text-sm mb-2" style={{ color: FG_DIM }}>Pick 1–5 emotions this color evokes.</p>
      <p className="text-xs mb-5" style={{ color: emotions.length >= 5 ? GOLD : FG_DIM }}>{emotions.length}/5 selected</p>
      <div className="flex flex-wrap gap-2">
        {EMOTION_TAGS.map(tag => {
          const active = emotions.includes(tag);
          const ec = EMOTION_COLORS[tag] ?? GOLD;
          return (
            <button key={tag} onClick={() => toggleEmotion(tag)}
              className="px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-all"
              style={{ background: active ? ec + "33" : CARD, border: `1.5px solid ${active ? ec : BORDER}`,
                color: active ? ec : FG_DIM, boxShadow: active ? `0 0 8px ${ec}55` : "none" }}>
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepStory({ postType, displayName, setDisplayName, visibility, setVisibility, title, setTitle, content, setContent, mediaUrl, setMediaUrl, error }:
  { postType: string; displayName: string; setDisplayName: (v: string) => void; visibility: string; setVisibility: (v: string) => void; title: string; setTitle: (v: string) => void; content: string; setContent: (v: string) => void; mediaUrl: string; setMediaUrl: (v: string) => void; error: string }) {
  const ytId = postType === "video" && mediaUrl ? extractYouTubeId(mediaUrl) : null;
  const inputStyle = { background: "rgba(255,255,255,0.06)", border: `1px solid ${BORDER}`, color: FG };
  const visOptions = [
    { id: "public", label: "Public" }, { id: "anonymous", label: "Anonymous" }, { id: "members", label: "Members" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)", color: FG }}>Write your story</h2>
      <div>
        <label className="text-xs mb-1.5 block" style={{ color: FG_DIM }}>Your name (optional)</label>
        <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Your name or leave blank for anonymous"
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
      </div>
      <div>
        <label className="text-xs mb-1.5 block" style={{ color: FG_DIM }}>Visibility</label>
        <div className="flex gap-2">
          {visOptions.map(({ id, label }) => (
            <button key={id} onClick={() => setVisibility(id)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
              style={{ background: visibility === id ? "rgba(201,168,76,0.15)" : CARD, border: `1.5px solid ${visibility === id ? GOLD : BORDER}`, color: visibility === id ? GOLD_LIGHT : FG_DIM }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs mb-1.5 block" style={{ color: FG_DIM }}>Title (optional)</label>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Give your story a title…"
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
      </div>
      <div>
        <label className="text-xs mb-1.5 block" style={{ color: FG_DIM }}>Your reflection <span style={{ color: "#E84855" }}>*</span></label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} placeholder="What does this color mean to you? Share a memory, feeling, or story…"
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none" style={inputStyle} />
      </div>
      {postType === "photo" && (
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: FG_DIM }}>Image URL</label>
          <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://…"
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
        </div>
      )}
      {postType === "video" && (
        <div>
          <label className="text-xs mb-1.5 block" style={{ color: FG_DIM }}>YouTube / Vimeo URL</label>
          <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://youtube.com/watch?v=…"
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none" style={inputStyle} />
          {ytId && (
            <div className="mt-3 rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
              <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full" allowFullScreen title="Video preview" />
            </div>
          )}
        </div>
      )}
      {error && <p className="text-sm" style={{ color: "#E84855" }}>{error}</p>}
    </div>
  );
}

function SuccessView() {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <CheckCircle size={48} style={{ color: GOLD_LIGHT }} />
      <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-playfair)", color: FG }}>Story shared!</h2>
      <p className="text-sm text-center" style={{ color: FG_DIM }}>Your color story is now part of the community. Redirecting…</p>
    </div>
  );
}
