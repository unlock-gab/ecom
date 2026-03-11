import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, CheckCircle, Loader2, Phone, User, MapPin, Shield, Truck, RefreshCw, Share2, ExternalLink } from "lucide-react";
import { Product, ALGERIAN_WILAYAS } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/ProductCard";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const orderSchema = z.object({
  customerName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  customerPhone: z.string().min(9, "رقم الهاتف غير صحيح").max(13),
  wilaya: z.string().min(1, "اختر الولاية"),
  quantity: z.number().min(1).max(20),
  notes: z.string().optional(),
});

type OrderForm = z.infer<typeof orderSchema>;

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", params?.id],
    enabled: !!params?.id,
  });
  const { data: allProducts = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const related = allProducts.filter(p => p.category === product?.category && p.id !== product?.id).slice(0, 4);

  const form = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: { customerName: "", customerPhone: "", wilaya: "", quantity: 1, notes: "" },
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
        notes: data.notes || null,
        source: "product",
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

  const totalPrice = parseFloat(product.price as string) * quantity;

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

            <AnimatePresence mode="wait">
              {orderSuccess ? (
                <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-xl font-black text-emerald-700 mb-2">تم تأكيد طلبك! 🎉</h3>
                  <p className="text-emerald-600 text-sm mb-4">سيتصل بك فريقنا قريباً لتأكيد التوصيل</p>
                  <p className="text-xs text-emerald-500 mb-4">رقم الطلب: {orderId}</p>
                  <Button onClick={() => setOrderSuccess(false)} variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 rounded-xl">
                    طلب جديد
                  </Button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border-2 border-violet-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">اطلب الآن - الدفع عند الاستلام</h3>
                      <p className="text-xs text-gray-400">أدخل بياناتك ونتصل بك للتأكيد</p>
                    </div>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(data => orderMutation.mutate(data))} className="flex flex-col gap-4">
                      <FormField control={form.control} name="customerName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold flex items-center gap-1.5"><User className="w-4 h-4" /> الاسم الكامل</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="أدخل اسمك الكامل" className="rounded-xl border-gray-200 focus:border-violet-400 h-12" data-testid="input-order-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="customerPhone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold flex items-center gap-1.5"><Phone className="w-4 h-4" /> رقم الهاتف</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="05XXXXXXXX" className="rounded-xl border-gray-200 focus:border-violet-400 h-12" data-testid="input-order-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="wilaya" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-semibold flex items-center gap-1.5"><MapPin className="w-4 h-4" /> الولاية</FormLabel>
                          <FormControl>
                            <select {...field} className="w-full h-12 px-4 border border-gray-200 rounded-xl text-gray-700 focus:border-violet-400 outline-none bg-white" data-testid="select-order-wilaya">
                              <option value="">-- اختر الولاية --</option>
                              {ALGERIAN_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div>
                        <Label className="text-gray-700 font-semibold mb-2 block">الكمية</Label>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => form.setValue("quantity", Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-violet-100 hover:text-violet-700 font-bold text-lg transition-all flex items-center justify-center">-</button>
                          <span className="w-10 text-center font-black text-lg text-gray-800">{quantity}</span>
                          <button type="button" onClick={() => form.setValue("quantity", Math.min(20, quantity + 1))} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-violet-100 hover:text-violet-700 font-bold text-lg transition-all flex items-center justify-center">+</button>
                          <div className="flex-1 text-left">
                            <span className="text-lg font-black text-violet-700">{totalPrice.toLocaleString("ar-DZ")} دج</span>
                          </div>
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={orderMutation.isPending}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full h-14 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black text-lg rounded-2xl shadow-xl shadow-violet-500/30 hover:opacity-90 flex items-center justify-center gap-2 mt-2"
                        data-testid="button-place-order"
                      >
                        {orderMutation.isPending ? (
                          <><Loader2 className="w-5 h-5 animate-spin" /> جاري إرسال الطلب...</>
                        ) : (
                          <>اطلب الآن - {totalPrice.toLocaleString("ar-DZ")} دج</>
                        )}
                      </motion.button>
                    </form>
                  </Form>
                </motion.div>
              )}
            </AnimatePresence>
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
