import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Heart, Star, Truck, Shield, RefreshCw, ChevronLeft, Plus, Minus, Share2, Check, ArrowLeft } from "lucide-react";
import { Product } from "@shared/schema";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { Link } from "wouter";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const [, navigate] = useLocation();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  const { data: allProducts = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const related = allProducts.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price as string),
      image: product.image,
      quantity,
    });
    setAddedToCart(true);
    toast({ title: "تمت الإضافة للسلة!", description: `${product.name} × ${quantity}` });
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price as string),
      image: product.image,
      quantity,
    });
    navigate("/checkout");
  };

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
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
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
          <Link href="/products">
            <Button className="bg-violet-600 text-white rounded-xl">تصفح المنتجات</Button>
          </Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="relative bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 aspect-square">
              <motion.img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              />
              {discount > 0 && (
                <div className="absolute top-5 left-5 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-xl shadow-lg">
                  -{discount}%
                </div>
              )}
              {product.badge && (
                <div className="absolute top-5 right-5 px-3 py-1.5 bg-violet-600 text-white text-sm font-bold rounded-xl shadow-lg">
                  {product.badge}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              {product.badge && (
                <Badge className="bg-violet-100 text-violet-700 border-violet-200">{product.badge}</Badge>
              )}
              <Badge variant="outline" className="text-gray-500">{product.category}</Badge>
            </div>

            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-4 leading-tight" data-testid="text-product-name">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(parseFloat(product.rating as string)) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} ({product.reviews.toLocaleString("ar-SA")} تقييم)
              </span>
              <Separator orientation="vertical" className="h-4" />
              <span className={`text-sm font-medium ${product.stock > 0 ? "text-emerald-600" : "text-red-500"}`}>
                {product.stock > 0 ? `متوفر (${product.stock} قطعة)` : "غير متوفر"}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-black text-violet-700" data-testid="text-product-price">
                {parseFloat(product.price as string).toLocaleString("ar-SA")} ر.س
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-400 line-through">
                  {parseFloat(product.originalPrice as string).toLocaleString("ar-SA")} ر.س
                </span>
              )}
              {discount > 0 && (
                <span className="text-base font-bold text-red-500">وفّر {discount}%</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6 text-base">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <span className="font-semibold text-gray-700">الكمية:</span>
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-violet-50 transition-all"
                  data-testid="button-decrease-quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold text-gray-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-9 h-9 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-violet-50 transition-all"
                  data-testid="button-increase-quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={product.stock === 0}
                className={`flex-1 h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg ${
                  addedToCart
                    ? "bg-emerald-500 text-white shadow-emerald-500/30"
                    : "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-violet-500/30 hover:opacity-90"
                }`}
                data-testid="button-add-to-cart"
              >
                <AnimatePresence mode="wait">
                  {addedToCart ? (
                    <motion.div key="added" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                      <Check className="w-5 h-5" /> تمت الإضافة!
                    </motion.div>
                  ) : (
                    <motion.div key="add" className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5" /> أضف إلى السلة
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all hover:scale-110 ${isWishlisted ? "border-red-400 bg-red-50 text-red-500" : "border-gray-200 bg-white text-gray-400 hover:border-red-300"}`}
                data-testid="button-wishlist"
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? "fill-red-500" : ""}`} />
              </button>
            </div>

            <motion.button
              onClick={handleBuyNow}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={product.stock === 0}
              className="w-full h-14 rounded-2xl bg-gray-900 text-white font-bold text-base flex items-center justify-center gap-2 hover:bg-gray-800 transition-all mb-8"
              data-testid="button-buy-now"
            >
              <ArrowLeft className="w-5 h-5" />
              اشتري الآن
            </motion.button>

            <div className="grid grid-cols-3 gap-4 bg-gray-50 rounded-2xl p-5">
              {[
                { icon: Truck, title: "شحن سريع", desc: "2-3 أيام عمل" },
                { icon: Shield, title: "دفع آمن", desc: "مشفّر 100%" },
                { icon: RefreshCw, title: "إرجاع مجاني", desc: "30 يوماً" },
              ].map((feat, i) => (
                <div key={i} className="text-center">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
                    <feat.icon className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="text-xs font-bold text-gray-700">{feat.title}</div>
                  <div className="text-xs text-gray-400">{feat.desc}</div>
                </div>
              ))}
            </div>
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
