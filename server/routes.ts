import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth
  setupAuth(app);

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

  app.post(api.vocabularies.create.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(401).json({ message: "Unauthorized: Admin access required" });
    }
    
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

  app.post(api.vocabularies.bulkCreate.path, async (req, res) => {
    if (!req.isAuthenticated() || !req.user?.isAdmin) {
      return res.status(401).json({ message: "Unauthorized: Admin access required" });
    }

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
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized: Login required to save score" });
    }

    try {
      const input = api.results.create.input.parse(req.body);
      const result = await storage.createResult({
        ...input,
        userId: req.user.id
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

  // Current User
  app.get(api.auth.me.path, (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.json(null);
    }
  });

  return httpServer;
}
