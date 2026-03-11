import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Product } from "@shared/schema";
import { useState } from "react";
import { useLocation } from "wouter";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [, navigate] = useLocation();

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
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

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

        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${product.id}`); }}
            className="w-full py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl text-sm shadow-lg hover:opacity-90 transition-all"
            data-testid={`button-order-${product.id}`}
          >
            اطلب الآن
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1 mb-1.5">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(parseFloat(product.rating as string)) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
          ))}
          <span className="text-xs text-gray-400 mr-1">({product.reviews.toLocaleString("ar-DZ")})</span>
        </div>
        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 leading-tight mb-3 group-hover:text-violet-700 transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-violet-700" data-testid={`text-price-${product.id}`}>
            {parseFloat(product.price as string).toLocaleString("ar-DZ")} دج
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              {parseFloat(product.originalPrice as string).toLocaleString("ar-DZ")}
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
