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
  updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined>;
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
      { id: "cat-1", name: "بروتين وأمينو", slug: "protein", icon: "Dumbbell", color: "#10b981", description: "بروتين واي، كازيين، BCAA" },
      { id: "cat-2", name: "فيتامينات ومعادن", slug: "vitamins", icon: "Sparkles", color: "#f59e0b", description: "فيتامينات ومعادن يومية" },
      { id: "cat-3", name: "تخسيس وحرق الدهون", slug: "weightloss", icon: "Flame", color: "#ef4444", description: "مكملات الحرق والتخسيس" },
      { id: "cat-4", name: "طاقة وأداء", slug: "energy", icon: "Zap", color: "#8b5cf6", description: "Pre-workout وطاقة رياضية" },
      { id: "cat-5", name: "صحة عامة", slug: "health", icon: "Heart", color: "#ec4899", description: "كولاجين، أوميغا-3، صحة يومية" },
    ];
    cats.forEach(c => this.categories.set(c.id, c));

    const prods: Product[] = [
      {
        id: "p-1",
        name: "Whey Protein Gold Standard",
        description: "بروتين واي ذهبي المعيار 100%، 24 غرام بروتين لكل حصة. بنكهة الشوكولاتة الفاخرة. الخيار الأول للرياضيين في الجزائر.",
        price: "7800", originalPrice: "9500", category: "protein",
        image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&q=80",
        images: [], rating: "4.9", reviews: 3241, stock: 80, featured: true, badge: "الأكثر مبيعاً",
        tags: ["بروتين", "واي"], landingEnabled: true,
        landingHook: "24 غرام بروتين لكل حصة - النتائج تظهر في 30 يوماً!",
        landingBenefits: ["24g بروتين لكل حصة", "يسرّع الاستشفاء العضلي", "بدون سكر مضاف", "مذاق رائع بالشوكولاتة"],
        createdAt: new Date(),
      },
      {
        id: "p-2",
        name: "BCAA Amino 8:1:1",
        description: "أحماض أمينية متفرعة السلسلة بنسبة 8:1:1، تحمي العضلات وتمنع الهدم العضلي خلال التمرين الشديد.",
        price: "4200", originalPrice: "5500", category: "protein",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
        images: [], rating: "4.7", reviews: 1876, stock: 100, featured: true, badge: "جديد",
        tags: ["أمينو", "BCAA"], landingEnabled: false, landingHook: null, landingBenefits: [],
        createdAt: new Date(),
      },
      {
        id: "p-3",
        name: "Creatine Monohydrate Pure",
        description: "كرياتين أحادي الهيدرات النقي 100%، يزيد القوة والأداء الرياضي. مُجرَّب علمياً لزيادة الكتلة العضلية.",
        price: "3500", originalPrice: "4500", category: "protein",
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&q=80",
        images: [], rating: "4.8", reviews: 2100, stock: 120, featured: true, badge: "الأفضل",
        tags: ["كرياتين"], landingEnabled: false, landingHook: null, landingBenefits: [],
        createdAt: new Date(),
      },
      {
        id: "p-4",
        name: "Omega-3 Fish Oil 1000mg",
        description: "زيت السمك الطبيعي 1000 ملغ EPA وDHA، يدعم صحة القلب والمفاصل ويقلل الالتهابات.",
        price: "2800", originalPrice: "3800", category: "health",
        image: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&q=80",
        images: [], rating: "4.6", reviews: 1543, stock: 200, featured: true, badge: "خصم 26%",
        tags: ["أوميغا", "صحة"], landingEnabled: true,
        landingHook: "قلب أقوى، مفاصل أصح - أوميغا-3 يومياً!",
        landingBenefits: ["يحمي صحة القلب", "يقلل الالتهابات", "يدعم صحة المخ والمفاصل", "مصدر طبيعي 100%"],
        createdAt: new Date(),
      },
      {
        id: "p-5",
        name: "Collagen Peptides Premium",
        description: "كولاجين ببتيد متميز لصحة البشرة والمفاصل والعظام. مستخلص بالتحلل المائي لأقصى امتصاص.",
        price: "5200", originalPrice: "7000", category: "health",
        image: "https://images.unsplash.com/photo-1556228852-6d35a585d566?w=500&q=80",
        images: [], rating: "4.8", reviews: 987, stock: 90, featured: true, badge: "طبيعي",
        tags: ["كولاجين", "بشرة"], landingEnabled: false, landingHook: null, landingBenefits: [],
        createdAt: new Date(),
      },
      {
        id: "p-6",
        name: "Multivitamin Complex Daily",
        description: "مجمع فيتامينات يومي شامل يحتوي على 25 فيتامين ومعدن أساسي. يدعم الطاقة والمناعة والصحة العامة.",
        price: "2500", originalPrice: "3200", category: "vitamins",
        image: "https://images.unsplash.com/photo-1607619662634-3ac55ec0e216?w=500&q=80",
        images: [], rating: "4.7", reviews: 2876, stock: 300, featured: true, badge: "الأفضل مبيعاً",
        tags: ["فيتامينات", "يومي"], landingEnabled: false, landingHook: null, landingBenefits: [],
        createdAt: new Date(),
      },
      {
        id: "p-7",
        name: "Vitamin D3 + K2 5000IU",
        description: "فيتامين D3 مع K2 لأقصى امتصاص للكالسيوم. ضروري لصحة العظام والمناعة وتقليل الاكتئاب.",
        price: "1900", originalPrice: "2600", category: "vitamins",
        image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&q=80",
        images: [], rating: "4.9", reviews: 1234, stock: 250, featured: false, badge: "ضروري",
        tags: ["فيتامين د", "K2"], landingEnabled: false, landingHook: null, landingBenefits: [],
        createdAt: new Date(),
      },
      {
        id: "p-8",
        name: "Fat Burner Thermogenic Pro",
        description: "حارق دهون ثيرموجيني قوي بمزيج طبيعي من الكافيين الأخضر والتيروزين والفلفل الحار. يسرّع الحرق ويزيد الطاقة.",
        price: "4800", originalPrice: "6500", category: "weightloss",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80",
        images: [], rating: "4.5", reviews: 765, stock: 60, featured: true, badge: "قوي",
        tags: ["تخسيس", "حرق"], landingEnabled: true,
        landingHook: "احرق الدهون الزائدة في 4 أسابيع - مضمون أو مسترد!",
        landingBenefits: ["يسرّع الأيض بـ 30%", "يقمع الشهية الزائدة", "طاقة طوال اليوم", "مكونات طبيعية 100%"],
        createdAt: new Date(),
      },
      {
        id: "p-9",
        name: "Pre-Workout Explosive Power",
        description: "ما قبل التمرين المتفجر بجرعة تتيلة من الكافيين، البيتا-ألانين، والسيترولين. أداء لا يُقهر في كل تمرين.",
        price: "5500", originalPrice: "7200", category: "energy",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80",
        images: [], rating: "4.6", reviews: 543, stock: 70, featured: false, badge: "جديد",
        tags: ["طاقة", "pre-workout"], landingEnabled: false, landingHook: null, landingBenefits: [],
        createdAt: new Date(),
      },
      {
        id: "p-10",
        name: "Zinc + Magnesium ZMA Night",
        description: "تركيبة ZMA الليلية لتحسين جودة النوم، التعافي العضلي، ورفع مستوى التستوستيرون الطبيعي.",
        price: "2200", originalPrice: "3000", category: "vitamins",
        image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&q=80",
        images: [], rating: "4.7", reviews: 892, stock: 180, featured: false, badge: "نوم أفضل",
        tags: ["زنك", "مغنيسيوم"], landingEnabled: false, landingHook: null, landingBenefits: [],
        createdAt: new Date(),
      },
      {
        id: "p-11",
        name: "Mass Gainer 3000",
        description: "جينر ضخم لزيادة الوزن والكتلة العضلية. 1250 سعرة حرارية لكل حصة مع 50 غرام بروتين. للنحفاء الراغبين في الضخامة.",
        price: "8500", originalPrice: "11000", category: "protein",
        image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&q=80",
        images: [], rating: "4.5", reviews: 432, stock: 50, featured: false, badge: "ضخامة",
        tags: ["جينر", "وزن"], landingEnabled: false, landingHook: null, landingBenefits: [],
        createdAt: new Date(),
      },
      {
        id: "p-12",
        name: "L-Carnitine Liquid 3000mg",
        description: "كارنيتين سائل 3000 ملغ لنقل الدهون إلى الطاقة. مثالي مع التمرين الهوائي لأقصى حرق للدهون.",
        price: "3200", originalPrice: "4200", category: "weightloss",
        image: "https://images.unsplash.com/photo-1544991875-5dc1b05f1571?w=500&q=80",
        images: [], rating: "4.6", reviews: 678, stock: 90, featured: true, badge: "حرق فعّال",
        tags: ["كارنيتين", "تخسيس"], landingEnabled: false, landingHook: null, landingBenefits: [],
        createdAt: new Date(),
      },
    ];
    prods.forEach(p => this.products.set(p.id, p));

    const sampleOrders: Order[] = [
      {
        id: "ord-1", customerName: "أحمد بلقاسم", customerPhone: "0555123456",
        wilaya: "الجزائر", deliveryType: "home", deliveryPrice: "400",
        productId: "p-1", productName: "Whey Protein Gold Standard",
        productImage: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=500&q=80",
        quantity: 1, price: "7800", total: "8200", status: "delivered",
        notes: null, source: "product", assignedTo: null, confirmateurName: null,
        createdAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        id: "ord-2", customerName: "سارة بوزيدي", customerPhone: "0661234567",
        wilaya: "وهران", deliveryType: "desk", deliveryPrice: "450",
        productId: "p-4", productName: "Omega-3 Fish Oil 1000mg",
        productImage: "https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&q=80",
        quantity: 2, price: "2800", total: "6050", status: "processing",
        notes: "التوصيل صباحاً", source: "landing", assignedTo: null, confirmateurName: null,
        createdAt: new Date(Date.now() - 86400000),
      },
      {
        id: "ord-3", customerName: "عمر حمزاوي", customerPhone: "0770111222",
        wilaya: "قسنطينة", deliveryType: "home", deliveryPrice: "750",
        productId: "p-8", productName: "Fat Burner Thermogenic Pro",
        productImage: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80",
        quantity: 1, price: "4800", total: "5550", status: "shipped",
        notes: null, source: "landing", assignedTo: null, confirmateurName: null,
        createdAt: new Date(Date.now() - 86400000 * 2),
      },
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

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...updates, id: existing.id };
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
