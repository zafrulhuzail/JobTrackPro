import { pgTable, text, serial, date, timestamp, varchar, jsonb, index, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username").unique(),
  email: varchar("email").unique(),
  password: varchar("password"),
  googleId: varchar("google_id").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
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
  userId: true,
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
