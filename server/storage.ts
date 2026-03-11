import { type User, type InsertUser, type Product, type InsertProduct, type Order, type InsertOrder, type Category, type InsertCategory } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getFeaturedProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private categories: Map<string, Category> = new Map();
  private orders: Map<string, Order> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
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
      {
        id: "p-1", name: "iPhone 15 Pro Max", description: "أحدث هاتف من آبل بشاشة Super Retina XDR وكاميرا 48 ميغابيكسل ومعالج A17 Pro القوي. تصميم تيتانيوم رائع وبطارية تدوم طويلاً.", price: "4999", originalPrice: "5999", category: "electronics", image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80", images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80"], rating: "4.9", reviews: 2847, stock: 50, featured: true, badge: "جديد", tags: ["هواتف", "آبل"], createdAt: new Date(),
      },
      {
        id: "p-2", name: "Samsung Galaxy S24 Ultra", description: "هاتف سامسونج الرائد بقلم S Pen مدمج وكاميرا 200 ميغابيكسل وشاشة Dynamic AMOLED 2X مذهلة.", price: "4599", originalPrice: "5499", category: "electronics", image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&q=80", images: [], rating: "4.8", reviews: 1932, stock: 45, featured: true, badge: "الأفضل مبيعاً", tags: ["هواتف", "سامسونج"], createdAt: new Date(),
      },
      {
        id: "p-3", name: "MacBook Pro M3", description: "حاسوب محمول آبل الأقوى بشريحة M3 Pro، شاشة Liquid Retina XDR 14 بوصة وأداء استثنائي للمحترفين.", price: "8999", originalPrice: "9999", category: "electronics", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80", images: [], rating: "4.9", reviews: 1245, stock: 30, featured: true, badge: "مميز", tags: ["حاسوب", "آبل"], createdAt: new Date(),
      },
      {
        id: "p-4", name: "Sony WH-1000XM5", description: "سماعات لاسلكية احترافية بتقنية إلغاء الضوضاء الرائدة في الصناعة وجودة صوت لا مثيل لها.", price: "1299", originalPrice: "1699", category: "electronics", image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=500&q=80", images: [], rating: "4.7", reviews: 3421, stock: 80, featured: false, badge: "خصم 24%", tags: ["سماعات", "سوني"], createdAt: new Date(),
      },
      {
        id: "p-5", name: "iPad Pro 12.9\"", description: "جهاز iPad Pro بشاشة Liquid Retina XDR وشريحة M2 وتصميم رفيع أنيق. مثالي للإبداع والإنتاجية.", price: "3999", originalPrice: "4499", category: "electronics", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80", images: [], rating: "4.8", reviews: 987, stock: 35, featured: false, badge: null, tags: ["آيباد", "آبل"], createdAt: new Date(),
      },
      {
        id: "p-6", name: "جاكيت رجالي كلاسيكي", description: "جاكيت رجالي فاخر من الصوف الإيطالي عالي الجودة. تصميم كلاسيكي أنيق مناسب للمناسبات الرسمية وبيئة العمل.", price: "599", originalPrice: "899", category: "fashion", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&q=80", images: [], rating: "4.6", reviews: 432, stock: 60, featured: true, badge: "خصم 33%", tags: ["ملابس", "رجالي"], createdAt: new Date(),
      },
      {
        id: "p-7", name: "فستان سهرة نسائي", description: "فستان سهرة أنيق من الساتان الفاخر. تصميم راقٍ يناسب المناسبات الخاصة والحفلات.", price: "449", originalPrice: "699", category: "fashion", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&q=80", images: [], rating: "4.7", reviews: 287, stock: 40, featured: false, badge: "محدود", tags: ["ملابس", "نسائي"], createdAt: new Date(),
      },
      {
        id: "p-8", name: "حذاء رياضي Nike Air Max", description: "حذاء رياضي مريح بتقنية Air Max المتطورة لأقصى قدر من الراحة والأداء خلال التمارين.", price: "699", originalPrice: "899", category: "fashion", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80", images: [], rating: "4.8", reviews: 1876, stock: 120, featured: false, badge: null, tags: ["أحذية", "نايكي"], createdAt: new Date(),
      },
      {
        id: "p-9", name: "ذكاء اصطناعي: دليل المبتدئين", description: "كتاب شامل يشرح أساسيات الذكاء الاصطناعي وتطبيقاته العملية بأسلوب سلس ومبسط.", price: "89", originalPrice: "129", category: "books", image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500&q=80", images: [], rating: "4.5", reviews: 654, stock: 200, featured: false, badge: null, tags: ["كتب", "تقنية"], createdAt: new Date(),
      },
      {
        id: "p-10", name: "جهاز ضغط دم ذكي", description: "جهاز قياس ضغط الدم المنزلي الذكي مع اتصال Bluetooth وتطبيق لمتابعة الصحة.", price: "299", originalPrice: "399", category: "sports", image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&q=80", images: [], rating: "4.6", reviews: 543, stock: 90, featured: false, badge: null, tags: ["صحة", "رياضة"], createdAt: new Date(),
      },
      {
        id: "p-11", name: "حقيبة يد نسائية فاخرة", description: "حقيبة يد من الجلد الطبيعي عالي الجودة بتصميم عصري وأنيق. مثالية للاستخدام اليومي.", price: "799", originalPrice: "1099", category: "fashion", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&q=80", images: [], rating: "4.7", reviews: 321, stock: 55, featured: true, badge: "مميز", tags: ["حقائب", "نسائي"], createdAt: new Date(),
      },
      {
        id: "p-12", name: "كريم مرطب فاخر", description: "كريم ترطيب وجه من مكونات طبيعية 100%، يمنح بشرتك نضارة وإشراقة طوال اليوم.", price: "189", originalPrice: "249", category: "beauty", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80", images: [], rating: "4.8", reviews: 892, stock: 150, featured: false, badge: "طبيعي 100%", tags: ["عناية", "وجه"], createdAt: new Date(),
      },
      {
        id: "p-13", name: "حذاء أديداس Ultra Boost", description: "حذاء جري احترافي بتقنية Boost المتطورة لتوفير أقصى قدر من الطاقة والارتداد في كل خطوة.", price: "849", originalPrice: "999", category: "sports", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80", images: [], rating: "4.9", reviews: 2134, stock: 75, featured: true, badge: "الأفضل", tags: ["أحذية", "أديداس"], createdAt: new Date(),
      },
      {
        id: "p-14", name: "طقم أواني مطبخ غرانيت", description: "طقم أواني مطبخ من الجرانيت عالي الجودة مع طلاء غير لاصق، 8 قطع للطبخ الصحي.", price: "499", originalPrice: "699", category: "home", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80", images: [], rating: "4.5", reviews: 445, stock: 60, featured: false, badge: null, tags: ["مطبخ", "منزل"], createdAt: new Date(),
      },
      {
        id: "p-15", name: "Apple Watch Ultra 2", description: "ساعة ذكية متطورة للمغامرين والرياضيين بهيكل تيتانيوم وبطارية تدوم 60 ساعة.", price: "2999", originalPrice: "3499", category: "electronics", image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=500&q=80", images: [], rating: "4.8", reviews: 1567, stock: 40, featured: true, badge: "إصدار محدود", tags: ["ساعات", "آبل"], createdAt: new Date(),
      },
      {
        id: "p-16", name: "عطر رجالي فاخر Dior Sauvage", description: "عطر ديور سوفاج الأيقوني بمزيج رائع من الخشب والتوابل والمسك. مناسب لجميع المناسبات.", price: "599", originalPrice: "799", category: "beauty", image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&q=80", images: [], rating: "4.9", reviews: 3241, stock: 100, featured: false, badge: "الأكثر مبيعاً", tags: ["عطور", "ديور"], createdAt: new Date(),
      },
    ];
    prods.forEach(p => this.products.set(p.id, p));

    const sampleOrders: Order[] = [
      {
        id: "ord-1", customerName: "أحمد محمد", customerEmail: "ahmed@example.com", customerPhone: "0501234567", customerAddress: "شارع الملك فهد، حي العليا", customerCity: "الرياض", items: [{ productId: "p-1", name: "iPhone 15 Pro Max", price: 4999, image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80", quantity: 1 }], subtotal: "4999", shipping: "0", total: "4999", status: "delivered", paymentMethod: "cod", notes: null, createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        id: "ord-2", customerName: "سارة علي", customerEmail: "sara@example.com", customerPhone: "0557654321", customerAddress: "شارع التحلية، حي الروضة", customerCity: "جدة", items: [{ productId: "p-12", name: "كريم مرطب فاخر", price: 189, image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&q=80", quantity: 2 }, { productId: "p-16", name: "عطر رجالي فاخر Dior Sauvage", price: 599, image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&q=80", quantity: 1 }], subtotal: "977", shipping: "30", total: "1007", status: "processing", paymentMethod: "card", notes: "التوصيل في الصباح", createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: "ord-3", customerName: "عمر خالد", customerEmail: "omar@example.com", customerPhone: "0521111222", customerAddress: "حي المنصورة", customerCity: "الدمام", items: [{ productId: "p-13", name: "حذاء أديداس Ultra Boost", price: 849, image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80", quantity: 1 }], subtotal: "849", shipping: "30", total: "879", status: "shipped", paymentMethod: "cod", notes: null, createdAt: new Date(Date.now() - 86400000 * 2),
      },
    ];
    sampleOrders.forEach(o => this.orders.set(o.id, o));
  }

  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) { return Array.from(this.users.values()).find(u => u.username === username); }
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getProducts() { return Array.from(this.products.values()).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()); }
  async getProduct(id: string) { return this.products.get(id); }
  async getFeaturedProducts() { return Array.from(this.products.values()).filter(p => p.featured); }
  async getProductsByCategory(category: string) { return Array.from(this.products.values()).filter(p => p.category === category); }
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const p: Product = { ...product, id, createdAt: new Date(), rating: product.rating ?? "4.5", reviews: product.reviews ?? 0, stock: product.stock ?? 100, featured: product.featured ?? false, badge: product.badge ?? null, tags: product.tags ?? [], images: product.images ?? [], originalPrice: product.originalPrice ?? null };
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
  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async getCategories() { return Array.from(this.categories.values()); }
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const c: Category = { ...category, id, description: category.description ?? null };
    this.categories.set(id, c);
    return c;
  }

  async getOrders() { return Array.from(this.orders.values()).sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()); }
  async getOrder(id: string) { return this.orders.get(id); }
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = `ord-${randomUUID()}`;
    const o: Order = { ...order, id, createdAt: new Date(), status: order.status ?? "pending", paymentMethod: order.paymentMethod ?? "cod", notes: order.notes ?? null, customerPhone: order.customerPhone ?? null };
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
}

export const storage = new MemStorage();
