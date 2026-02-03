import { sql } from "drizzle-orm";
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"), // Added for simple manual login as requested
  isAdmin: boolean("is_admin").default(false),
  // Replit Auth fields
  replitId: text("replit_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const vocabularies = pgTable("vocabularies", {
  id: serial("id").primaryKey(),
  grade: text("grade").notNull(),
  unit: text("unit").notNull(),
  word: text("word").notNull(),
  meaningEn: text("meaning_en").notNull(),
  meaningAr: text("meaning_ar").notNull(),
  antonyms: text("antonyms").array(),
  synonyms: text("synonyms").array(),
  usageEn: text("usage_en").notNull(),
  usageAr: text("usage_ar").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const results = pgTable("results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  score: integer("score").notNull(),
  grade: text("grade"),
  unit: text("unit"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertVocabularySchema = createInsertSchema(vocabularies).omit({ id: true, createdAt: true });
export const insertResultSchema = createInsertSchema(results).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Vocabulary = typeof vocabularies.$inferSelect;
export type InsertVocabulary = z.infer<typeof insertVocabularySchema>;

export type Result = typeof results.$inferSelect;
export type InsertResult = z.infer<typeof insertResultSchema>;

export type LeaderboardEntry = {
  username: string;
  score: number;
  date: string;
};

// Response types
export type VocabularyResponse = Vocabulary;
export type VocabularyListResponse = Vocabulary[];
