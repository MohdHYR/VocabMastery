import { db } from "./db";
import {
  users, vocabularies, results,
  type User, type InsertUser,
  type Vocabulary, type InsertVocabulary,
  type Result, type InsertResult
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Vocabulary methods
  getVocabularies(grade?: string, unit?: string): Promise<Vocabulary[]>;
  createVocabulary(vocab: InsertVocabulary): Promise<Vocabulary>;
  bulkCreateVocabularies(vocabs: InsertVocabulary[]): Promise<Vocabulary[]>;
  getUniqueGradesAndUnits(): Promise<{ grade: string; unit: string }[]>;

  // Result methods
  createResult(result: InsertResult): Promise<Result>;
  getLeaderboard(): Promise<{ username: string; score: number; createdAt: Date | null }[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getVocabularies(grade?: string, unit?: string): Promise<Vocabulary[]> {
    let query = db.select().from(vocabularies);
    
    if (grade && unit) {
      return await query.where(sql`${vocabularies.grade} = ${grade} AND ${vocabularies.unit} = ${unit}`);
    } else if (grade) {
      return await query.where(eq(vocabularies.grade, grade));
    } else if (unit) {
      return await query.where(eq(vocabularies.unit, unit));
    }
    
    return await query;
  }

  async createVocabulary(vocab: InsertVocabulary): Promise<Vocabulary> {
    const [newVocab] = await db.insert(vocabularies).values(vocab).returning();
    return newVocab;
  }

  async bulkCreateVocabularies(vocabs: InsertVocabulary[]): Promise<Vocabulary[]> {
    if (vocabs.length === 0) return [];
    return await db.insert(vocabularies).values(vocabs).returning();
  }

  async getUniqueGradesAndUnits(): Promise<{ grade: string; unit: string }[]> {
    return await db
      .selectDistinct({ grade: vocabularies.grade, unit: vocabularies.unit })
      .from(vocabularies)
      .orderBy(vocabularies.grade, vocabularies.unit);
  }

  async createResult(result: InsertResult): Promise<Result> {
    const [newResult] = await db.insert(results).values(result).returning();
    return newResult;
  }

  async getLeaderboard(): Promise<{ username: string; score: number; createdAt: Date | null }[]> {
    return await db
      .select({
        username: users.username,
        score: results.score,
        createdAt: results.createdAt
      })
      .from(results)
      .innerJoin(users, eq(results.userId, users.id))
      .orderBy(desc(results.score))
      .limit(10);
  }
}

import { sql } from "drizzle-orm";
export const storage = new DatabaseStorage();
