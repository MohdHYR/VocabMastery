import { db } from "./db";
import {
  users, vocabularies, results,
  type User, type InsertUser,
  type Vocabulary, type InsertVocabulary,
  type Result, type InsertResult
} from "@shared/schema";
import { eq, desc, and, inArray, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Vocabulary methods
  getVocabularies(grade?: string | string[], unit?: string | string[]): Promise<Vocabulary[]>;
  createVocabulary(vocab: InsertVocabulary): Promise<Vocabulary>;
  bulkCreateVocabularies(vocabs: InsertVocabulary[]): Promise<Vocabulary[]>;
  getUniqueGradesAndUnits(): Promise<{ grade: string; unit: string }[]>;

  // Result methods
  createResult(result: InsertResult): Promise<Result>;
  getLeaderboard(grade?: string | string[], unit?: string | string[]): Promise<{ username: string; score: number; grade: string | null; unit: string | null; createdAt: Date | null }[]>;
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

  async getVocabularies(grade?: string | string[], unit?: string | string[]): Promise<Vocabulary[]> {
    let query = db.select().from(vocabularies);
    
    const conditions = [];
    if (grade) {
      if (Array.isArray(grade)) {
        if (grade.length > 0) conditions.push(inArray(vocabularies.grade, grade));
      } else {
        conditions.push(eq(vocabularies.grade, grade));
      }
    }
    if (unit) {
      if (Array.isArray(unit)) {
        if (unit.length > 0) conditions.push(inArray(vocabularies.unit, unit));
      } else {
        conditions.push(eq(vocabularies.unit, unit));
      }
    }

    if (conditions.length > 0) {
      return await query.where(and(...conditions));
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

  async getLeaderboard(grade?: string | string[], unit?: string | string[]): Promise<{ username: string; score: number; grade: string | null; unit: string | null; createdAt: Date | null }[]> {
    const query = db
      .select({
        username: users.username,
        score: results.score,
        grade: results.grade,
        unit: results.unit,
        createdAt: results.createdAt
      })
      .from(results)
      .innerJoin(users, eq(results.userId, users.id));

    const conditions = [];
    if (grade) {
      if (Array.isArray(grade)) {
        if (grade.length > 0) conditions.push(inArray(results.grade, grade));
      } else {
        conditions.push(eq(results.grade, grade));
      }
    }
    if (unit) {
      if (Array.isArray(unit)) {
        if (unit.length > 0) conditions.push(inArray(results.unit, unit));
      } else {
        conditions.push(eq(results.unit, unit));
      }
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    return await query.orderBy(desc(results.score)).limit(10);
  }
}

export const storage = new DatabaseStorage();
