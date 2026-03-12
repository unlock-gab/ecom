import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Shield, Truck, Star, Leaf, FlaskConical, Dumbbell, Heart, Zap, ChevronLeft, Flame } from "lucide-react";
import { Product, Category } from "@shared/schema";
import ProductCard from "@/components/ProductCard";

const iconMap: Record<string, any> = {
  Dumbbell, Sparkles, Leaf, Flame, Heart, FlaskConical, Zap, Star,
};

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

  const featuredProducts = products.filter(p => p.featured).slice(0, 8);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-emerald-950 to-teal-950">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: Math.random() * 350 + 80,
                height: Math.random() * 350 + 80,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 3 === 0 ? "#10b981" : i % 3 === 1 ? "#14b8a6" : "#6ee7b7",
              }}
              animate={{
                x: [0, Math.random() * 50 - 25],
                y: [0, Math.random() * 50 - 25],
                scale: [1, 1.15, 1],
              }}
              transition={{ duration: 5 + i * 0.7, repeat: Infinity, repeatType: "reverse" }}
            />
          ))}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgNHYyaC0ydi0yaDJ6bTAtNGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring" }}
              className="flex justify-center mb-6"
            >
              <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-2">
                <img src="/zorabio-logo.png" alt="Zora Bio" className="h-20 w-auto" />
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full px-5 py-2 mb-6 text-emerald-300 text-sm"
            >
              <Leaf className="w-4 h-4" />
              <span>مكملات غذائية طبيعية 100% أصلية</span>
              <Leaf className="w-4 h-4" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-4 leading-tight"
          >
            ارتقِ بصحتك مع{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-green-300 bg-clip-text text-transparent">
              Zora Bio
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            مكملات غذائية عالية الجودة لدعم أدائك الرياضي وصحتك اليومية. توصيل لكل ولايات الجزائر الـ 58. الدفع عند الاستلام.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all flex items-center gap-2 text-lg"
                data-testid="button-shop-now"
              >
                <span>تسوق الآن</span>
                <ArrowLeft className="w-5 h-5" />
              </motion.button>
            </Link>
            <Link href="/products?featured=true">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-lg"
              >
                الأكثر مبيعاً
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {[
              { num: "+200", label: "منتج متاح" },
              { num: "+15K", label: "عميل راضٍ" },
              { num: "4.9★", label: "تقييم الزبائن" },
              { num: "58", label: "ولاية نوصّل إليها" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-emerald-400">{stat.num}</div>
                <div className="text-sm text-white/50 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </motion.div>
      </section>

      <AnimatedSection>
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: "توصيل لكل الجزائر", desc: "58 ولاية - منزل أو مكتب", color: "from-emerald-500 to-emerald-600" },
                { icon: Shield, title: "الدفع عند الاستلام", desc: "لا خطر، لا قلق", color: "from-teal-500 to-teal-600" },
                { icon: Leaf, title: "مكونات طبيعية", desc: "جودة مضمونة 100%", color: "from-green-500 to-green-600" },
                { icon: Star, title: "ضمان الرضا", desc: "إرجاع خلال 7 أيام", color: "from-lime-600 to-green-600" },
              ].map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className={`w-14 h-14 bg-gradient-to-br ${feat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <feat.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{feat.title}</h3>
                  <p className="text-sm text-gray-500">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900">تسوق حسب الفئة</h2>
                <p className="text-gray-500 mt-2">اكتشف مكمّلاتنا في كل التصنيفات</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat, i) => {
                const Icon = iconMap[cat.icon] || Sparkles;
                return (
                  <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      whileHover={{ y: -6, scale: 1.04 }}
                      className="group relative bg-white rounded-2xl p-5 text-center cursor-pointer shadow-sm hover:shadow-xl transition-all border border-gray-100 hover:border-emerald-200 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div
                        className="relative w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${cat.color}cc, ${cat.color})` }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <p className="relative font-bold text-gray-800 group-hover:text-emerald-700 transition-colors text-sm">{cat.name}</p>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900">الأكثر مبيعاً</h2>
                <p className="text-gray-500 mt-2">اختيارات آلاف العملاء الجزائريين</p>
              </div>
              <Link href="/products?featured=true">
                <motion.button
                  whileHover={{ x: -4 }}
                  className="hidden sm:flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <span>عرض الكل</span>
                  <ChevronLeft className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {featuredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="py-20 bg-gradient-to-br from-gray-950 via-emerald-950 to-teal-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-emerald-400"
                style={{ width: 200 + i * 100, height: 200 + i * 100, left: `${i * 25}%`, top: "50%", transform: "translateY(-50%)" }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3 + i, repeat: Infinity, repeatType: "reverse" }}
              />
            ))}
          </div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring" }}>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-2 mb-6 text-emerald-300 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>عرض خاص</span>
              </div>
            </motion.div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              أول طلب؟ احصل على{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">شحن مجاني</span>
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
              اطلب أي مكمل غذائي من Zora Bio واستمتع بتوصيل مجاني لولايتك
            </p>
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all text-lg"
                data-testid="button-cta-order"
              >
                اطلب الآن
              </motion.button>
            </Link>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
