import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLogin() {
  const { login, user } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === "admin") navigate("/admin");
      else navigate("/confirmateur/orders");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || "خطأ في تسجيل الدخول");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-24 h-24 bg-gray-900 border border-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-emerald-500/20"
          >
            <img src="/zorabio-logo-white.png" alt="Zora Bio" className="w-16 h-16 object-contain" />
          </motion.div>
          <h1 className="text-3xl font-black text-white mb-1">ZORA<span className="text-emerald-400">Bio</span>®</h1>
          <p className="text-gray-400 text-sm">لوحة الإدارة والمؤكدين</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl"
        >
          <h2 className="text-xl font-black text-white mb-6 text-center">تسجيل الدخول</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-5 text-center"
              data-testid="login-error"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pr-10 pl-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                  data-testid="input-login-username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-semibold mb-2">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pr-10 pl-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                  data-testid="input-login-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-500/30 hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
              data-testid="button-login-submit"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" />جاري الدخول...</>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  دخول
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-800">
            <p className="text-gray-600 text-xs text-center">بيانات الدخول الافتراضية</p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-violet-400 font-bold text-xs mb-1">أدمن</p>
                <p className="text-gray-400 text-xs">admin / admin2026</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-emerald-400 font-bold text-xs mb-1">مؤكد</p>
                <p className="text-gray-400 text-xs">أنشئ حساب من الإدارة</p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
