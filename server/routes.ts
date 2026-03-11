import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema } from "@shared/schema";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
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

  app.get("/api/orders", async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.get("/api/orders/:id", async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
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

  app.patch("/api/orders/:id/status", async (req, res) => {
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "الحالة مطلوبة" });
    const order = await storage.updateOrderStatus(req.params.id, status);
    if (!order) return res.status(404).json({ message: "الطلب غير موجود" });
    res.json(order);
  });

  app.get("/api/stats", async (req, res) => {
    const products = await storage.getProducts();
    const orders = await storage.getOrders();
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total as string), 0);
    const pendingOrders = orders.filter(o => o.status === "pending").length;
    const processingOrders = orders.filter(o => o.status === "processing").length;
    const deliveredOrders = orders.filter(o => o.status === "delivered").length;
    res.json({ totalProducts: products.length, totalOrders: orders.length, totalRevenue, pendingOrders, processingOrders, deliveredOrders });
  });

  app.get("/api/settings", async (req, res) => {
    const settings = await storage.getSettings();
    res.json(settings);
  });

  app.patch("/api/settings", async (req, res) => {
    const settings = await storage.updateSettings(req.body);
    res.json(settings);
  });

  return httpServer;
}
