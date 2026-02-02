import { storage } from "./storage";
import { db } from "./db";

async function seed() {
  console.log("Seeding database...");

  const existing = await storage.getVocabularies();
  if (existing.length > 0) {
    console.log("Database already seeded.");
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
    },
    {
      grade: "1",
      unit: "1",
      word: "Fast",
      meaningEn: "Moving or capable of moving at high speed.",
      meaningAr: "سريع",
      antonyms: ["Slow"],
      synonyms: ["Quick", "Rapid"],
      usageEn: "Cheetahs are very fast runners.",
      usageAr: "الفهود عدائون سريعون جداً."
    },
    {
      grade: "2",
      unit: "1",
      word: "Discover",
      meaningEn: "Find unexpectedly or during a search.",
      meaningAr: "يكتشف",
      antonyms: ["Hide", "Cover"],
      synonyms: ["Find", "Uncover"],
      usageEn: "Scientists discover new things every day.",
      usageAr: "يكتشف العلماء أشياء جديدة كل يوم."
    }
  ];

  for (const vocab of vocabs) {
    await storage.createVocabulary(vocab);
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
