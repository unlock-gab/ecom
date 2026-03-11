import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Package, ShoppingCart, TrendingUp, DollarSign, Clock, CheckCircle, Truck, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Product, Order } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Link } from "wouter";
import AdminLayout from "./AdminLayout";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
}

const statusTranslations: Record<string, string> = {
  pending: "معلق",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

function StatCard({ title, value, subtitle, icon: Icon, color, trend }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div className="text-3xl font-black text-white mb-1">{value}</div>
      <div className="text-gray-400 text-sm font-medium">{title}</div>
      {subtitle && <div className="text-gray-600 text-xs mt-1">{subtitle}</div>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data: stats } = useQuery<Stats>({ queryKey: ["/api/stats"] });
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: orders = [] } = useQuery<Order[]>({ queryKey: ["/api/orders"] });

  const recentOrders = orders.slice(0, 5);
  const categoryData = [
    { name: "إلكترونيات", count: products.filter(p => p.category === "electronics").length, color: "#6366f1" },
    { name: "أزياء", count: products.filter(p => p.category === "fashion").length, color: "#ec4899" },
    { name: "رياضة", count: products.filter(p => p.category === "sports").length, color: "#10b981" },
    { name: "جمال", count: products.filter(p => p.category === "beauty").length, color: "#a855f7" },
    { name: "كتب", count: products.filter(p => p.category === "books").length, color: "#f59e0b" },
    { name: "منزل", count: products.filter(p => p.category === "home").length, color: "#f97316" },
  ];

  const monthlyData = [
    { month: "أكتوبر", revenue: 12400, orders: 8 },
    { month: "نوفمبر", revenue: 18900, orders: 14 },
    { month: "ديسمبر", revenue: 24300, orders: 21 },
    { month: "يناير", revenue: 19800, orders: 16 },
    { month: "فبراير", revenue: 28600, orders: 24 },
    { month: "مارس", revenue: stats?.totalRevenue || 32000, orders: orders.length },
  ];

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2">لوحة التحكم</h1>
          <p className="text-gray-400">مرحباً! إليك نظرة عامة على متجرك.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="إجمالي الإيرادات"
            value={`${(stats?.totalRevenue || 0).toLocaleString("ar-SA")} ر.س`}
            icon={DollarSign}
            color="bg-violet-500/20 text-violet-400"
            trend={12}
          />
          <StatCard
            title="إجمالي الطلبات"
            value={stats?.totalOrders || 0}
            icon={ShoppingCart}
            color="bg-fuchsia-500/20 text-fuchsia-400"
            trend={8}
          />
          <StatCard
            title="المنتجات"
            value={stats?.totalProducts || 0}
            icon={Package}
            color="bg-emerald-500/20 text-emerald-400"
          />
          <StatCard
            title="طلبات معلقة"
            value={stats?.pendingOrders || 0}
            subtitle="تحتاج مراجعة"
            icon={Clock}
            color="bg-amber-500/20 text-amber-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-gray-900 rounded-2xl p-6 border border-gray-800"
          >
            <h2 className="text-white font-bold text-lg mb-6">الإيرادات الشهرية</h2>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#f9fafb" }}
                  formatter={(val: any) => [`${Number(val).toLocaleString("ar-SA")} ر.س`, "الإيرادات"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} fill="url(#revGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
          >
            <h2 className="text-white font-bold text-lg mb-6">المنتجات حسب الفئة</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="count">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "12px", color: "#f9fafb" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-2">
              {categoryData.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                    <span className="text-gray-400 text-xs">{cat.name}</span>
                  </div>
                  <span className="text-white text-xs font-bold">{cat.count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-white font-bold text-lg">آخر الطلبات</h2>
            <Link href="/admin/orders">
              <span className="text-violet-400 hover:text-violet-300 text-sm font-medium cursor-pointer transition-colors">
                عرض الكل
              </span>
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm">رقم الطلب</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm">العميل</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm">الإجمالي</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm">الحالة</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors" data-testid={`order-row-${order.id}`}>
                    <td className="px-6 py-4 text-gray-300 font-mono text-xs">{order.id.slice(0, 12)}...</td>
                    <td className="px-6 py-4 text-white font-medium">{order.customerName}</td>
                    <td className="px-6 py-4 text-violet-400 font-bold">{parseFloat(order.total as string).toLocaleString("ar-SA")} ر.س</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status] || "bg-gray-100 text-gray-700"}`}>
                        {statusTranslations[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-SA") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
