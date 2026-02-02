import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStoreFactory from "memorystore";

const MemoryStore = MemoryStoreFactory(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Simple session setup for manual login
  app.use(
    session({
      cookie: { maxAge: 86400000 },
      store: new MemoryStore({
        checkPeriod: 86400000,
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "vocabulary-mastery-secret",
    })
  );

  // Manual Login Route for Admin
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    
    if (user && user.password === password) {
      (req.session as any).userId = user.id;
      return res.json(user);
    }
    
    res.status(401).json({ message: "Invalid credentials" });
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).send("Logout failed");
      res.sendStatus(200);
    });
  });

  // Current User Middleware-like check
  app.get(api.auth.me.path, async (req, res) => {
    const userId = (req.session as any).userId;
    if (userId) {
      const user = await storage.getUser(userId);
      return res.json(user);
    }
    res.json(null);
  });

  // Vocabularies
  app.get(api.vocabularies.list.path, async (req, res) => {
    const grade = req.query.grade as string | undefined;
    const unit = req.query.unit as string | undefined;
    const vocabs = await storage.getVocabularies(grade, unit);
    res.json(vocabs);
  });

  app.get('/api/metadata/grades-units', async (req, res) => {
    const data = await storage.getUniqueGradesAndUnits();
    res.json(data);
  });

  const isAdmin = async (req: any, res: any, next: any) => {
    const userId = (req.session as any).userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const user = await storage.getUser(userId);
    if (!user?.isAdmin) return res.status(403).json({ message: "Forbidden" });
    next();
  };

  app.post(api.vocabularies.create.path, isAdmin, async (req, res) => {
    try {
      const input = api.vocabularies.create.input.parse(req.body);
      const vocab = await storage.createVocabulary(input);
      res.status(201).json(vocab);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.post(api.vocabularies.bulkCreate.path, isAdmin, async (req, res) => {
    try {
      const input = api.vocabularies.bulkCreate.input.parse(req.body);
      const vocabs = await storage.bulkCreateVocabularies(input);
      res.status(201).json(vocabs);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Leaderboard & Results
  app.get(api.leaderboard.list.path, async (req, res) => {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  });

  app.post(api.results.create.path, async (req, res) => {
    const userId = (req.session as any).userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: Login required to save score" });
    }

    try {
      const input = api.results.create.input.parse(req.body);
      const result = await storage.createResult({
        ...input,
        userId: userId
      });
      res.status(201).json(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  return httpServer;
}
