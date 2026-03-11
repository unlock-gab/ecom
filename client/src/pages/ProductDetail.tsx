import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, ChevronLeft, Shield, Truck, RefreshCw, ExternalLink } from "lucide-react";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/ProductCard";
import OrderForm from "@/components/OrderForm";
import { Link } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });
  const { data: allProducts = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const related = allProducts.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-5">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">المنتج غير موجود</h2>
          <Link href="/products"><Button className="bg-violet-600 text-white rounded-xl">تصفح المنتجات</Button></Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - parseFloat(product.price as string) / parseFloat(product.originalPrice as string)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/"><span className="hover:text-violet-600 cursor-pointer">الرئيسية</span></Link>
          <ChevronLeft className="w-4 h-4" />
          <Link href="/products"><span className="hover:text-violet-600 cursor-pointer">المنتجات</span></Link>
          <ChevronLeft className="w-4 h-4" />
          <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 aspect-square">
              <motion.img src={product.image} alt={product.name} className="w-full h-full object-cover" initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }} />
              {discount > 0 && (
                <div className="absolute top-5 left-5 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg">-{discount}%</div>
              )}
              {product.badge && (
                <div className="absolute top-5 right-5 px-3 py-1.5 bg-violet-600 text-white text-sm font-bold rounded-xl shadow-lg">{product.badge}</div>
              )}
            </div>
            {product.landingEnabled && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Link href={`/landing/${product.id}`}>
                  <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 rounded-2xl text-violet-700 font-medium text-sm hover:bg-violet-100 cursor-pointer transition-all">
                    <ExternalLink className="w-4 h-4" />
                    عرض صفحة الإعلان الخاصة بهذا المنتج
                  </div>
                </Link>
              </motion.div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              {product.badge && <Badge className="bg-violet-100 text-violet-700 border-violet-200">{product.badge}</Badge>}
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-4 leading-tight" data-testid="text-product-name">{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(parseFloat(product.rating as string)) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.reviews.toLocaleString("ar-DZ")} تقييم)</span>
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-black text-violet-700" data-testid="text-product-price">
                {parseFloat(product.price as string).toLocaleString("ar-DZ")} دج
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">{parseFloat(product.originalPrice as string).toLocaleString("ar-DZ")} دج</span>
              )}
            </div>
            <p className="text-gray-600 leading-relaxed mb-6 text-sm">{product.description}</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[{ icon: Truck, title: "توصيل لكل الجزائر" }, { icon: Shield, title: "دفع عند الاستلام" }, { icon: RefreshCw, title: "إرجاع مضمون" }].map((f, i) => (
                <div key={i} className="text-center p-3 bg-violet-50 rounded-xl border border-violet-100">
                  <f.icon className="w-5 h-5 text-violet-600 mx-auto mb-1" />
                  <div className="text-xs font-bold text-gray-700">{f.title}</div>
                </div>
              ))}
            </div>

            <OrderForm product={product} source="product" />
          </motion.div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-black text-gray-900 mb-8">منتجات مشابهة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
