import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle, Loader2, Phone, User, MapPin, Shield, Truck, ArrowLeft, Zap, Award, Clock } from "lucide-react";
import { Product, ALGERIAN_WILAYAS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

const orderSchema = z.object({
  customerName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  customerPhone: z.string().min(9, "رقم الهاتف غير صحيح").max(13),
  wilaya: z.string().min(1, "اختر الولاية"),
  quantity: z.number().min(1).max(20),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function ProductLanding() {
  const [, params] = useRoute("/landing/:id");
  const { toast } = useToast();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: { customerName: "", customerPhone: "", wilaya: "", quantity: 1 },
  });

  const quantity = form.watch("quantity");

  const orderMutation = useMutation({
    mutationFn: async (data: OrderForm) => {
      const res = await apiRequest("POST", "/api/orders", {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        wilaya: data.wilaya,
        productId: product!.id,
        productName: product!.name,
        productImage: product!.image,
        quantity: data.quantity,
        price: String(product!.price),
        total: String(parseFloat(product!.price as string) * data.quantity),
        status: "pending",
        notes: null,
        source: "landing",
      });
      return res.json();
    },
    onSuccess: (order) => {
      setOrderSuccess(true);
      setOrderId(order.id);
      form.reset();
    },
    onError: () => {
      toast({ title: "خطأ", description: "حدث خطأ، يرجى المحاولة مجدداً", variant: "destructive" });
    },
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

  const totalPrice = parseFloat(product.price as string) * quantity;
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

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-3xl shadow-2xl shadow-black/40 p-6 mb-6">
          <AnimatePresence mode="wait">
            {orderSuccess ? (
              <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-6">
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: 2, duration: 0.4 }}>
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">تم استلام طلبك! 🎉</h3>
                <p className="text-gray-500 mb-2">سيتصل بك فريقنا خلال أقل من ساعة</p>
                <p className="text-xs text-gray-400 mb-6">رقم الطلب: {orderId}</p>
                <button onClick={() => setOrderSuccess(false)} className="px-6 py-2.5 border-2 border-violet-300 text-violet-700 rounded-xl font-bold text-sm hover:bg-violet-50 transition-all">
                  طلب آخر
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-center mb-5">
                  <h3 className="text-xl font-black text-gray-900">اطلب الآن 📦</h3>
                  <p className="text-gray-400 text-sm mt-1">الدفع عند الاستلام - توصيل لكل الجزائر</p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(data => orderMutation.mutate(data))} className="space-y-4">
                    <FormField control={form.control} name="customerName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-bold flex items-center gap-1.5"><User className="w-4 h-4 text-violet-500" /> الاسم الكامل</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="أدخل اسمك الكامل" className="h-12 rounded-xl border-gray-200 focus:border-violet-400" data-testid="input-landing-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="customerPhone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-bold flex items-center gap-1.5"><Phone className="w-4 h-4 text-violet-500" /> رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="05XXXXXXXX" className="h-12 rounded-xl border-gray-200 focus:border-violet-400" data-testid="input-landing-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="wilaya" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-bold flex items-center gap-1.5"><MapPin className="w-4 h-4 text-violet-500" /> الولاية</FormLabel>
                        <FormControl>
                          <select {...field} className="w-full h-12 px-4 border border-gray-200 rounded-xl text-gray-700 focus:border-violet-400 outline-none bg-white" data-testid="select-landing-wilaya">
                            <option value="">-- اختر الولاية --</option>
                            {ALGERIAN_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div>
                      <label className="text-gray-700 font-bold text-sm mb-2 block">الكمية</label>
                      <div className="flex items-center gap-4">
                        <button type="button" onClick={() => form.setValue("quantity", Math.max(1, quantity - 1))} className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-violet-100 hover:text-violet-700 font-black text-xl transition-all">-</button>
                        <span className="text-xl font-black text-gray-800 w-8 text-center">{quantity}</span>
                        <button type="button" onClick={() => form.setValue("quantity", Math.min(20, quantity + 1))} className="w-11 h-11 rounded-xl bg-gray-100 hover:bg-violet-100 hover:text-violet-700 font-black text-xl transition-all">+</button>
                        <div className="flex-1 text-left">
                          <span className="text-xl font-black text-violet-700">{totalPrice.toLocaleString("ar-DZ")} دج</span>
                        </div>
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      disabled={orderMutation.isPending}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full h-16 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-xl rounded-2xl shadow-xl shadow-violet-500/30 flex items-center justify-center gap-2 hover:opacity-90 mt-2"
                      data-testid="button-landing-order"
                    >
                      {orderMutation.isPending ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> جاري الإرسال...</>
                      ) : (
                        <>🛍️ اطلب الآن - {totalPrice.toLocaleString("ar-DZ")} دج</>
                      )}
                    </motion.button>
                  </form>
                </Form>

                <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-gray-100">
                  {[{ icon: Shield, label: "دفع آمن" }, { icon: Truck, label: "توصيل سريع" }, { icon: Clock, label: "خدمة 24/7" }].map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-gray-400">
                      <f.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{f.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
