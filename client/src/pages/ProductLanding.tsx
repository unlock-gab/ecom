import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, CheckCircle, Shield, Truck, ArrowLeft, Zap, Award, Clock } from "lucide-react";
import { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import OrderForm from "@/components/OrderForm";
import { Link } from "wouter";

export default function ProductLanding() {
  const [, params] = useRoute("/landing/:id");

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 to-fuchsia-950 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-64 rounded-3xl bg-white/10" />
          <Skeleton className="h-8 w-3/4 bg-white/10" />
          <Skeleton className="h-48 bg-white/10 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-950 to-fuchsia-950 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
          <Link href="/products"><span className="underline cursor-pointer">تصفح المنتجات</span></Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - parseFloat(product.price as string) / parseFloat(product.originalPrice as string)) * 100)
    : 0;
  const benefits = product.landingBenefits && product.landingBenefits.length > 0
    ? product.landingBenefits
    : ["جودة عالية", "توصيل سريع", "دفع عند الاستلام"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-950">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="text-center mb-3">
          <Link href="/">
            <span className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm cursor-pointer transition-colors">
              <ArrowLeft className="w-4 h-4" />
              متجر نوفا
            </span>
          </Link>
        </div>

        {product.landingHook && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 px-4 py-2 rounded-full text-sm font-bold mb-3">
              <Zap className="w-4 h-4 fill-yellow-400" />
              عرض محدود
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
              {product.landingHook}
            </h1>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative rounded-3xl overflow-hidden mb-6 shadow-2xl">
          <img src={product.image} alt={product.name} className="w-full aspect-square object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="text-xl font-black text-white mb-1">{product.name}</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-yellow-300">{parseFloat(product.price as string).toLocaleString("ar-DZ")} دج</span>
              {product.originalPrice && <span className="text-white/50 line-through text-sm">{parseFloat(product.originalPrice as string).toLocaleString("ar-DZ")} دج</span>}
              {discount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">-{discount}%</span>}
            </div>
          </div>
          {discount > 0 && (
            <div className="absolute top-4 right-4 w-14 h-14 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="text-center">
                <div className="text-white font-black text-sm leading-none">-{discount}%</div>
                <div className="text-white/80 text-xs">خصم</div>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-3 mb-6">
          {benefits.map((benefit, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
              <CheckCircle className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
              <p className="text-white text-xs font-semibold leading-tight">{benefit}</p>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl shadow-2xl shadow-black/40 p-5 mb-6">
          <div className="text-center mb-4">
            <h3 className="text-xl font-black text-gray-900">اطلب الآن 📦</h3>
            <p className="text-gray-400 text-sm mt-1">الدفع عند الاستلام - توصيل لكل الجزائر</p>
          </div>
          <OrderForm product={product} source="landing" idPrefix="landing-" />
          <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-gray-100">
            {[{ icon: Shield, label: "دفع آمن" }, { icon: Truck, label: "توصيل سريع" }, { icon: Clock, label: "خدمة 24/7" }].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5 text-gray-400">
                <f.icon className="w-4 h-4" />
                <span className="text-xs font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-yellow-400" />
            <h4 className="text-white font-bold">ماذا يقول زبائننا</h4>
          </div>
          <div className="space-y-3">
            {[
              { name: "أحمد.م", wilaya: "الجزائر", review: "منتج ممتاز، وصل بسرعة والجودة أحسن من المتوقع!" },
              { name: "سارة.ب", wilaya: "وهران", review: "سعر رائع وخدمة ممتازة. أوصي به لكل الجزائريين" },
              { name: "يوسف.ك", wilaya: "قسنطينة", review: "تجربة شراء سهلة والمنتج وصل في وقت قياسي" },
            ].map((r, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">{r.name[0]}</div>
                  <div>
                    <div className="text-white text-xs font-bold">{r.name}</div>
                    <div className="text-white/50 text-xs">{r.wilaya}</div>
                  </div>
                  <div className="flex mr-auto">
                    {Array.from({ length: 5 }, (_, j) => <Star key={j} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
                  </div>
                </div>
                <p className="text-white/70 text-xs leading-relaxed">{r.review}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
