import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertApplicationSchema, updateApplicationSchema } from "@shared/schema";
import { z } from "zod";
import { sendEmail, createApplicationReminderEmail, createInterviewReminderEmail, createWeeklySummaryEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get application statistics
  app.get("/api/applications/stats", async (req, res) => {
    try {
      const stats = await storage.getApplicationStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get all applications
  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  // Get application by ID
  app.get("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid application ID" });
      }

      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  // Create new application
  app.post("/api/applications", async (req, res) => {
    try {
      const validatedData = insertApplicationSchema.parse(req.body);
      const application = await storage.createApplication(validatedData);
      res.status(201).json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid application data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  // Update application
  app.patch("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid application ID" });
      }

      const validatedData = updateApplicationSchema.parse(req.body);
      const application = await storage.updateApplication(id, validatedData);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json(application);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid application data",
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Delete application
  app.delete("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid application ID" });
      }

      const deleted = await storage.deleteApplication(id);
      if (!deleted) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // Email endpoints
  const emailSchema = z.object({
    to: z.string().email(),
    from: z.string().email(),
  });

  // Send application reminder email
  app.post("/api/emails/reminder/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { to, from } = emailSchema.parse(req.body);
      
      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const daysSince = Math.floor((Date.now() - new Date(application.applicationDate).getTime()) / (1000 * 60 * 60 * 24));
      const emailContent = createApplicationReminderEmail(application.companyName, application.position, daysSince);
      
      const success = await sendEmail({
        to,
        from,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      if (success) {
        res.json({ message: "Reminder email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send reminder email" });
    }
  });

  // Send interview reminder email
  app.post("/api/emails/interview/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { to, from } = emailSchema.parse(req.body);
      
      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      const emailContent = createInterviewReminderEmail(application.companyName, application.position);
      
      const success = await sendEmail({
        to,
        from,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      if (success) {
        res.json({ message: "Interview reminder sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send interview reminder" });
    }
  });

  // Send weekly summary email
  app.post("/api/emails/summary", async (req, res) => {
    try {
      const { to, from } = emailSchema.parse(req.body);
      
      const [stats, applications] = await Promise.all([
        storage.getApplicationStats(),
        storage.getApplications()
      ]);

      const recentApplications = applications.slice(0, 5).map(app => ({
        companyName: app.companyName,
        position: app.position,
        status: app.status
      }));

      const emailContent = createWeeklySummaryEmail(stats, recentApplications);
      
      const success = await sendEmail({
        to,
        from,
        subject: emailContent.subject,
        text: emailContent.text,
        html: emailContent.html,
      });

      if (success) {
        res.json({ message: "Weekly summary sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid email data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send weekly summary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
