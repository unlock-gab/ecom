import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Package, ShoppingCart, Zap, ChevronLeft, Menu, Home, Bell, Settings, Truck, Users, LogOut, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/admin" },
  { icon: Package, label: "المنتجات", href: "/admin/products" },
  { icon: ShoppingCart, label: "الطلبات", href: "/admin/orders" },
  { icon: Users, label: "المؤكدون", href: "/admin/confirmateurs" },
  { icon: Truck, label: "أسعار التوصيل", href: "/admin/delivery" },
  { icon: Settings, label: "إعدادات البيكسل", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/admin/login");
    } else if (!loading && user && user.role !== "admin") {
      navigate("/confirmateur/orders");
    }
  }, [user, loading]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin mx-auto mb-3" />
          <p className="text-gray-400">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gray-950 flex" dir="rtl">
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: sidebarOpen ? 0 : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed right-0 top-0 bottom-0 w-72 bg-gray-900 border-l border-gray-800 z-50 lg:hidden flex flex-col"
      >
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold">نوفا</div>
              <div className="text-gray-400 text-xs">لوحة الإدارة</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 overflow-y-auto">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: -3 }}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 cursor-pointer transition-all ${location === item.href ? "bg-violet-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {location === item.href && <ChevronLeft className="w-4 h-4 mr-auto" />}
              </motion.div>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-1">
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer transition-all">
              <Home className="w-5 h-5" />
              <span className="font-medium">العودة للمتجر</span>
            </div>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 cursor-pointer transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </motion.aside>

      <div className="hidden lg:flex lg:flex-col lg:fixed lg:right-0 lg:top-0 lg:bottom-0 lg:w-72 bg-gray-900 border-l border-gray-800 z-30">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-black text-lg">نوفا</div>
              <div className="text-gray-400 text-xs">لوحة الإدارة</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-3 px-4">القائمة الرئيسية</div>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: -3 }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl mb-1 cursor-pointer transition-all ${location === item.href ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
                data-testid={`nav-admin-${item.href.split("/").pop()}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {location === item.href && <ChevronLeft className="w-4 h-4 mr-auto opacity-60" />}
              </motion.div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0) || "أ"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{user?.name}</p>
              <p className="text-gray-500 text-xs truncate">@{user?.username}</p>
            </div>
          </div>
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white cursor-pointer transition-all" data-testid="nav-back-to-store">
              <Home className="w-5 h-5" />
              <span className="font-medium">العودة للمتجر</span>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 cursor-pointer transition-all"
            data-testid="button-admin-logout"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">تسجيل الخروج</span>
          </button>
        </div>
      </div>

      <div className="flex-1 lg:mr-72">
        <header className="sticky top-0 z-20 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <span className="text-white font-semibold text-sm hidden sm:block">
                {navItems.find(n => n.href === location)?.label || "لوحة الإدارة"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
              {user?.name?.charAt(0) || "أ"}
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
