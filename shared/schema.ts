import { pgTable, text, serial, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  position: text("position").notNull(),
  location: text("location"),
  status: text("status").notNull().default("applied"),
  applicationDate: date("application_date").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  jobUrl: text("job_url"),
  notes: text("notes"),
  department: text("department"),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  lastUpdated: true,
});

export const updateApplicationSchema = createInsertSchema(applications).omit({
  id: true,
}).partial();

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type UpdateApplication = z.infer<typeof updateApplicationSchema>;
export type Application = typeof applications.$inferSelect;

export const APPLICATION_STATUSES = [
  "applied",
  "screening", 
  "interview",
  "offer",
  "rejected",
] as const;

export type ApplicationStatus = typeof APPLICATION_STATUSES[number];
