import { motion } from "framer-motion";
import { ShoppingCart, Star, Heart, Eye } from "lucide-react";
import { Product } from "@shared/schema";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addItem({
      productId: product.id,
      name: product.name,
      price: parseFloat(product.price as string),
      image: product.image,
      quantity: 1,
    });
    toast({ title: "تمت الإضافة للسلة", description: product.name });
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const discount = product.originalPrice
    ? Math.round((1 - parseFloat(product.price as string) / parseFloat(product.originalPrice as string)) * 100)
    : 0;

  const badgeColors: Record<string, string> = {
    "جديد": "bg-emerald-500",
    "الأفضل مبيعاً": "bg-orange-500",
    "مميز": "bg-violet-600",
    "محدود": "bg-red-500",
    "إصدار محدود": "bg-indigo-600",
    "الأفضل": "bg-amber-500",
    "طبيعي 100%": "bg-green-600",
    "الأكثر مبيعاً": "bg-orange-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-md hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 cursor-pointer"
      data-testid={`card-product-${product.id}`}
      onClick={() => navigate(`/products/${product.id}`)}
    >
      <div className="relative overflow-hidden bg-gray-50 aspect-square">
        <motion.img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {product.badge && (
          <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-lg text-white text-xs font-bold shadow-lg ${badgeColors[product.badge] || "bg-violet-600"}`}>
            {product.badge}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold shadow-lg">
            -{discount}%
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300">
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl shadow-lg hover:opacity-90"
            data-testid={`button-add-to-cart-${product.id}`}
          >
            <ShoppingCart className="w-4 h-4 ml-1.5" />
            {isAdding ? "جاري الإضافة..." : "أضف للسلة"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="bg-white/90 hover:bg-white rounded-xl shadow-md"
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }}
            data-testid={`button-view-${product.id}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        <button
          onClick={handleWishlist}
          className="absolute top-3 left-3 p-2 rounded-xl bg-white/90 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          data-testid={`button-wishlist-${product.id}`}
        >
          <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < Math.floor(parseFloat(product.rating as string)) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`}
            />
          ))}
          <span className="text-xs text-gray-400 mr-1">({product.reviews.toLocaleString("ar-SA")})</span>
        </div>

        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-3 group-hover:text-violet-700 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-violet-700" data-testid={`text-price-${product.id}`}>
            {parseFloat(product.price as string).toLocaleString("ar-SA")} ر.س
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {parseFloat(product.originalPrice as string).toLocaleString("ar-SA")}
            </span>
          )}
        </div>

        {product.stock < 20 && product.stock > 0 && (
          <p className="text-xs text-orange-500 mt-2 font-medium">باقي {product.stock} فقط!</p>
        )}
      </div>
    </motion.div>
  );
}
