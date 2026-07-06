import { pgTable, text, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';

export const surveyResponses = pgTable('survey_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: text('session_id').notNull(),
  answers: jsonb('answers').notNull(),
  primaryColorGroup: text('primary_color_group'),
  emotionalTone: text('emotional_tone'),
  lightnessPref: text('lightness_pref'),
  saturationPref: text('saturation_pref'),
  palette: jsonb('palette'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type NewSurveyResponse = typeof surveyResponses.$inferInsert;
