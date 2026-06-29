import {
  pgTable,
  pgEnum,
  serial,
  integer,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// --- Tasks ---

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 50 }).default("todo").notNull(),
  priority: varchar("priority", { length: 50 }).default("medium").notNull(),
  userId: varchar("userId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// --- Beat For Love Tickets ---

export const ticketOrders = pgTable("ticket_orders", {
  id: serial("id").primaryKey(),
  buyerName: varchar("buyer_name", { length: 255 }).notNull(),
  buyerEmail: varchar("buyer_email", { length: 320 }),
  buyerPhone: varchar("buyer_phone", { length: 50 }),
  quantity: integer("quantity").notNull(),
  totalPrice: integer("total_price").notNull(),
  variableSymbol: varchar("variable_symbol", { length: 20 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).default("6256013013/0800").notNull(),
  status: varchar("status", { length: 50 }).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TicketOrder = typeof ticketOrders.$inferSelect;
export type InsertTicketOrder = typeof ticketOrders.$inferInsert;
