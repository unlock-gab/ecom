import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Search, SlidersHorizontal, X, ChevronDown, Grid3X3, List, Cpu, Shirt, BookOpen, Dumbbell, Sparkles, Home as HomeIcon } from "lucide-react";
import { Product, Category } from "@shared/schema";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const iconMap: Record<string, any> = { Cpu, Shirt, BookOpen, Dumbbell, Sparkles, Home: HomeIcon };

const categoryNames: Record<string, string> = {
  electronics: "إلكترونيات",
  fashion: "أزياء",
  books: "كتب",
  sports: "رياضة",
  beauty: "جمال",
  home: "منزل",
};

const sortOptions = [
  { value: "newest", label: "الأحدث" },
  { value: "price-asc", label: "السعر: الأقل أولاً" },
  { value: "price-desc", label: "السعر: الأعلى أولاً" },
  { value: "rating", label: "الأعلى تقييماً" },
  { value: "popular", label: "الأكثر شعبية" },
];

export default function Products() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split("?")[1] || "");
  const [search, setSearch] = useState(params.get("search") || "");
  const [activeCategory, setActiveCategory] = useState(params.get("category") || "all");
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  const { data: products = [], isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const { data: categories = [] } = useQuery<Category[]>({ queryKey: ["/api/categories"] });

  useEffect(() => {
    const newParams = new URLSearchParams(location.split("?")[1] || "");
    setActiveCategory(newParams.get("category") || "all");
    setSearch(newParams.get("search") || "");
  }, [location]);

  let filtered = products;
  if (activeCategory !== "all") filtered = filtered.filter(p => p.category === activeCategory);
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  filtered = filtered.filter(p => parseFloat(p.price as string) >= priceRange[0] && parseFloat(p.price as string) <= priceRange[1]);

  switch (sort) {
    case "price-asc": filtered = [...filtered].sort((a, b) => parseFloat(a.price as string) - parseFloat(b.price as string)); break;
    case "price-desc": filtered = [...filtered].sort((a, b) => parseFloat(b.price as string) - parseFloat(a.price as string)); break;
    case "rating": filtered = [...filtered].sort((a, b) => parseFloat(b.rating as string) - parseFloat(a.rating as string)); break;
    case "popular": filtered = [...filtered].sort((a, b) => b.reviews - a.reviews); break;
    default: break;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-violet-700 to-fuchsia-700 pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl lg:text-4xl font-black text-white mb-2">
              {activeCategory === "all" ? "جميع المنتجات" : categoryNames[activeCategory] || activeCategory}
            </h1>
            <p className="text-white/70">{filtered.length} منتج متاح</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-5 text-lg">الفئات</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setActiveCategory("all")}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeCategory === "all" ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30" : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"}`}
                  data-testid="filter-category-all"
                >
                  <span>جميع المنتجات</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === "all" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {products.length}
                  </span>
                </button>
                {categories.map(cat => {
                  const Icon = iconMap[cat.icon] || Sparkles;
                  const count = products.filter(p => p.category === cat.slug).length;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.slug)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeCategory === cat.slug ? "bg-violet-600 text-white shadow-lg shadow-violet-500/30" : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"}`}
                      data-testid={`filter-category-${cat.slug}`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span>{cat.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${activeCategory === cat.slug ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">نطاق السعر</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <span>{priceRange[0].toLocaleString("ar-SA")} ر.س</span>
                  <span>-</span>
                  <span>{priceRange[1].toLocaleString("ar-SA")} ر.س</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10000}
                  step={100}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-violet-600"
                />
              </div>
            </div>
          </motion.aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="pr-10 rounded-xl border-gray-200 focus:border-violet-400 bg-white"
                  data-testid="input-product-search"
                />
              </div>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white text-gray-700 focus:border-violet-400 outline-none cursor-pointer"
                data-testid="select-sort"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mb-6 flex-wrap lg:hidden">
              <button
                onClick={() => setActiveCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === "all" ? "bg-violet-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}
              >
                الكل
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.slug ? "bg-violet-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden">
                    <Skeleton className="aspect-square" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-6 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mb-6">
                  <Search className="w-12 h-12 text-violet-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-400 mb-6">جرب البحث بكلمات مختلفة أو اختر تصنيفاً آخر</p>
                <Button onClick={() => { setSearch(""); setActiveCategory("all"); }} className="bg-violet-600 text-white rounded-xl">
                  عرض جميع المنتجات
                </Button>
              </motion.div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategory + search + sort}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5"
                >
                  {filtered.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
