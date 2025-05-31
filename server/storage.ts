import { applications, type Application, type InsertApplication, type UpdateApplication } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private applications: Map<number, Application>;
  private currentId: number;

  constructor() {
    this.applications = new Map();
    this.currentId = 1;
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const id = this.currentId++;
    const application: Application = {
      id,
      companyName: insertApplication.companyName,
      position: insertApplication.position,
      location: insertApplication.location || null,
      status: insertApplication.status || "applied",
      applicationDate: insertApplication.applicationDate,
      lastUpdated: new Date(),
      jobUrl: insertApplication.jobUrl || null,
      notes: insertApplication.notes || null,
      department: insertApplication.department || null,
    };
    this.applications.set(id, application);
    return application;
  }

  async getApplications(): Promise<Application[]> {
    return Array.from(this.applications.values()).sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  async getApplication(id: number): Promise<Application | undefined> {
    return this.applications.get(id);
  }

  async updateApplication(id: number, updates: UpdateApplication): Promise<Application | undefined> {
    const existing = this.applications.get(id);
    if (!existing) return undefined;

    const updated: Application = {
      ...existing,
      ...updates,
      lastUpdated: new Date(),
    };
    this.applications.set(id, updated);
    return updated;
  }

  async deleteApplication(id: number): Promise<boolean> {
    return this.applications.delete(id);
  }

  async getApplicationStats(): Promise<{
    totalApplications: number;
    pendingApplications: number;
    interviewsScheduled: number;
    responseRate: number;
  }> {
    const allApplications = Array.from(this.applications.values());
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

export const storage = new MemStorage();
