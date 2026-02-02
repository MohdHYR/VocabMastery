import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // Create admin user
  const adminUsername = "admin";
  const adminPassword = "admin";
  
  const existingAdmin = await storage.getUserByUsername(adminUsername);
  if (!existingAdmin) {
    console.log("Creating admin user...");
    await db.insert(users).values({
      username: adminUsername,
      password: adminPassword,
      isAdmin: true,
    });
  } else {
    // Ensure existing admin has the requested credentials
    await db.update(users)
      .set({ password: adminPassword, isAdmin: true })
      .where(eq(users.username, adminUsername));
  }

  const existingVocab = await storage.getVocabularies();
  if (existingVocab.length > 0) {
    console.log("Database already has vocabulary.");
    return;
  }

  // Create some sample vocabulary for Grade 1, Unit 1
  const vocabs = [
    {
      grade: "1",
      unit: "1",
      word: "Happy",
      meaningEn: "Feeling or showing pleasure or contentment.",
      meaningAr: "سعيد",
      antonyms: ["Sad", "Unhappy"],
      synonyms: ["Joyful", "Cheerful"],
      usageEn: "She looks very happy today.",
      usageAr: "تبدو سعيدة جداً اليوم."
    },
    {
      grade: "1",
      unit: "1",
      word: "Big",
      meaningEn: "Of considerable size, extent, or intensity.",
      meaningAr: "كبير",
      antonyms: ["Small", "Tiny"],
      synonyms: ["Large", "Huge"],
      usageEn: "That is a big elephant.",
      usageAr: "هذا فيل كبير."
    }
  ];

  for (const vocab of vocabs) {
    await storage.createVocabulary(vocab);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
