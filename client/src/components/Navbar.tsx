import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/products", label: "منتجاتنا" },
    { href: "/products?category=protein", label: "بروتين" },
    { href: "/products?category=vitamins", label: "فيتامينات" },
    { href: "/products?category=weightloss", label: "تخسيس" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-emerald-500/10 border-b border-emerald-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-8">
              <Link href="/">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 cursor-pointer">
                  <div className={`flex items-center justify-center ${scrolled ? "bg-gray-900" : "bg-white/10 backdrop-blur-sm"} rounded-xl p-1`}>
                    <img src="/zorabio-logo.png" alt="Zora Bio" className="h-9 w-auto" />
                  </div>
                  <div className="flex flex-col leading-none">
                    <span className={`text-lg font-black tracking-tight ${scrolled ? "text-emerald-700" : "text-white"}`}>
                      ZORA<span className={scrolled ? "text-gray-900" : "text-white/80"}>Bio</span>
                    </span>
                    <span className={`text-[10px] font-medium ${scrolled ? "text-gray-500" : "text-white/50"}`}>مكملات غذائية</span>
                  </div>
                </motion.div>
              </Link>
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <motion.span
                      whileHover={{ y: -1 }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                        location === link.href
                          ? "bg-emerald-100 text-emerald-700"
                          : scrolled ? "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50" : "text-white/80 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {link.label}
                    </motion.span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen(true)}
                className={`p-2.5 rounded-xl transition-all ${scrolled ? "text-gray-600 hover:bg-emerald-50 hover:text-emerald-600" : "text-white/80 hover:bg-white/10 hover:text-white"}`}
                data-testid="button-search"
              >
                <Search className="w-5 h-5" />
              </motion.button>
              <button
                className={`lg:hidden p-2.5 rounded-xl transition-all ${scrolled ? "text-gray-600 hover:bg-emerald-50" : "text-white/80 hover:bg-white/10"}`}
                onClick={() => setMenuOpen(!menuOpen)}
                data-testid="button-mobile-menu"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-emerald-100 shadow-xl"
            >
              <div className="px-4 py-4 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium cursor-pointer transition-all">
                      {link.label}
                    </span>
                  </Link>
                ))}
                <Link href="/admin">
                  <span onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-emerald-600 hover:bg-emerald-50 font-medium cursor-pointer transition-all">
                    لوحة الإدارة
                  </span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-32 px-4"
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <form onSubmit={handleSearch} className="relative">
                <Input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مكملات غذائية..."
                  className="w-full h-16 text-lg pr-14 pl-6 rounded-2xl border-2 border-emerald-300 focus:border-emerald-500 shadow-2xl bg-white"
                  data-testid="input-search"
                />
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 hover:text-emerald-700">
                  <Search className="w-6 h-6" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
