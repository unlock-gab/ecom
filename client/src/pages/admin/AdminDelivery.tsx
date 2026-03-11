import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Truck, Save, Search, Home, Building2, RotateCcw, TrendingUp, TrendingDown } from "lucide-react";
import { ALGERIAN_WILAYAS, DEFAULT_DELIVERY_PRICES, DeliveryPrices } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "./AdminLayout";

export default function AdminDelivery() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [prices, setPrices] = useState<DeliveryPrices>({ ...DEFAULT_DELIVERY_PRICES });

  const { data: settings, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  useEffect(() => {
    if (settings?.deliveryPrices) {
      try {
        const parsed = JSON.parse(settings.deliveryPrices);
        setPrices({ ...DEFAULT_DELIVERY_PRICES, ...parsed });
      } catch {}
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/settings", {
        deliveryPrices: JSON.stringify(prices),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "تم الحفظ", description: "تم تحديث أسعار التوصيل بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل حفظ الأسعار", variant: "destructive" });
    },
  });

  const resetToDefault = () => {
    setPrices({ ...DEFAULT_DELIVERY_PRICES });
    toast({ title: "تمت إعادة الضبط", description: "تم استعادة الأسعار الافتراضية" });
  };

  const updatePrice = (wilaya: string, type: "home" | "desk", value: string) => {
    const num = parseInt(value) || 0;
    setPrices(prev => ({
      ...prev,
      [wilaya]: { ...(prev[wilaya] || { home: 0, desk: 0 }), [type]: num },
    }));
  };

  const filteredWilayas = ALGERIAN_WILAYAS.filter(w => w.includes(search));

  const totalHome = ALGERIAN_WILAYAS.reduce((sum, w) => sum + (prices[w]?.home || 0), 0);
  const avgHome = Math.round(totalHome / ALGERIAN_WILAYAS.filter(w => (prices[w]?.home || 0) > 0).length);
  const avgDesk = Math.round(
    ALGERIAN_WILAYAS.reduce((sum, w) => sum + (prices[w]?.desk || 0), 0) /
    ALGERIAN_WILAYAS.filter(w => (prices[w]?.desk || 0) > 0).length
  );
  const unavailableCount = ALGERIAN_WILAYAS.filter(w => (prices[w]?.home || 0) === 0 && (prices[w]?.desk || 0) === 0).length;

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white mb-1">إدارة أسعار التوصيل</h1>
              <p className="text-gray-400 text-sm">حدد سعر التوصيل للمنزل والمكتب لكل ولاية جزائرية</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={resetToDefault}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-all text-sm font-medium"
                data-testid="button-reset-delivery"
              >
                <RotateCcw className="w-4 h-4" />
                إعادة الضبط
              </button>
              <motion.button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:opacity-90 transition-all text-sm disabled:opacity-60"
                data-testid="button-save-delivery"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? "جاري الحفظ..." : "حفظ الأسعار"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Home className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-gray-400 text-sm">متوسط المنزل</span>
            </div>
            <p className="text-2xl font-black text-white">{avgHome || 0} <span className="text-sm text-gray-400">دج</span></p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-gray-400 text-sm">متوسط المكتب</span>
            </div>
            <p className="text-2xl font-black text-white">{avgDesk || 0} <span className="text-sm text-gray-400">دج</span></p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 bg-red-500/20 rounded-xl flex items-center justify-center">
                <Truck className="w-4 h-4 text-red-400" />
              </div>
              <span className="text-gray-400 text-sm">غير متاح</span>
            </div>
            <p className="text-2xl font-black text-white">{unavailableCount} <span className="text-sm text-gray-400">ولاية</span></p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن الولاية..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pr-10 pl-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm"
                data-testid="input-delivery-search"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-right py-3 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">#</th>
                  <th className="text-right py-3 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">الولاية</th>
                  <th className="text-right py-3 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Home className="w-3.5 h-3.5 text-emerald-400" />توصيل للمنزل (دج)</span>
                  </th>
                  <th className="text-right py-3 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-blue-400" />توصيل للمكتب (دج)</span>
                  </th>
                  <th className="text-right py-3 px-5 text-gray-400 font-semibold text-xs uppercase tracking-wider">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {filteredWilayas.map((wilaya, idx) => {
                  const wp = prices[wilaya] || { home: 0, desk: 0 };
                  const isUnavailable = wp.home === 0 && wp.desk === 0;
                  const globalIdx = ALGERIAN_WILAYAS.indexOf(wilaya) + 1;
                  return (
                    <motion.tr
                      key={wilaya}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.01 }}
                      className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                      data-testid={`row-delivery-${wilaya}`}
                    >
                      <td className="py-3 px-5">
                        <span className="text-gray-500 text-xs font-mono">{String(globalIdx).padStart(2, "0")}</span>
                      </td>
                      <td className="py-3 px-5">
                        <span className="text-white font-semibold text-sm">{wilaya}</span>
                      </td>
                      <td className="py-3 px-5">
                        <input
                          type="number"
                          min="0"
                          max="9999"
                          value={wp.home}
                          onChange={e => updatePrice(wilaya, "home", e.target.value)}
                          className="w-28 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 text-center"
                          data-testid={`input-home-${wilaya}`}
                        />
                      </td>
                      <td className="py-3 px-5">
                        <input
                          type="number"
                          min="0"
                          max="9999"
                          value={wp.desk}
                          onChange={e => updatePrice(wilaya, "desk", e.target.value)}
                          className="w-28 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500 text-center"
                          data-testid={`input-desk-${wilaya}`}
                        />
                      </td>
                      <td className="py-3 px-5">
                        {isUnavailable ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/10 text-red-400 text-xs rounded-lg font-medium">
                            <TrendingDown className="w-3 h-3" />
                            غير متاح
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-lg font-medium">
                            <TrendingUp className="w-3 h-3" />
                            متاح
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filteredWilayas.length === 0 && (
              <div className="text-center py-10 text-gray-500">لا توجد نتائج للبحث</div>
            )}
          </div>

          <div className="p-4 border-t border-gray-800 flex justify-between items-center">
            <span className="text-gray-500 text-sm">{filteredWilayas.length} ولاية</span>
            <motion.button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 hover:opacity-90 transition-all text-sm disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saveMutation.isPending ? "جاري الحفظ..." : "حفظ جميع الأسعار"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
