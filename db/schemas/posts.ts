import { pgTable, text, jsonb, timestamp, uuid, integer } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id:            uuid('id').primaryKey().defaultRandom(),
  sessionId:     text('session_id').notNull(),
  displayName:   text('display_name'),
  postType:      text('post_type').notNull(),      // 'text' | 'photo' | 'video'
  visibility:    text('visibility').notNull().default('public'), // 'public' | 'anonymous' | 'members'
  colorGroupId:  text('color_group_id'),           // e.g. 'C09'
  colorHex:      text('color_hex'),                // specific hex
  emotionTags:   jsonb('emotion_tags').$type<string[]>().default([]),
  title:         text('title'),
  content:       text('content'),
  mediaUrl:      text('media_url'),                // photo URL or video link
  mediaType:     text('media_type'),               // 'image' | 'youtube' | 'vimeo' | null
  thumbnailUrl:  text('thumbnail_url'),
  likesCount:    integer('likes_count').default(0).notNull(),
  createdAt:     timestamp('created_at').defaultNow().notNull(),
});

export const postReactions = pgTable('post_reactions', {
  id:         uuid('id').primaryKey().defaultRandom(),
  postId:     uuid('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  sessionId:  text('session_id').notNull(),
  reaction:   text('reaction').notNull(), // 'resonate' | 'moving' | 'powerful' | 'peaceful'
  createdAt:  timestamp('created_at').defaultNow().notNull(),
});

export type Post         = typeof posts.$inferSelect;
export type NewPost      = typeof posts.$inferInsert;
export type PostReaction = typeof postReactions.$inferSelect;
