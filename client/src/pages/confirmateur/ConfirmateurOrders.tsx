import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, Package, Truck, CheckCircle, Clock, XCircle, Search, Eye, X, Home, Building2, LogOut, Zap } from "lucide-react";
import { Order } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "wouter";

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  pending: { label: "معلق", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
  processing: { label: "قيد المعالجة", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Package },
  shipped: { label: "تم الشحن", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: Truck },
  delivered: { label: "تم التسليم", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: XCircle },
};

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function ConfirmateurOrders() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({ queryKey: ["/api/orders"] });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      toast({ title: "تم تحديث الحالة ✓" });
    },
    onError: () => toast({ title: "خطأ", variant: "destructive" }),
  });

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  let filtered = orders;
  if (filterStatus !== "all") filtered = filtered.filter(o => o.status === filterStatus);
  if (search) filtered = filtered.filter(o =>
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.customerPhone.includes(search) ||
    o.wilaya.includes(search)
  );

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      <header className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800 h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">نوفا - مؤكد</p>
            <p className="text-gray-400 text-xs">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {user?.name?.charAt(0) || "م"}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all text-sm"
            data-testid="button-confirmateur-logout"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-black text-white mb-1">طلباتي المعينة</h1>
          <p className="text-gray-400 text-sm">{orders.length} طلب معين لك</p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث..."
              className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-500 pr-10 pl-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 text-sm"
              data-testid="input-confirmateur-search"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white px-4 py-2.5 rounded-xl focus:outline-none focus:border-violet-500 text-sm"
          >
            <option value="all">جميع الحالات</option>
            {statusOptions.map(s => <option key={s} value={s}>{statusConfig[s]?.label}</option>)}
          </select>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {["all", ...statusOptions].map(s => {
            const cfg = statusConfig[s];
            const count = s === "all" ? orders.length : orders.filter(o => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${filterStatus === s ? "bg-violet-600 text-white border-violet-500" : "bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600"}`}
              >
                {s === "all" ? "الكل" : cfg?.label} ({count})
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl p-5 animate-pulse h-24" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl py-16 text-center">
            <Package className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">لا توجد طلبات</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order, i) => {
              const cfg = statusConfig[order.status] || statusConfig["pending"];
              const StatusIcon = cfg.icon;
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-colors"
                  data-testid={`confirmateur-order-${order.id}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {order.productImage && (
                        <img src={order.productImage} alt={order.productName} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm mb-1 line-clamp-1">{order.productName}</p>
                        <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{order.customerPhone}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.wilaya}</span>
                          <span className="flex items-center gap-1">
                            {order.deliveryType === "home" ? <Home className="w-3 h-3 text-emerald-400" /> : <Building2 className="w-3 h-3 text-blue-400" />}
                            {order.deliveryType === "home" ? "منزل" : "مكتب"}
                          </span>
                        </div>
                        <p className="text-white font-bold mt-1.5">{parseFloat(order.total as string).toLocaleString("ar-DZ")} دج</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-violet-600/20 border border-gray-700 hover:border-violet-500 text-gray-400 hover:text-violet-400 rounded-xl transition-all text-xs font-medium"
                        data-testid={`button-view-confirmateur-order-${order.id}`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        تفاصيل
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={() => setSelectedOrder(null)} />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-r border-gray-800 z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-black text-white">تفاصيل الطلب</h2>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-gray-800 rounded-2xl p-4 mb-4 flex items-center gap-3">
                  {selectedOrder.productImage && <img src={selectedOrder.productImage} alt={selectedOrder.productName} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />}
                  <div>
                    <div className="text-white font-bold text-sm">{selectedOrder.productName}</div>
                    <div className="text-gray-400 text-xs mt-0.5">الكمية: {selectedOrder.quantity}</div>
                    <div className="text-violet-400 font-black mt-1">{parseFloat(selectedOrder.total as string).toLocaleString("ar-DZ")} دج</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "العميل", value: selectedOrder.customerName, icon: "👤" },
                    { label: "الهاتف", value: selectedOrder.customerPhone, icon: "📞" },
                    { label: "الولاية", value: selectedOrder.wilaya, icon: "📍" },
                    { label: "التوصيل", value: selectedOrder.deliveryType === "home" ? "🏠 للمنزل" : "🏢 للمكتب", icon: "🚚" },
                    { label: "رسوم التوصيل", value: `${parseFloat(String(selectedOrder.deliveryPrice || 0)).toLocaleString("ar-DZ")} دج`, icon: "💰" },
                    { label: "التاريخ", value: selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString("ar-DZ") : "-", icon: "📅" },
                  ].map((info, i) => (
                    <div key={i} className="bg-gray-800 rounded-xl p-3">
                      <div className="text-gray-500 text-xs mb-1">{info.icon} {info.label}</div>
                      <div className="text-white text-sm font-medium break-words">{info.value}</div>
                    </div>
                  ))}
                </div>

                {selectedOrder.notes && (
                  <div className="mb-5">
                    <div className="text-gray-400 text-sm font-medium mb-2">ملاحظات</div>
                    <div className="bg-gray-800 rounded-xl p-3 text-gray-300 text-sm">{selectedOrder.notes}</div>
                  </div>
                )}

                <div>
                  <div className="text-gray-400 text-sm font-medium mb-3">تحديث الحالة</div>
                  <div className="grid grid-cols-2 gap-2">
                    {statusOptions.map(s => {
                      const cfg = statusConfig[s];
                      const Icon = cfg.icon;
                      const isActive = selectedOrder.status === s;
                      return (
                        <button
                          key={s}
                          onClick={() => updateStatusMutation.mutate({ id: selectedOrder.id, status: s })}
                          disabled={updateStatusMutation.isPending || isActive}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${isActive ? `${cfg.bg} ${cfg.color} border-current` : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-white"}`}
                          data-testid={`button-confirmateur-status-${s}`}
                        >
                          <Icon className="w-4 h-4" />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
