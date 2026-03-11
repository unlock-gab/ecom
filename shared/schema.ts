import { pgTable, text, varchar, numeric, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  description: text("description"),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  image: text("image").notNull(),
  images: text("images").array(),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("4.5"),
  reviews: integer("reviews").notNull().default(0),
  stock: integer("stock").notNull().default(100),
  featured: boolean("featured").notNull().default(false),
  badge: text("badge"),
  tags: text("tags").array(),
  landingEnabled: boolean("landing_enabled").notNull().default(false),
  landingHook: text("landing_hook"),
  landingBenefits: text("landing_benefits").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  wilaya: text("wilaya").notNull(),
  productId: text("product_id").notNull(),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  source: text("source").default("product"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

export type InsertUser = { username: string; password: string };
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export const ALGERIAN_WILAYAS = [
  "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة",
  "بشار", "البليدة", "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت",
  "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", "سعيدة", "سكيكدة",
  "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم",
  "المسيلة", "معسكر", "ورقلة", "وهران", "البيض", "إليزي", "برج بوعريريج",
  "بومرداس", "الطارف", "تندوف", "تيسمسيلت", "الوادي", "خنشلة", "سوق أهراس",
  "تيبازة", "ميلة", "عين الدفلى", "النعامة", "عين تموشنت", "غرداية", "غليزان",
  "تيميمون", "برج باجي مختار", "أولاد جلال", "بني عباس", "إن صالح",
  "إن قزام", "تقرت", "جانت", "المغير", "المنيعة",
];
