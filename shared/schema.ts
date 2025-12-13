import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;

export const sweets = pgTable("sweets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  description: text("description").notNull(),
  image: text("image").notNull(),
});

export const insertSweetSchema = createInsertSchema(sweets).omit({
  id: true,
});

export const updateSweetSchema = insertSweetSchema.partial();

export const purchaseSchema = z.object({
  quantity: z.number().int().positive(),
});

export const restockSchema = z.object({
  quantity: z.number().int().positive(),
});

export const searchSweetsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

export type InsertSweet = z.infer<typeof insertSweetSchema>;
export type Sweet = typeof sweets.$inferSelect;
export type UpdateSweet = z.infer<typeof updateSweetSchema>;
export type PurchaseInput = z.infer<typeof purchaseSchema>;
export type RestockInput = z.infer<typeof restockSchema>;
export type SearchSweetsInput = z.infer<typeof searchSweetsSchema>;
