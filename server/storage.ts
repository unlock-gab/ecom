import { type User, type InsertUser, type Product, type InsertProduct, type Order, type InsertOrder, type Category, type InsertCategory, DEFAULT_DELIVERY_PRICES } from "@shared/schema";
import { randomUUID, createHash } from "crypto";

export function hashPassword(password: string): string {
  return createHash("sha256").update(password + "nova_store_salt_2026").digest("hex");
}

export interface IStorage {
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;
  getConfirmateurs(): Promise<User[]>;
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  getOrders(): Promise<Order[]>;
  getOrdersByConfirmateur(confirmateurId: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  assignOrder(id: string, confirmateurId: string, confirmateurName: string): Promise<Order | undefined>;
  getSettings(): Promise<Record<string, string>>;
  updateSettings(settings: Record<string, string>): Promise<Record<string, string>>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private categories: Map<string, Category> = new Map();
  private orders: Map<string, Order> = new Map();
  private settings: Record<string, string> = {};

  constructor() {
    this.seed();
  }

  private seed() {
    this.settings = {
      deliveryPrices: JSON.stringify(DEFAULT_DELIVERY_PRICES),
    };

    const adminUser: User = {
      id: "user-admin",
      username: "admin",
      password: hashPassword("admin2026"),
      role: "admin",
      name: "المدير",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    const cats: Category[] = [
      { id: "cat-1", name: "إلكترونيات", slug: "electronics", icon: "Cpu", color: "#6366f1", description: "أحدث الأجهزة الإلكترونية" },
      { id: "cat-2", name: "ملابس", slug: "fashion", icon: "Shirt", color: "#ec4899", description: "أزياء عصرية وأنيقة" },
      { id: "cat-3", name: "كتب", slug: "books", icon: "BookOpen", color: "#f59e0b", description: "كتب في شتى المجالات" },
      { id: "cat-4", name: "رياضة", slug: "sports", icon: "Dumbbell", color: "#10b981", description: "معدات رياضية متنوعة" },
      { id: "cat-5", name: "جمال", slug: "beauty", icon: "Sparkles", color: "#a855f7", description: "منتجات العناية والجمال" },
      { id: "cat-6", name: "منزل", slug: "home", icon: "Home", color: "#f97316", description: "كل ما يلزم منزلك" },
    ];
    cats.forEach(c => this.categories.set(c.id, c));

    const prods: Product[] = [
      { id: "p-1", name: "iPhone 15 Pro Max", description: "أحدث هاتف من آبل بشاشة Super Retina XDR وكاميرا 48 ميغابيكسل ومعالج A17 Pro القوي.", price: "159000", originalPrice: "189000", category: "electronics", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80", images: [], rating: "4.9", reviews: 2847, stock: 50, featured: true, badge: "جديد", tags: ["هواتف"], landingEnabled: true, landingHook: "الهاتف الأقوى في الجزائر بأفضل سعر!", landingBenefits: ["شاشة مذهلة 6.7 بوصة", "كاميرا 48 ميغابيكسل", "بطارية تدوم 29 ساعة"], createdAt: new Date() },
      { id: "p-2", name: "Samsung Galaxy S24 Ultra", description: "هاتف سامسونج الرائد بقلم S Pen مدمج وكاميرا 200 ميغابيكسل.", price: "145000", originalPrice: "175000", category: "electronics", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80", images: [], rating: "4.8", reviews: 1932, stock: 45, featured: true, badge: "الأفضل مبيعاً", tags: ["هواتف"], landingEnabled: false, landingHook: null, landingBenefits: [], createdAt: new Date() },
      { id: "p-3", name: "MacBook Pro M3", description: "حاسوب محمول آبل الأقوى بشريحة M3 Pro، شاشة Liquid Retina XDR 14 بوصة.", price: "289000", originalPrice: "320000", category: "electronics", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80", images: [], rating: "4.9", reviews: 1245, stock: 30, featured: true, badge: "مميز", tags: ["حاسوب"], landingEnabled: false, landingHook: null, landingBenefits: [], createdAt: new Date() },
      { id: "p-4", name: "Sony WH-1000XM5", description: "سماعات لاسلكية احترافية بتقنية إلغاء الضوضاء.", price: "42000", originalPrice: "55000", category: "electronics", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80", images: [], rating: "4.7", reviews: 3421, stock: 80, featured: false, badge: "خصم 24%", tags: ["سماعات"], landingEnabled: false, landingHook: null, landingBenefits: [], createdAt: new Date() },
      { id: "p-5", name: "جاكيت رجالي كلاسيكي", description: "جاكيت رجالي فاخر من الصوف عالي الجودة. تصميم كلاسيكي أنيق.", price: "8500", originalPrice: "12000", category: "fashion", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80", images: [], rating: "4.6", reviews: 432, stock: 60, featured: true, badge: "خصم 29%", tags: ["ملابس"], landingEnabled: false, landingHook: null, landingBenefits: [], createdAt: new Date() },
      { id: "p-6", name: "حذاء رياضي Nike Air Max", description: "حذاء رياضي مريح بتقنية Air Max المتطورة.", price: "18000", originalPrice: "24000", category: "fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80", images: [], rating: "4.8", reviews: 1876, stock: 120, featured: false, badge: null, tags: ["أحذية"], landingEnabled: false, landingHook: null, landingBenefits: [], createdAt: new Date() },
      { id: "p-7", name: "كريم مرطب فاخر", description: "كريم ترطيب وجه من مكونات طبيعية 100%، يمنح بشرتك نضارة وإشراقة.", price: "4500", originalPrice: "6000", category: "beauty", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80", images: [], rating: "4.8", reviews: 892, stock: 150, featured: false, badge: "طبيعي 100%", tags: ["عناية"], landingEnabled: true, landingHook: "بشرة مشرقة في 7 أيام - ضمان مسترد!", landingBenefits: ["مكونات طبيعية 100%", "يناسب جميع أنواع البشرة", "نتائج في أسبوع"], createdAt: new Date() },
      { id: "p-8", name: "حذاء أديداس Ultra Boost", description: "حذاء جري احترافي بتقنية Boost المتطورة.", price: "22000", originalPrice: "28000", category: "sports", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80", images: [], rating: "4.9", reviews: 2134, stock: 75, featured: true, badge: "الأفضل", tags: ["أحذية"], landingEnabled: false, landingHook: null, landingBenefits: [], createdAt: new Date() },
      { id: "p-9", name: "طقم أواني مطبخ غرانيت", description: "طقم أواني مطبخ من الجرانيت عالي الجودة، 8 قطع للطبخ الصحي.", price: "12000", originalPrice: "18000", category: "home", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80", images: [], rating: "4.5", reviews: 445, stock: 60, featured: false, badge: null, tags: ["مطبخ"], landingEnabled: false, landingHook: null, landingBenefits: [], createdAt: new Date() },
      { id: "p-10", name: "Apple Watch Ultra 2", description: "ساعة ذكية متطورة للمغامرين والرياضيين بهيكل تيتانيوم.", price: "95000", originalPrice: "110000", category: "electronics", image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=500&q=80", images: [], rating: "4.8", reviews: 1567, stock: 40, featured: true, badge: "إصدار محدود", tags: ["ساعات"], landingEnabled: false, landingHook: null, landingBenefits: [], createdAt: new Date() },
    ];
    prods.forEach(p => this.products.set(p.id, p));

    const sampleOrders: Order[] = [
      { id: "ord-1", customerName: "أحمد بلقاسم", customerPhone: "0555123456", wilaya: "الجزائر", deliveryType: "home", deliveryPrice: "400", productId: "p-1", productName: "iPhone 15 Pro Max", productImage: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80", quantity: 1, price: "159000", total: "159400", status: "delivered", notes: null, source: "product", assignedTo: null, confirmateurName: null, createdAt: new Date(Date.now() - 86400000 * 3) },
      { id: "ord-2", customerName: "سارة بوزيدي", customerPhone: "0661234567", wilaya: "وهران", deliveryType: "desk", deliveryPrice: "450", productId: "p-7", productName: "كريم مرطب فاخر", productImage: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80", quantity: 2, price: "4500", total: "9450", status: "processing", notes: "التوصيل صباحاً", source: "landing", assignedTo: null, confirmateurName: null, createdAt: new Date(Date.now() - 86400000) },
      { id: "ord-3", customerName: "عمر حمزاوي", customerPhone: "0770111222", wilaya: "قسنطينة", deliveryType: "home", deliveryPrice: "750", productId: "p-8", productName: "حذاء أديداس Ultra Boost", productImage: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80", quantity: 1, price: "22000", total: "22750", status: "shipped", notes: null, source: "product", assignedTo: null, confirmateurName: null, createdAt: new Date(Date.now() - 86400000 * 2) },
    ];
    sampleOrders.forEach(o => this.orders.set(o.id, o));
  }

  async getUserById(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) { return Array.from(this.users.values()).find(u => u.username === username); }

  async createUser(data: InsertUser): Promise<User> {
    const id = `user-${randomUUID()}`;
    const user: User = { ...data, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    if (id === "user-admin") return false;
    return this.users.delete(id);
  }

  async getConfirmateurs(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.role === "confirmateur");
  }

  async getProducts() { return Array.from(this.products.values()).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()); }
  async getProduct(id: string) { return this.products.get(id); }
  async getFeaturedProducts() { return Array.from(this.products.values()).filter(p => p.featured); }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const p: Product = {
      ...product, id, createdAt: new Date(),
      rating: product.rating ?? "4.5", reviews: product.reviews ?? 0,
      stock: product.stock ?? 100, featured: product.featured ?? false,
      badge: product.badge ?? null, tags: product.tags ?? [], images: product.images ?? [],
      originalPrice: product.originalPrice ?? null,
      landingEnabled: product.landingEnabled ?? false,
      landingHook: product.landingHook ?? null,
      landingBenefits: product.landingBenefits ?? [],
    };
    this.products.set(id, p);
    return p;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> { return this.products.delete(id); }

  async getCategories() { return Array.from(this.categories.values()); }
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const c: Category = { ...category, id, description: category.description ?? null };
    this.categories.set(id, c);
    return c;
  }

  async getOrders() { return Array.from(this.orders.values()).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()); }
  async getOrdersByConfirmateur(confirmateurId: string) {
    return Array.from(this.orders.values())
      .filter(o => o.assignedTo === confirmateurId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }
  async getOrder(id: string) { return this.orders.get(id); }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = `ord-${randomUUID()}`;
    const o: Order = {
      ...order, id, createdAt: new Date(),
      status: order.status ?? "pending",
      notes: order.notes ?? null,
      source: order.source ?? "product",
      productImage: order.productImage ?? null,
      quantity: order.quantity ?? 1,
      deliveryType: order.deliveryType ?? "home",
      deliveryPrice: order.deliveryPrice ?? "0",
      assignedTo: order.assignedTo ?? null,
      confirmateurName: order.confirmateurName ?? null,
    };
    this.orders.set(id, o);
    return o;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, status };
    this.orders.set(id, updated);
    return updated;
  }

  async assignOrder(id: string, confirmateurId: string, confirmateurName: string): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, assignedTo: confirmateurId, confirmateurName };
    this.orders.set(id, updated);
    return updated;
  }

  async getSettings() { return this.settings; }
  async updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
    this.settings = { ...this.settings, ...settings };
    return this.settings;
  }
}

export const storage = new MemStorage();
