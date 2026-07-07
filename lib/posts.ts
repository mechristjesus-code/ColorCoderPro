// Shared constants and helpers for the posts / community system

export const POST_TYPES = ['text', 'photo', 'video'] as const;
export type PostType = typeof POST_TYPES[number];

export const VISIBILITY_OPTIONS = ['public', 'anonymous', 'members'] as const;
export type Visibility = typeof VISIBILITY_OPTIONS[number];

export const REACTION_TYPES = ['resonate', 'moving', 'powerful', 'peaceful'] as const;
export type ReactionType = typeof REACTION_TYPES[number];

export const EMOTION_TAGS = [
  'calm', 'joy', 'hope', 'love', 'fear', 'anger', 'peace', 'energy',
  'nostalgia', 'confidence', 'creativity', 'curiosity', 'sadness',
  'excitement', 'comfort', 'awe',
] as const;
export type EmotionTag = typeof EMOTION_TAGS[number];

export const REACTION_LABELS: Record<ReactionType, { label: string; emoji: string }> = {
  resonate:  { label: 'Resonates',   emoji: '🌊' },
  moving:    { label: 'Moving',      emoji: '💫' },
  powerful:  { label: 'Powerful',    emoji: '⚡' },
  peaceful:  { label: 'Peaceful',    emoji: '🕊️' },
};

export const EMOTION_COLORS: Record<string, string> = {
  calm:        '#7EC8C8',
  joy:         '#FFD166',
  hope:        '#A8DADC',
  love:        '#FF6B9D',
  fear:        '#6B6B8A',
  anger:       '#E84855',
  peace:       '#B5EAD7',
  energy:      '#FF9F1C',
  nostalgia:   '#C9A84C',
  confidence:  '#4A90D9',
  creativity:  '#9B5DE5',
  curiosity:   '#00BBF9',
  sadness:     '#6B9AC4',
  excitement:  '#F15BB5',
  comfort:     '#D4A373',
  awe:         '#E8C9FF',
};

/** Extract YouTube video ID from any YouTube URL */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/** Extract Vimeo video ID */
export function extractVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

/** Detect media type from a URL */
export function detectMediaType(url: string): 'youtube' | 'vimeo' | 'image' | null {
  if (!url) return null;
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('vimeo.com')) return 'vimeo';
  if (/\.(jpg|jpeg|png|gif|webp|avif)(\?|$)/i.test(url)) return 'image';
  return null;
}

/** Get a YouTube thumbnail from video ID */
export function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** Build a displayable author label respecting visibility */
export function getAuthorLabel(displayName: string | null, visibility: string, colorGroupName?: string): string {
  if (visibility === 'anonymous') return colorGroupName ? `A ${colorGroupName} Soul` : 'Anonymous';
  return displayName || 'A Color Explorer';
}
