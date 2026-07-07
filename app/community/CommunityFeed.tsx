"use client";

import { EMOTION_COLORS, REACTION_LABELS, getAuthorLabel, type ReactionType } from "@/lib/posts";
import { COLOR_GROUPS } from "@/lib/colors";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { FileText, Image as ImageIcon, Video, Globe, EyeOff, Lock, Plus, Filter } from "lucide-react";
import { Suspense } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Post {
  id: string;
  colorHex: string;
  colorGroupId: string;
  postType: "text" | "photo" | "video";
  visibility: "public" | "anonymous" | "members";
  emotionTags: string[];
  title?: string;
  content: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  authorId?: string;
  authorName?: string;
  createdAt: string;
  reactions?: Record<string, number>;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("colorSessionId");
  if (!id) { id = crypto.randomUUID(); localStorage.setItem("colorSessionId", id); }
  return id;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// ── PostCard ─────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: Post }) {
  const [reactions, setReactions] = useState<Record<string, number>>(post.reactions ?? {});
  const [voted, setVoted] = useState<string | null>(null);

  const handleReaction = async (type: ReactionType) => {
    const sessionId = getSessionId();
    if (!sessionId) return;
    setVoted(type);
    setReactions(prev => ({ ...prev, [type]: (prev[type] ?? 0) + 1 }));
    try {
      await fetch(`/api/posts/${post.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, reaction: type }),
      });
    } catch { /* optimistic — ignore error */ }
  };

  const TypeIcon = post.postType === "photo" ? ImageIcon : post.postType === "video" ? Video : FileText;
  const VisIcon = post.visibility === "public" ? Globe : post.visibility === "anonymous" ? EyeOff : Lock;

  const colorGroupLabel = COLOR_GROUPS?.find?.((g: { id: string }) => g.id === post.colorGroupId)?.name ?? post.colorGroupId;

  return (
    <article style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {/* Top row: swatch + meta */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, flexShrink: 0,
          background: post.colorHex,
          boxShadow: `0 0 12px 2px ${post.colorHex}55`,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
              background: "rgba(201,168,76,0.15)", color: "#C9A84C",
              border: "1px solid rgba(201,168,76,0.3)", borderRadius: 6, padding: "2px 7px",
            }}>{colorGroupLabel}</span>
            <span style={{
              fontSize: 11, color: "#F0EDE8", opacity: 0.5,
              display: "flex", alignItems: "center", gap: 3,
            }}>
              <TypeIcon size={11} />{post.postType}
            </span>
            <span style={{
              fontSize: 11, color: "#F0EDE8", opacity: 0.45,
              display: "flex", alignItems: "center", gap: 3,
            }}>
              <VisIcon size={11} />{post.visibility}
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#F0EDE8", opacity: 0.4, marginTop: 4 }}>
            {getAuthorLabel(post.authorName ?? null, post.visibility)} · {relativeTime(post.createdAt)}
          </div>
        </div>
      </div>

      {/* Emotion tags */}
      {post.emotionTags?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {post.emotionTags.map(tag => (
            <span key={tag} style={{
              fontSize: 11, borderRadius: 20, padding: "2px 9px",
              background: `${(EMOTION_COLORS as Record<string, string>)[tag] ?? "#888"}22`,
              color: (EMOTION_COLORS as Record<string, string>)[tag] ?? "#F0EDE8",
              border: `1px solid ${(EMOTION_COLORS as Record<string, string>)[tag] ?? "#888"}44`,
            }}>{tag}</span>
          ))}
        </div>
      )}

      {/* Title */}
      {post.title && (
        <h3 style={{
          fontFamily: "var(--font-playfair)", fontSize: 17, fontWeight: 600,
          color: "#F0EDE8", margin: 0, lineHeight: 1.35,
        }}>{post.title}</h3>
      )}

      {/* Content */}
      <p style={{
        fontSize: 14, color: "#F0EDE8", opacity: 0.75, margin: 0,
        lineHeight: 1.6,
        overflow: "hidden", display: "-webkit-box",
        WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
      }}>{post.content}</p>

      {/* Media */}
      {post.postType === "photo" && post.mediaUrl && (
        <img src={post.mediaUrl} alt="" style={{ width: "100%", borderRadius: 10, maxHeight: 200, objectFit: "cover" }} />
      )}
      {post.postType === "video" && (
        post.thumbnailUrl
          ? <img src={post.thumbnailUrl} alt="video thumbnail" style={{ width: "100%", borderRadius: 10, maxHeight: 180, objectFit: "cover" }} />
          : <div style={{ width: "100%", height: 100, borderRadius: 10, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Video size={28} color="rgba(240,237,232,0.25)" />
            </div>
      )}

      {/* Footer: reactions + view */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
        {(Object.entries(REACTION_LABELS) as [ReactionType, { label: string; emoji: string }][]).map(([type, info]) => (
          <button key={type} onClick={() => voted ? undefined : handleReaction(type)} style={{
            fontSize: 12, padding: "4px 10px", borderRadius: 20, cursor: voted ? "default" : "pointer",
            background: voted === type ? "rgba(201,168,76,0.15)" : "rgba(255,255,255,0.05)",
            border: voted === type ? "1px solid rgba(201,168,76,0.4)" : "1px solid rgba(255,255,255,0.08)",
            color: voted === type ? "#C9A84C" : "#F0EDE8",
            transition: "all 0.15s",
          }}>
            {info.emoji} {info.label} {reactions[type] ? <span style={{ opacity: 0.6 }}>{reactions[type]}</span> : null}
          </button>
        ))}
        <Link href={`/community/${post.id}`} style={{
          marginLeft: "auto", fontSize: 12, color: "#C9A84C",
          textDecoration: "none", opacity: 0.8,
          whiteSpace: "nowrap",
        }}>View post →</Link>
      </div>
    </article>
  );
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 20 }}>
      {[80, 55, 40].map((w, i) => (
        <div key={i} style={{ height: i === 0 ? 14 : 12, width: `${w}%`, borderRadius: 6, background: "rgba(255,255,255,0.08)", marginBottom: 10, animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );
}

// ── Main feed ─────────────────────────────────────────────────────────────────

const POST_TYPES = ["all", "text", "photo", "video"] as const;

export function CommunityFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [emotionFilter, setEmotionFilter] = useState<string>("all");

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("postType", typeFilter);
      if (emotionFilter !== "all") params.set("emotion", emotionFilter);
      const res = await fetch(`/api/posts?${params.toString()}`);
      if (res.ok) setPosts(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [typeFilter, emotionFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const emotionOptions = Object.keys(EMOTION_COLORS) as string[];

  return (
    <Suspense>
      <div style={{ minHeight: "100vh", background: "#050508", color: "#F0EDE8", padding: "40px 16px 80px", fontFamily: "var(--font-inter)" }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontSize: 36, fontWeight: 700, color: "#F0EDE8", margin: "0 0 10px" }}>
              Color Community
            </h1>
            <p style={{ fontSize: 16, color: "#F0EDE8", opacity: 0.55, margin: 0 }}>
              Share how colors make you feel
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
            {/* Type tabs */}
            <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: 4, border: "1px solid rgba(255,255,255,0.08)" }}>
              {POST_TYPES.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} style={{
                  fontSize: 13, padding: "5px 13px", borderRadius: 7, border: "none", cursor: "pointer",
                  background: typeFilter === t ? "rgba(201,168,76,0.2)" : "transparent",
                  color: typeFilter === t ? "#C9A84C" : "#F0EDE8",
                  fontWeight: typeFilter === t ? 600 : 400,
                  transition: "all 0.15s",
                }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
              ))}
            </div>

            {/* Emotion filter */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Filter size={14} color="rgba(240,237,232,0.4)" />
              <select value={emotionFilter} onChange={e => setEmotionFilter(e.target.value)} style={{
                fontSize: 13, padding: "6px 10px", borderRadius: 8, cursor: "pointer",
                background: "rgba(255,255,255,0.04)", color: "#F0EDE8",
                border: "1px solid rgba(255,255,255,0.08)", outline: "none",
              }}>
                <option value="all">All emotions</option>
                {emotionOptions.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* New post */}
            <Link href="/community/new" style={{
              marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
              padding: "7px 16px", borderRadius: 10, textDecoration: "none",
              background: "linear-gradient(135deg, #C9A84C, #a8882e)",
              color: "#050508", fontWeight: 700, fontSize: 13,
            }}>
              <Plus size={15} />New Post
            </Link>
          </div>

          {/* Feed */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎨</div>
              <h2 style={{ fontFamily: "var(--font-playfair)", fontSize: 22, color: "#F0EDE8", margin: "0 0 10px" }}>
                Be the first to share
              </h2>
              <p style={{ fontSize: 15, color: "#F0EDE8", opacity: 0.5, margin: "0 0 24px" }}>
                No posts yet. Start the conversation by sharing how a color makes you feel.
              </p>
              <Link href="/community/new" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "10px 22px", borderRadius: 10, textDecoration: "none",
                background: "linear-gradient(135deg, #C9A84C, #a8882e)",
                color: "#050508", fontWeight: 700, fontSize: 14,
              }}><Plus size={15} />Share a Color Story</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {posts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </div>

        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
      </div>
    </Suspense>
  );
}
