import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApplicationSchema, updateApplicationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Temporary auth endpoint - returns a demo user
  app.get('/api/auth/user', (req, res) => {
    res.json({
      id: 1,
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      profileImageUrl: null
    });
  });

  // Get application statistics
  app.get("/api/applications/stats", async (req: any, res) => {
    try {
      const userId = 1; // Demo user ID
      const stats = await storage.getApplicationStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get all applications
  app.get("/api/applications", async (req: any, res) => {
    try {
      const userId = 1; // Demo user ID
      const applications = await storage.getApplications(userId);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Get single application
  app.get("/api/applications/:id", async (req: any, res) => {
    try {
      const userId = 1; // Demo user ID
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplication(userId, applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  // Create application
  app.post("/api/applications", async (req: any, res) => {
    try {
      const userId = 1; // Demo user ID
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(userId, validatedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // Update application
  app.patch("/api/applications/:id", async (req: any, res) => {
    try {
      const userId = 1; // Demo user ID
      const applicationId = parseInt(req.params.id);
      const validatedData = updateApplicationSchema.parse(req.body);
      
      const application = await storage.updateApplication(userId, applicationId, validatedData);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Delete application
  app.delete("/api/applications/:id", async (req: any, res) => {
    try {
      const userId = 1; // Demo user ID
      const applicationId = parseInt(req.params.id);
      
      const deleted = await storage.deleteApplication(userId, applicationId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}