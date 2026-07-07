"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { extractYouTubeId, extractVimeoId, EMOTION_COLORS, REACTION_LABELS, ReactionType } from "@/lib/posts";

const BG = "#050508";
const CARD = "rgba(255,255,255,0.04)";
const BORDER = "rgba(255,255,255,0.08)";
const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8C96A";
const FG = "#F0EDE8";
const FG_DIM = "rgba(240,237,232,0.55)";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("colorSessionId");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("colorSessionId", id); }
  return id;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Record<string, unknown> | null>(null);
  const [reactions, setReactions] = useState<{ reaction: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [reacting, setReacting] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(data => { if (data) { setPost(data.post); setReactions(data.reactions ?? []); } })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function react(reaction: ReactionType) {
    setReacting(reaction);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId(), reaction }),
      });
      if (res.ok) {
        const data = await res.json();
        setReactions(data.reactions ?? reactions);
      }
    } finally { setReacting(null); }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
      <div className="flex flex-col gap-4 w-full max-w-xl px-4">
        {[100, 60, 80, 40].map((w, i) => (
          <div key={i} className="rounded-xl animate-pulse" style={{ height: 20, width: `${w}%`, background: CARD }} />
        ))}
      </div>
    </div>
  );

  if (notFound || !post) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: BG, color: FG }}>
      <p className="text-lg" style={{ color: FG_DIM }}>Post not found</p>
      <button onClick={() => router.push("/community")} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
        style={{ background: CARD, border: `1px solid ${BORDER}`, color: FG }}>
        <ArrowLeft size={14} /> Back to community
      </button>
    </div>
  );

  const colorHex = post.colorHex as string ?? "#C9A84C";
  const postType = post.postType as string ?? "text";
  const mediaUrl = post.mediaUrl as string ?? "";
  const emotionTags = (post.emotionTags ?? []) as string[];
  const authorName = (post.displayName as string) || (post.visibility === "anonymous" ? "Anonymous Soul" : "A Color Explorer");

  const ytId = postType === "video" && mediaUrl ? extractYouTubeId(mediaUrl) : null;
  const vimeoId = postType === "video" && mediaUrl && !ytId ? extractVimeoId(mediaUrl) : null;

  return (
    <div className="min-h-screen px-4 py-10" style={{ background: BG, color: FG }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.push("/community")} className="flex items-center gap-2 mb-8 text-sm transition-opacity hover:opacity-70"
          style={{ color: FG_DIM }}>
          <ArrowLeft size={16} /> Back to community
        </button>

        {/* Color swatch + meta */}
        <div className="flex items-center gap-5 mb-8">
          <div className="rounded-2xl flex-shrink-0" style={{ width: 80, height: 80, background: colorHex, boxShadow: `0 0 32px ${colorHex}66`, border: `1px solid ${BORDER}` }} />
          <div>
            <div className="flex gap-2 flex-wrap mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                style={{ background: "rgba(201,168,76,0.15)", border: `1px solid ${GOLD}`, color: GOLD_LIGHT }}>
                {postType}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium capitalize"
                style={{ background: CARD, border: `1px solid ${BORDER}`, color: FG_DIM }}>
                {String(post.visibility ?? "")}
              </span>
              {!!post.colorGroupId && (
                <span className="px-2.5 py-0.5 rounded-full text-xs" style={{ background: CARD, border: `1px solid ${BORDER}`, color: FG_DIM }}>
                  {String(post.colorGroupId)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {emotionTags.map(tag => {
                const ec = EMOTION_COLORS[tag] ?? GOLD;
                return (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full text-xs capitalize"
                    style={{ background: ec + "22", border: `1px solid ${ec}55`, color: ec }}>
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Title */}
        {!!post.title && (
          <h1 className="text-3xl font-bold mb-4 leading-snug" style={{ fontFamily: "var(--font-playfair)", color: FG }}>
            {String(post.title)}
          </h1>
        )}

        {/* Content */}
        <p className="text-base leading-relaxed mb-7 whitespace-pre-wrap" style={{ color: FG_DIM }}>
          {String(post.content ?? "")}
        </p>

        {/* Photo */}
        {postType === "photo" && mediaUrl && (
          <div className="mb-7">
            <img src={mediaUrl} alt="Post photo" className="w-full rounded-2xl object-cover" style={{ border: `1px solid ${BORDER}` }} />
          </div>
        )}

        {/* Video embed */}
        {(ytId || vimeoId) && (
          <div className="mb-7 rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9", border: `1px solid ${BORDER}` }}>
            <iframe className="w-full h-full" allowFullScreen title="Video"
              src={ytId ? `https://www.youtube.com/embed/${ytId}` : `https://player.vimeo.com/video/${vimeoId}`} />
          </div>
        )}

        {/* Author + date */}
        <p className="text-sm mb-8" style={{ color: FG_DIM }}>
          <span style={{ color: FG }}>{authorName}</span>
          {!!post.createdAt && <span> · Posted {relativeTime(String(post.createdAt))}</span>}
        </p>

        {/* Reactions */}
        <div className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-xs mb-4 font-medium uppercase tracking-widest" style={{ color: FG_DIM }}>React to this story</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(Object.keys(REACTION_LABELS) as ReactionType[]).map(r => {
              const { label, emoji } = REACTION_LABELS[r];
              const count = reactions.find(rx => rx.reaction === r)?.count ?? 0;
              const busy = reacting === r;
              return (
                <button key={r} onClick={() => react(r)} disabled={!!reacting}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-sm transition-all hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: FG, opacity: busy ? 0.6 : 1 }}>
                  <span className="text-xl">{emoji}</span>
                  <span className="font-medium text-xs" style={{ color: FG_DIM }}>{label}</span>
                  <span className="text-sm font-semibold" style={{ color: GOLD_LIGHT }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
