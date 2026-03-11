import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage, hashPassword } from "./storage";
import { insertProductSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) return res.status(401).json({ message: "غير مصرح" });
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId || req.session.role !== "admin") return res.status(403).json({ message: "ممنوع - أدمن فقط" });
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "اسم المستخدم وكلمة المرور مطلوبان" });
    const user = await storage.getUserByUsername(username);
    if (!user || user.password !== hashPassword(password)) {
      return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
    }
    req.session.userId = user.id;
    req.session.role = user.role as "admin" | "confirmateur";
    req.session.username = user.username;
    req.session.name = user.name;
    res.json({ id: user.id, username: user.username, role: user.role, name: user.name });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {});
    res.json({ message: "تم تسجيل الخروج" });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ message: "غير مسجل" });
    const user = await storage.getUserById(req.session.userId);
    if (!user) return res.status(401).json({ message: "المستخدم غير موجود" });
    res.json({ id: user.id, username: user.username, role: user.role, name: user.name });
  });

  app.get("/api/confirmateurs", requireAdmin, async (req, res) => {
    const confirmateurs = await storage.getConfirmateurs();
    res.json(confirmateurs.map(u => ({ id: u.id, username: u.username, name: u.name, role: u.role, createdAt: u.createdAt })));
  });

  app.post("/api/confirmateurs", requireAdmin, async (req, res) => {
    const schema = z.object({ username: z.string().min(3), password: z.string().min(4), name: z.string().min(2) });
    try {
      const data = schema.parse(req.body);
      const existing = await storage.getUserByUsername(data.username);
      if (existing) return res.status(400).json({ message: "اسم المستخدم موجود بالفعل" });
      const user = await storage.createUser({ username: data.username, password: hashPassword(data.password), role: "confirmateur", name: data.name });
      res.status(201).json({ id: user.id, username: user.username, name: user.name, role: user.role });
    } catch (e) {
      res.status(400).json({ message: "بيانات غير صحيحة", error: e });
    }
  });

  app.patch("/api/confirmateurs/:id", requireAdmin, async (req, res) => {
    const { name, password } = req.body;
    const updates: any = {};
    if (name) updates.name = name;
    if (password) updates.password = hashPassword(password);
    const user = await storage.updateUser(req.params.id, updates);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });
    res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
  });

  app.delete("/api/confirmateurs/:id", requireAdmin, async (req, res) => {
    const success = await storage.deleteUser(req.params.id);
    if (!success) return res.status(404).json({ message: "المستخدم غير موجود أو لا يمكن حذفه" });
    res.json({ message: "تم الحذف" });
  });

  app.get("/api/products", async (req, res) => {
    const { category, featured, search } = req.query;
    let products = await storage.getProducts();
    if (featured === "true") products = products.filter(p => p.featured);
    if (category && category !== "all") products = products.filter(p => p.category === category);
    if (search) {
      const q = (search as string).toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    res.json(products);
  });

  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(req.params.id);
    if (!product) return res.status(404).json({ message: "المنتج غير موجود" });
    res.json(product);
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (e) {
      res.status(400).json({ message: "بيانات غير صحيحة", error: e });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    const product = await storage.updateProduct(req.params.id, req.body);
    if (!product) return res.status(404).json({ message: "المنتج غير موجود" });
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    const success = await storage.deleteProduct(req.params.id);
    if (!success) return res.status(404).json({ message: "المنتج غير موجود" });
    res.json({ message: "تم الحذف بنجاح" });
  });

  app.get("/api/categories", async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    if (req.session.role === "confirmateur") {
      const orders = await storage.getOrdersByConfirmateur(req.session.userId!);
      return res.json(orders);
    }
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    if (req.session.role === "confirmateur" && order.assignedTo !== req.session.userId) {
      return res.status(403).json({ message: "غير مصرح" });
    }
    res.json(order);
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data);
      res.status(201).json(order);
    } catch (e) {
      res.status(400).json({ message: "بيانات غير صحيحة", error: e });
    }
  });

  app.patch("/api/orders/:id/status", requireAuth, async (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "الحالة مطلوبة" });
    if (req.session.role === "confirmateur") {
      const order = await storage.getOrder(req.params.id);
      if (!order || order.assignedTo !== req.session.userId) {
        return res.status(403).json({ message: "غير مصرح" });
      }
    }
    const order = await storage.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(order);
  });

  app.patch("/api/orders/:id/assign", requireAdmin, async (req, res) => {
    const { confirmateurId } = req.body;
    if (!confirmateurId) return res.status(400).json({ message: "معرف المؤكد مطلوب" });
    const confirmateur = await storage.getUserById(confirmateurId);
    if (!confirmateur || confirmateur.role !== "confirmateur") {
      return res.status(400).json({ message: "المؤكد غير موجود" });
    }
    const order = await storage.assignOrder(req.params.id, confirmateurId, confirmateur.name);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(order);
  });

  app.get("/api/stats", requireAdmin, async (req, res) => {
    const products = await storage.getProducts();
    const orders = await storage.getOrders();
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total as string), 0);
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const processingOrders = orders.filter(o => o.status === "processing").length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;
    const confirmateurs = await storage.getConfirmateurs();
    res.json({ totalProducts: products.length, totalOrders: orders.length, totalRevenue, pendingOrders, processingOrders, deliveredOrders, totalConfirmateurs: confirmateurs.length });
  });

  app.get("/api/settings", async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch("/api/settings", requireAdmin, async (req, res) => {
    const settings = await storage.updateSettings(req.body);
    res.json(settings);
  });

  return httpServer;
}
