import {
  applications,
  users,
  type Application,
  type InsertApplication,
  type UpdateApplication,
  type InsertUser,
  type User,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserGoogleId(userId: number, googleId: string): Promise<void>;
  updateUserPassword(userId: number, password: string): Promise<void>;
  setPasswordResetToken(email: string, token: string, expires: Date): Promise<void>;
  getUserByResetToken(token: string): Promise<User | undefined>;
  
  // Applications CRUD
  createApplication(userId: number, application: InsertApplication): Promise<Application>;
  getApplications(userId: number): Promise<Application[]>;
  getApplication(userId: number, id: number): Promise<Application | undefined>;
  updateApplication(userId: number, id: number, updates: UpdateApplication): Promise<Application | undefined>;
  deleteApplication(userId: number, id: number): Promise<boolean>;
  
  // Statistics
  getApplicationStats(userId: number): Promise<{
    totalApplications: number;
    pendingApplications: number;
    interviewsScheduled: number;
    responseRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async updateUserGoogleId(userId: number, googleId: string): Promise<void> {
    await db.update(users).set({ googleId }).where(eq(users.id, userId));
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  // Applications CRUD
  async getApplication(userId: number, id: number): Promise<Application | undefined> {
    const [application] = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, userId)));
    return application || undefined;
  }

  async createApplication(userId: number, insertApplication: InsertApplication): Promise<Application> {
    const [application] = await db
      .insert(applications)
      .values({ ...insertApplication, userId })
      .returning();
    return application;
  }

  async getApplications(userId: number): Promise<Application[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(applications.lastUpdated);
  }

  async updateApplication(userId: number, id: number, updates: UpdateApplication): Promise<Application | undefined> {
    const [application] = await db
      .update(applications)
      .set({ ...updates, lastUpdated: new Date() })
      .where(and(eq(applications.id, id), eq(applications.userId, userId)))
      .returning();
    return application || undefined;
  }

  async deleteApplication(userId: number, id: number): Promise<boolean> {
    const result = await db
      .delete(applications)
      .where(and(eq(applications.id, id), eq(applications.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getApplicationStats(userId: number): Promise<{
    totalApplications: number;
    pendingApplications: number;
    interviewsScheduled: number;
    responseRate: number;
  }> {
    const allApplications = await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId));
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

  async updateUserPassword(userId: number, password: string): Promise<void> {
    await db
      .update(users)
      .set({ password })
      .where(eq(users.id, userId));
  }

  async setPasswordResetToken(email: string, token: string, expires: Date): Promise<void> {
    await db
      .update(users)
      .set({ 
        resetToken: token,
        resetTokenExpires: expires
      })
      .where(eq(users.email, email));
  }

  async getUserByResetToken(token: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetToken, token));
    return user || undefined;
  }
}

export const storage = new DatabaseStorage();
