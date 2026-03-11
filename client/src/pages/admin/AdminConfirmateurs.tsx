import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, Trash2, Edit2, X, Eye, EyeOff, Loader2, CheckCircle, UserCheck } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AdminLayout from "./AdminLayout";

type Confirmateur = { id: string; username: string; name: string; role: string; createdAt: string };

export default function AdminConfirmateurs() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);

  const { data: confirmateurs = [], isLoading } = useQuery<Confirmateur[]>({
    queryKey: ["/api/confirmateurs"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/confirmateurs", data);
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/confirmateurs"] });
      toast({ title: "تم إنشاء الحساب ✓" });
      setShowForm(false);
      setForm({ name: "", username: "", password: "" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof form> }) => {
      const res = await apiRequest("PATCH", `/api/confirmateurs/${id}`, data);
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/confirmateurs"] });
      toast({ title: "تم التحديث ✓" });
      setEditingId(null);
      setForm({ name: "", username: "", password: "" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/confirmateurs/${id}`, undefined);
      if (!res.ok) { const e = await res.json(); throw new Error(e.message); }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/confirmateurs"] });
      toast({ title: "تم الحذف ✓" });
    },
    onError: (e: any) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const updates: any = { name: form.name };
      if (form.password) updates.password = form.password;
      updateMutation.mutate({ id: editingId, data: updates });
    } else {
      createMutation.mutate(form);
    }
  };

  const startEdit = (c: Confirmateur) => {
    setEditingId(c.id);
    setForm({ name: c.name, username: c.username, password: "" });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", username: "", password: "" });
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">المؤكدون</h1>
            <p className="text-gray-400 text-sm">{confirmateurs.length} مؤكد مسجل</p>
          </div>
          <motion.button
            onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", username: "", password: "" }); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 text-sm"
            data-testid="button-add-confirmateur"
          >
            <Plus className="w-4 h-4" />
            إضافة مؤكد
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-gray-900 border border-violet-500/30 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-violet-400" />
                    {editingId ? "تعديل المؤكد" : "إضافة مؤكد جديد"}
                  </h3>
                  <button onClick={cancelForm} className="text-gray-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-xs font-semibold mb-1.5">الاسم الكامل</label>
                      <input
                        value={form.name}
                        onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        placeholder="محمد الأمين"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm"
                        data-testid="input-confirmateur-name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-xs font-semibold mb-1.5">اسم المستخدم</label>
                      <input
                        value={form.username}
                        onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                        placeholder="mohammed123"
                        disabled={!!editingId}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm disabled:opacity-50"
                        data-testid="input-confirmateur-username"
                        required={!editingId}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold mb-1.5">
                      {editingId ? "كلمة المرور الجديدة (اتركها فارغة إذا لم تريد تغييرها)" : "كلمة المرور"}
                    </label>
                    <div className="relative">
                      <input
                        type={showPwd ? "text" : "password"}
                        value={form.password}
                        onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                        placeholder={editingId ? "اتركها فارغة لعدم التغيير" : "كلمة مرور قوية"}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 pl-10 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 text-sm"
                        data-testid="input-confirmateur-password"
                        required={!editingId}
                      />
                      <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={cancelForm} className="px-4 py-2.5 text-gray-400 hover:text-white border border-gray-700 rounded-xl text-sm transition-colors">
                      إلغاء
                    </button>
                    <motion.button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl text-sm disabled:opacity-60"
                      data-testid="button-save-confirmateur"
                    >
                      {(createMutation.isPending || updateMutation.isPending) ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />جاري الحفظ...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" />{editingId ? "تحديث" : "إنشاء الحساب"}</>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
                <div className="h-5 bg-gray-800 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-800 rounded w-1/4" />
              </div>
            ))
          ) : confirmateurs.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-gray-900 border border-gray-800 rounded-2xl p-12 text-center">
              <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 mb-1">لا يوجد مؤكدون بعد</p>
              <p className="text-gray-600 text-sm">أضف مؤكدين لتوزيع الطلبات عليهم</p>
            </motion.div>
          ) : (
            confirmateurs.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex items-center justify-between transition-colors"
                data-testid={`row-confirmateur-${c.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/20">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold">{c.name}</p>
                    <p className="text-gray-400 text-sm">@{c.username}</p>
                    <p className="text-gray-600 text-xs mt-0.5">
                      أنشئ: {new Date(c.createdAt).toLocaleDateString("ar-DZ")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                    مؤكد
                  </span>
                  <button
                    onClick={() => startEdit(c)}
                    className="p-2 bg-gray-800 hover:bg-blue-600/20 border border-gray-700 hover:border-blue-500 text-gray-400 hover:text-blue-400 rounded-xl transition-all"
                    data-testid={`button-edit-confirmateur-${c.id}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(c.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 bg-gray-800 hover:bg-red-600/20 border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400 rounded-xl transition-all disabled:opacity-50"
                    data-testid={`button-delete-confirmateur-${c.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
