import { applications, type Application, type InsertApplication, type UpdateApplication } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Applications CRUD
  createApplication(application: InsertApplication): Promise<Application>;
  getApplications(): Promise<Application[]>;
  getApplication(id: number): Promise<Application | undefined>;
  updateApplication(id: number, updates: UpdateApplication): Promise<Application | undefined>;
  deleteApplication(id: number): Promise<boolean>;
  
  // Statistics
  getApplicationStats(): Promise<{
    totalApplications: number;
    pendingApplications: number;
    interviewsScheduled: number;
    responseRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getApplication(id: number): Promise<Application | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application || undefined;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values(insertApplication)
      .returning();
    return application;
  }

  async getApplications(): Promise<Application[]> {
    return await db.select().from(applications).orderBy(applications.lastUpdated);
  }

  async updateApplication(id: number, updates: UpdateApplication): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return application || undefined;
  }

  async deleteApplication(id: number): Promise<boolean> {
    const result = await db.delete(applications).where(eq(applications.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getApplicationStats(): Promise<{
    totalApplications: number;
    pendingApplications: number;
    interviewsScheduled: number;
    responseRate: number;
  }> {
    const allApplications = await db.select().from(applications);
    const total = allApplications.length;
    const pending = allApplications.filter(app => app.status === "applied").length;
    const interviews = allApplications.filter(app => app.status === "interview").length;
    const responded = allApplications.filter(app => 
      app.status !== "applied"
    ).length;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    return {
      totalApplications: total,
      pendingApplications: pending,
      interviewsScheduled: interviews,
      responseRate,
    };
  }
}

export const storage = new DatabaseStorage();
