import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

// Simple in-memory storage for now
const users: Map<string, any> = new Map();
const sessions: Map<string, any> = new Map();

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupSimpleAuth(app: Express) {
  app.use(session({
    secret: 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  }));

  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      
      if (users.has(username)) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = {
        id: users.size + 1,
        username,
        email,
        firstName,
        lastName,
        password: await hashPassword(password),
      };

      users.set(username, user);
      
      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      const user = users.get(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).user = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      res.status(200).json({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/user", (req, res) => {
    const user = (req.session as any)?.user;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  const user = (req.session as any)?.user;
  if (user) {
    req.user = user;
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

// Simple in-memory storage for applications
const applications: Map<number, any[]> = new Map();

export const simpleStorage = {
  async createApplication(userId: number, application: any) {
    const userApps = applications.get(userId) || [];
    const newApp = {
      id: userApps.length + 1,
      userId,
      ...application,
      lastUpdated: new Date(),
    };
    userApps.push(newApp);
    applications.set(userId, userApps);
    return newApp;
  },

  async getApplications(userId: number) {
    return applications.get(userId) || [];
  },

  async getApplication(userId: number, id: number) {
    const userApps = applications.get(userId) || [];
    return userApps.find(app => app.id === id);
  },

  async updateApplication(userId: number, id: number, updates: any) {
    const userApps = applications.get(userId) || [];
    const appIndex = userApps.findIndex(app => app.id === id);
    if (appIndex === -1) return null;
    
    userApps[appIndex] = { ...userApps[appIndex], ...updates, lastUpdated: new Date() };
    applications.set(userId, userApps);
    return userApps[appIndex];
  },

  async deleteApplication(userId: number, id: number) {
    const userApps = applications.get(userId) || [];
    const newApps = userApps.filter(app => app.id !== id);
    applications.set(userId, newApps);
    return newApps.length < userApps.length;
  },

  async getApplicationStats(userId: number) {
    const userApps = applications.get(userId) || [];
    const total = userApps.length;
    const pending = userApps.filter(app => app.status === "applied").length;
    const interviews = userApps.filter(app => app.status === "interview").length;
    const responded = userApps.filter(app => app.status !== "applied").length;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    return {
      totalApplications: total,
      pendingApplications: pending,
      interviewsScheduled: interviews,
      responseRate,
    };
  },
};