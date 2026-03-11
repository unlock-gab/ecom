import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Sparkles, Shield, Truck, RefreshCw, Star, ChevronLeft, Zap, Cpu, Shirt, BookOpen, Dumbbell, Home as HomeIcon } from "lucide-react";
import { Product, Category } from "@shared/schema";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, any> = { Cpu, Shirt, BookOpen, Dumbbell, Sparkles, Home: HomeIcon };

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
  const { data: featured = [] } = useQuery<Product[]>({ queryKey: ["/api/products?featured=true"] });

  const featuredProducts = products.filter(p => p.featured).slice(0, 8);

  return (
    <div className="min-h-screen bg-white">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900">
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-10"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: i % 2 === 0 ? "#a78bfa" : "#f0abfc",
              }}
              animate={{
                x: [0, Math.random() * 60 - 30],
                y: [0, Math.random() * 60 - 30],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 5 + i, repeat: Infinity, repeatType: "reverse" }}
            />
          ))}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00aDJ2MmgtMnYtMnptLTQgNHYyaC0ydi0yaDJ6bTAtNGgydjJoLTJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 mb-8 text-white/90 text-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>تسوق أذكى. عيش أفضل.</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-black text-white mb-6 leading-tight"
          >
            اكتشف عالم{" "}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              التسوق
            </span>
            <br />المميز
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg sm:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            آلاف المنتجات من أفضل العلامات التجارية بأسعار لا تُقارن. شحن سريع وإرجاع مجاني خلال 30 يوماً.
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
                className="px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold rounded-2xl shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 transition-all flex items-center gap-2 text-lg"
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
                العروض المميزة
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
              { num: "+5000", label: "منتج متاح" },
              { num: "+50K", label: "عميل راضٍ" },
              { num: "4.9★", label: "تقييم المتجر" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-white">{stat.num}</div>
                <div className="text-sm text-white/60 mt-1">{stat.label}</div>
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
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: "توصيل لكل الجزائر", desc: "من عنابة إلى تمنراست", color: "from-violet-500 to-violet-600" },
                { icon: Shield, title: "دفع عند الاستلام", desc: "لا خطر، لا قلق", color: "from-emerald-500 to-emerald-600" },
                { icon: RefreshCw, title: "إرجاع مضمون", desc: "خلال 7 أيام بلا أسئلة", color: "from-orange-500 to-orange-600" },
                { icon: Star, title: "ضمان الجودة", desc: "منتجات أصلية مضمونة", color: "from-amber-500 to-amber-600" },
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
                <p className="text-gray-500 mt-2">اكتشف منتجاتنا في كل الأقسام</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((cat, i) => {
                const Icon = iconMap[cat.icon] || Sparkles;
                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05, y: -4 }}
                  >
                    <Link href={`/products?category=${cat.slug}`}>
                      <div className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl cursor-pointer transition-all hover:border-violet-200">
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                          style={{ background: `linear-gradient(135deg, ${cat.color}33, ${cat.color}55)` }}
                        >
                          <Icon className="w-7 h-7" style={{ color: cat.color }} />
                        </div>
                        <span className="text-sm font-bold text-gray-700 group-hover:text-violet-700 transition-colors">{cat.name}</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-violet-600" />
                  <span className="text-violet-600 font-semibold text-sm uppercase tracking-wide">المنتجات المميزة</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900">الأكثر مبيعاً</h2>
              </div>
              <Link href="/products">
                <Button variant="outline" className="hidden sm:flex items-center gap-2 border-violet-200 text-violet-700 hover:bg-violet-50 rounded-xl">
                  <span>عرض الكل</span>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 rounded-3xl p-10 lg:p-16 text-white">
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/10"
                    style={{ width: 200 + i * 80, height: 200 + i * 80, left: `${70 + i * 10}%`, top: `${-20 + i * 20}%` }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
                  />
                ))}
              </div>
              <div className="relative z-10 max-w-lg">
                <Badge className="bg-white/20 text-white border-white/30 mb-4">عرض لفترة محدودة</Badge>
                <h2 className="text-3xl lg:text-5xl font-black mb-4 leading-tight">
                  خصم يصل إلى<br />
                  <span className="text-yellow-300">50%</span> على كل شيء
                </h2>
                <p className="text-white/80 text-lg mb-8">
                  لا تفوّت أفضل صفقات الموسم على أحدث المنتجات والعلامات التجارية المميزة.
                </p>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-violet-700 font-black rounded-2xl shadow-2xl hover:bg-yellow-300 hover:text-violet-900 transition-all flex items-center gap-2"
                    data-testid="button-shop-offer"
                  >
                    <span>اغتنم الفرصة</span>
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      <AnimatedSection>
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-black text-gray-900">ماذا يقول عملاؤنا</h2>
              <p className="text-gray-500 mt-2">آراء حقيقية من عملاء حقيقيين</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "أحمد بلقاسم", avatar: "أ", rating: 5, text: "تجربة تسوق رائعة! التوصيل سريع والمنتجات مطابقة للوصف. الدفع عند الاستلام خلاني نثق أكثر.", city: "الجزائر" },
                { name: "سارة بوزيدي", avatar: "س", rating: 5, text: "المنتجات أصلية 100% وجودتها ممتازة. وصلتني في يومين فقط لوهران. أنصح بيه الجميع!", city: "وهران" },
                { name: "محمد حمزاوي", avatar: "م", rating: 5, text: "أسعار رائعة مقارنة بالسوق. سهل الطلب ولا توجد مشاكل. سأشتري مرة أخرى بالتأكيد.", city: "قسنطينة" },
              ].map((review, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  whileHover={{ y: -4 }}
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: review.rating }, (_, j) => (
                      <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-white font-bold">
                      {review.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-sm">{review.name}</div>
                      <div className="text-xs text-gray-400">{review.city}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
