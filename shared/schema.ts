import { mysqlTable, text, varchar, decimal, int, boolean, timestamp, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("confirmateur"),
  name: varchar("name", { length: 255 }).notNull().default(""),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  icon: varchar("icon", { length: 255 }).notNull(),
  color: varchar("color", { length: 50 }).notNull(),
  description: text("description"),
});

export const products = mysqlTable("products", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  category: varchar("category", { length: 255 }).notNull(),
  image: text("image").notNull(),
  images: json("images").$type<string[]>(),
  rating: decimal("rating", { precision: 3, scale: 1 }).notNull().default("4.5"),
  reviews: int("reviews").notNull().default(0),
  stock: int("stock").notNull().default(100),
  featured: boolean("featured").notNull().default(false),
  badge: varchar("badge", { length: 255 }),
  tags: json("tags").$type<string[]>(),
  landingEnabled: boolean("landing_enabled").notNull().default(false),
  landingHook: text("landing_hook"),
  landingBenefits: json("landing_benefits").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 255 }).primaryKey(),
  customerName: varchar("customer_name", { length: 255 }).notNull(),
  customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
  wilaya: varchar("wilaya", { length: 255 }).notNull(),
  deliveryType: varchar("delivery_type", { length: 50 }).notNull().default("home"),
  deliveryPrice: decimal("delivery_price", { precision: 10, scale: 2 }).notNull().default("0"),
  productId: varchar("product_id", { length: 255 }).notNull(),
  productName: varchar("product_name", { length: 255 }).notNull(),
  productImage: text("product_image"),
  quantity: int("quantity").notNull().default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"),
  notes: text("notes"),
  source: varchar("source", { length: 50 }).default("product"),
  assignedTo: varchar("assigned_to", { length: 255 }),
  confirmateurName: varchar("confirmateur_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });

export type InsertUser = { username: string; password: string; role: string; name: string };
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type DeliveryPrice = { home: number; desk: number };
export type DeliveryPrices = Record<string, DeliveryPrice>;

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

export const DEFAULT_DELIVERY_PRICES: DeliveryPrices = {
  "أدرار":          { home: 1050, desk: 900 },
  "الشلف":          { home: 750,  desk: 450 },
  "الأغواط":        { home: 850,  desk: 550 },
  "أم البواقي":     { home: 750,  desk: 450 },
  "باتنة":          { home: 750,  desk: 450 },
  "بجاية":          { home: 750,  desk: 450 },
  "بسكرة":          { home: 850,  desk: 550 },
  "بشار":           { home: 850,  desk: 650 },
  "البليدة":        { home: 550,  desk: 400 },
  "البويرة":        { home: 700,  desk: 450 },
  "تمنراست":        { home: 1350, desk: 1050 },
  "تبسة":           { home: 750,  desk: 500 },
  "تلمسان":         { home: 850,  desk: 500 },
  "تيارت":          { home: 750,  desk: 450 },
  "تيزي وزو":       { home: 650,  desk: 450 },
  "الجزائر":        { home: 400,  desk: 300 },
  "الجلفة":         { home: 850,  desk: 500 },
  "جيجل":           { home: 750,  desk: 450 },
  "سطيف":           { home: 750,  desk: 450 },
  "سعيدة":          { home: 750,  desk: 450 },
  "سكيكدة":         { home: 750,  desk: 450 },
  "سيدي بلعباس":   { home: 750,  desk: 450 },
  "عنابة":          { home: 750,  desk: 450 },
  "قالمة":          { home: 750,  desk: 450 },
  "قسنطينة":        { home: 750,  desk: 450 },
  "المدية":         { home: 700,  desk: 450 },
  "مستغانم":        { home: 750,  desk: 450 },
  "المسيلة":        { home: 750,  desk: 500 },
  "معسكر":          { home: 750,  desk: 450 },
  "ورقلة":          { home: 850,  desk: 600 },
  "وهران":          { home: 650,  desk: 450 },
  "البيض":          { home: 900,  desk: 600 },
  "إليزي":          { home: 0,    desk: 0 },
  "برج بوعريريج":   { home: 750,  desk: 450 },
  "بومرداس":        { home: 600,  desk: 450 },
  "الطارف":         { home: 750,  desk: 450 },
  "تندوف":          { home: 0,    desk: 0 },
  "تيسمسيلت":       { home: 800,  desk: 600 },
  "الوادي":         { home: 850,  desk: 600 },
  "خنشلة":          { home: 750,  desk: 450 },
  "سوق أهراس":      { home: 750,  desk: 450 },
  "تيبازة":         { home: 650,  desk: 450 },
  "ميلة":           { home: 750,  desk: 450 },
  "عين الدفلى":     { home: 750,  desk: 450 },
  "النعامة":         { home: 900,  desk: 600 },
  "عين تموشنت":     { home: 750,  desk: 450 },
  "غرداية":         { home: 850,  desk: 550 },
  "غليزان":         { home: 750,  desk: 450 },
  "تيميمون":        { home: 1050, desk: 900 },
  "برج باجي مختار": { home: 0,    desk: 0 },
  "أولاد جلال":     { home: 900,  desk: 550 },
  "بني عباس":       { home: 900,  desk: 900 },
  "إن صالح":        { home: 1350, desk: 0 },
  "إن قزام":        { home: 1350, desk: 0 },
  "تقرت":           { home: 850,  desk: 600 },
  "جانت":           { home: 0,    desk: 0 },
  "المغير":         { home: 850,  desk: 0 },
  "المنيعة":        { home: 900,  desk: 0 },
};
