import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, X, Package, Truck, CheckCircle, Clock, XCircle, Phone, MapPin, Home, Building2, UserCheck, ChevronDown } from "lucide-react";
import { Order } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "./AdminLayout";

const statusConfig: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  pending: { label: "معلق", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", icon: Clock },
  processing: { label: "قيد المعالجة", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", icon: Package },
  shipped: { label: "تم الشحن", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: Truck },
  delivered: { label: "تم التسليم", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle },
  cancelled: { label: "ملغي", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: XCircle },
};

const statusOptions = ["pending", "processing", "shipped", "delivered", "cancelled"];

type Confirmateur = { id: string; username: string; name: string };

export default function AdminOrders() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [assigningOrderId, setAssigningOrderId] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({ queryKey: ["/api/orders"] });
  const { data: confirmateurs = [] } = useQuery<Confirmateur[]>({ queryKey: ["/api/confirmateurs"] });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${id}/status`, { status });
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      toast({ title: "تم تحديث حالة الطلب ✓" });
    },
    onError: () => toast({ title: "خطأ في التحديث", variant: "destructive" }),
  });

  const assignMutation = useMutation({
    mutationFn: async ({ orderId, confirmateurId }: { orderId: string; confirmateurId: string }) => {
      const res = await apiRequest("PATCH", `/api/orders/${orderId}/assign`, { confirmateurId });
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      if (selectedOrder?.id === updated.id) setSelectedOrder(updated);
      setAssigningOrderId(null);
      toast({ title: `تم إسناد الطلب إلى ${updated.confirmateurName} ✓` });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  let filtered = orders;
  if (filterStatus !== "all") filtered = filtered.filter(o => o.status === filterStatus);
  if (search) filtered = filtered.filter(o =>
    o.customerName.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    o.customerPhone.includes(search) ||
    o.wilaya.includes(search)
  );

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-1">الطلبات</h1>
          <p className="text-gray-400">{orders.length} طلب إجمالي</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو الهاتف أو الولاية..."
              className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-500 pr-11 pl-4 py-3 rounded-xl focus:outline-none focus:border-violet-500"
              data-testid="input-order-search"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-gray-900 border border-gray-800 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-violet-500"
            data-testid="select-order-status-filter"
          >
            <option value="all">جميع الحالات</option>
            {statusOptions.map(s => (
              <option key={s} value={s}>{statusConfig[s]?.label || s}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", ...statusOptions].map(s => {
            const cfg = statusConfig[s];
            const count = s === "all" ? orders.length : orders.filter(o => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  filterStatus === s
                    ? "bg-violet-600 text-white border-violet-500"
                    : "bg-gray-900 text-gray-400 border-gray-800 hover:border-gray-600"
                }`}
                data-testid={`filter-status-${s}`}
              >
                {s === "all" ? "الكل" : cfg?.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm whitespace-nowrap">رقم الطلب</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm whitespace-nowrap">العميل</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm whitespace-nowrap hidden md:table-cell">الولاية</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm whitespace-nowrap hidden md:table-cell">المنتج</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm whitespace-nowrap">الإجمالي</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm whitespace-nowrap">الحالة</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm whitespace-nowrap hidden lg:table-cell">المؤكد</th>
                  <th className="text-right px-6 py-4 text-gray-400 font-medium text-sm whitespace-nowrap">إجراء</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-800/50">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-gray-800 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    filtered.map((order) => {
                      const cfg = statusConfig[order.status] || statusConfig["pending"];
                      const StatusIcon = cfg.icon;
                      const isAssigning = assigningOrderId === order.id;
                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                          data-testid={`order-row-${order.id}`}
                        >
                          <td className="px-6 py-4 text-gray-300 font-mono text-xs whitespace-nowrap">
                            #{order.id.slice(-8)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-white font-medium whitespace-nowrap">{order.customerName}</div>
                            <div className="text-gray-500 text-xs flex items-center gap-1"><Phone className="w-3 h-3" />{order.customerPhone}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-400 hidden md:table-cell whitespace-nowrap">
                            <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-600" />{order.wilaya}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              {order.deliveryType === "home"
                                ? <><Home className="w-3 h-3 text-emerald-500" /><span className="text-xs text-emerald-400">منزل</span></>
                                : <><Building2 className="w-3 h-3 text-blue-400" /><span className="text-xs text-blue-400">مكتب</span></>
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="text-gray-300 text-xs line-clamp-1 max-w-[140px]">{order.productName}</div>
                            <div className="text-gray-500 text-xs">×{order.quantity}</div>
                          </td>
                          <td className="px-6 py-4 text-violet-400 font-bold whitespace-nowrap">
                            {parseFloat(order.total as string).toLocaleString("ar-DZ")} دج
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.color} whitespace-nowrap`}>
                              <StatusIcon className="w-3 h-3" />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <div className="relative">
                              {isAssigning ? (
                                <select
                                  autoFocus
                                  defaultValue=""
                                  onBlur={() => setAssigningOrderId(null)}
                                  onChange={e => {
                                    if (e.target.value) {
                                      assignMutation.mutate({ orderId: order.id, confirmateurId: e.target.value });
                                    }
                                  }}
                                  className="bg-gray-800 border border-violet-500 text-white text-xs px-2 py-1.5 rounded-lg focus:outline-none w-36"
                                  data-testid={`select-assign-confirmateur-${order.id}`}
                                >
                                  <option value="">اختر مؤكداً</option>
                                  {confirmateurs.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              ) : (
                                <button
                                  onClick={() => setAssigningOrderId(order.id)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                    order.confirmateurName
                                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-violet-500 hover:text-violet-400"
                                  }`}
                                  data-testid={`button-assign-order-${order.id}`}
                                >
                                  <UserCheck className="w-3.5 h-3.5" />
                                  {order.confirmateurName || "إسناد"}
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-2 bg-gray-800 hover:bg-violet-600/20 border border-gray-700 hover:border-violet-500 text-gray-400 hover:text-violet-400 rounded-xl transition-all"
                              data-testid={`button-view-order-${order.id}`}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {!isLoading && filtered.length === 0 && (
            <div className="py-16 text-center">
              <Package className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد طلبات</p>
            </div>
          )}
        </div>

        <AnimatePresence>
          {selectedOrder && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={() => setSelectedOrder(null)}
              />
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
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-gray-800 rounded-2xl p-4 mb-4 flex items-center gap-3">
                    {selectedOrder.productImage && (
                      <img src={selectedOrder.productImage} alt={selectedOrder.productName} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                    )}
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
                      { label: "المصدر", value: selectedOrder.source === "landing" ? "Landing Page" : "صفحة المنتج", icon: "🔗" },
                      { label: "رقم الطلب", value: `#${selectedOrder.id.slice(-8)}`, icon: "🔢" },
                      { label: "التاريخ", value: selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString("ar-DZ") : "-", icon: "📅" },
                    ].map((info, i) => (
                      <div key={i} className="bg-gray-800 rounded-xl p-3">
                        <div className="text-gray-500 text-xs mb-1">{info.icon} {info.label}</div>
                        <div className="text-white text-sm font-medium break-words">{info.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-5">
                    <div className="text-gray-400 text-sm font-medium mb-3 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-violet-400" />
                      إسناد إلى مؤكد
                    </div>
                    {selectedOrder.confirmateurName ? (
                      <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-2">
                        <div>
                          <p className="text-emerald-400 font-bold text-sm">{selectedOrder.confirmateurName}</p>
                          <p className="text-gray-500 text-xs">مُعيَّن حالياً</p>
                        </div>
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-xs mb-2">لم يُسنَد لأي مؤكد بعد</p>
                    )}
                    {confirmateurs.length === 0 ? (
                      <p className="text-gray-600 text-xs">لا يوجد مؤكدون. أنشئ حسابات من صفحة المؤكدين.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {confirmateurs.map(c => (
                          <button
                            key={c.id}
                            onClick={() => assignMutation.mutate({ orderId: selectedOrder.id, confirmateurId: c.id })}
                            disabled={assignMutation.isPending || selectedOrder.assignedTo === c.id}
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                              selectedOrder.assignedTo === c.id
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-gray-800 text-gray-400 border-gray-700 hover:border-violet-500 hover:text-violet-400"
                            }`}
                            data-testid={`button-assign-to-${c.id}`}
                          >
                            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-black text-xs">
                              {c.name.charAt(0)}
                            </div>
                            <span className="truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
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
                            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                              isActive
                                ? `${cfg.bg} ${cfg.color} border-current`
                                : "bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600 hover:text-white"
                            }`}
                            data-testid={`button-status-${s}`}
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
    </AdminLayout>
  );
}
