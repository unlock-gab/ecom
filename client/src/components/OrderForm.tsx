import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Loader2, Phone, User, MapPin, Home, Building2, Truck, Shield, Package } from "lucide-react";
import { ALGERIAN_WILAYAS, Product, DeliveryPrices, DEFAULT_DELIVERY_PRICES } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const orderSchema = z.object({
  customerName: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  customerPhone: z.string().min(9, "رقم الهاتف غير صحيح").max(13),
  wilaya: z.string().min(1, "اختر الولاية"),
  deliveryType: z.enum(["home", "desk"]),
  quantity: z.number().min(1).max(20),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface OrderFormProps {
  product: Product;
  source?: "product" | "landing";
  idPrefix?: string;
}

export default function OrderForm({ product, source = "product", idPrefix = "" }: OrderFormProps) {
  const { toast } = useToast();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const { data: settings = {} } = useQuery<Record<string, string>>({ queryKey: ["/api/settings"] });
  const deliveryPrices: DeliveryPrices = settings.deliveryPrices
    ? JSON.parse(settings.deliveryPrices)
    : DEFAULT_DELIVERY_PRICES;

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: { customerName: "", customerPhone: "", wilaya: "", deliveryType: "home", quantity: 1, notes: "" },
  });

  const quantity = form.watch("quantity");
  const selectedWilaya = form.watch("wilaya");
  const deliveryType = form.watch("deliveryType");

  const wilayaDelivery = selectedWilaya ? (deliveryPrices[selectedWilaya] || DEFAULT_DELIVERY_PRICES[selectedWilaya]) : null;
  const deliveryPrice = wilayaDelivery ? (deliveryType === "home" ? wilayaDelivery.home : wilayaDelivery.desk) : 0;
  const productTotal = parseFloat(product.price as string) * quantity;
  const grandTotal = productTotal + deliveryPrice;
  const deliveryAvailable = deliveryPrice > 0;

  const orderMutation = useMutation({
    mutationFn: async (data: OrderFormValues) => {
      const res = await apiRequest("POST", "/api/orders", {
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        wilaya: data.wilaya,
        deliveryType: data.deliveryType,
        deliveryPrice: String(deliveryPrice),
        productId: product.id,
        productName: product.name,
        productImage: product.image,
        quantity: data.quantity,
        price: String(product.price),
        total: String(grandTotal),
        status: "pending",
        notes: data.notes || null,
        source,
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

  if (orderSuccess) {
    return (
      <motion.div
        key="success"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center"
      >
        <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: 2, duration: 0.4 }}>
          <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
        </motion.div>
        <h3 className="text-xl font-black text-emerald-700 mb-2">تم تأكيد طلبك! 🎉</h3>
        <p className="text-emerald-600 text-sm mb-1">سيتصل بك فريقنا قريباً لتأكيد التوصيل</p>
        <p className="text-xs text-emerald-500 mb-4">رقم الطلب: {orderId}</p>
        <button
          onClick={() => setOrderSuccess(false)}
          className="px-6 py-2 border-2 border-emerald-300 text-emerald-700 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all"
        >
          طلب جديد
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-white border-2 border-emerald-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
          <Phone className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-base">اطلب الآن - الدفع عند الاستلام</h3>
          <p className="text-xs text-gray-400">أدخل بياناتك ونتصل بك للتأكيد</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(data => orderMutation.mutate(data))} className="space-y-4">
          <FormField control={form.control} name="customerName" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
                <User className="w-4 h-4 text-violet-500" /> الاسم الكامل
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="أدخل اسمك الكامل" className="rounded-xl border-gray-200 focus:border-emerald-400 h-11" data-testid={`${idPrefix}input-order-name`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="customerPhone" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
                <Phone className="w-4 h-4 text-violet-500" /> رقم الهاتف
              </FormLabel>
              <FormControl>
                <Input {...field} placeholder="05XXXXXXXX" className="rounded-xl border-gray-200 focus:border-emerald-400 h-11" data-testid={`${idPrefix}input-order-phone`} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="wilaya" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-violet-500" /> الولاية
              </FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl text-gray-700 focus:border-emerald-400 outline-none bg-white text-sm"
                  data-testid={`${idPrefix}select-order-wilaya`}
                >
                  <option value="">-- اختر الولاية --</option>
                  {ALGERIAN_WILAYAS.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="deliveryType" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-semibold flex items-center gap-1.5 text-sm">
                <Truck className="w-4 h-4 text-violet-500" /> نوع التوصيل
              </FormLabel>
              <FormControl>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => field.onChange("home")}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                      field.value === "home"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                    data-testid={`${idPrefix}btn-delivery-home`}
                  >
                    <Home className="w-4 h-4 flex-shrink-0" />
                    <div className="text-right">
                      <div>للمنزل</div>
                      {selectedWilaya && wilayaDelivery && (
                        <div className={`text-xs font-black ${wilayaDelivery.home > 0 ? "text-emerald-600" : "text-red-400"}`}>
                          {wilayaDelivery.home > 0 ? `${wilayaDelivery.home} دج` : "غير متاح"}
                        </div>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => field.onChange("desk")}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-bold ${
                      field.value === "desk"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                    data-testid={`${idPrefix}btn-delivery-desk`}
                  >
                    <Building2 className="w-4 h-4 flex-shrink-0" />
                    <div className="text-right">
                      <div>للمكتب</div>
                      {selectedWilaya && wilayaDelivery && (
                        <div className={`text-xs font-black ${wilayaDelivery.desk > 0 ? "text-blue-600" : "text-red-400"}`}>
                          {wilayaDelivery.desk > 0 ? `${wilayaDelivery.desk} دج` : "غير متاح"}
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {selectedWilaya && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={`rounded-xl p-3 text-sm ${deliveryAvailable ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}
              >
                {deliveryAvailable ? (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-500" />
                      رسوم التوصيل إلى {selectedWilaya}
                    </span>
                    <span className="font-black text-emerald-700">{deliveryPrice} دج</span>
                  </div>
                ) : (
                  <p className="text-red-600 text-center font-semibold">⚠️ التوصيل غير متاح لهذه الولاية بهذه الطريقة</p>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          <div>
            <label className="text-gray-700 font-semibold text-sm mb-2 block">الكمية</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => form.setValue("quantity", Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 font-bold text-lg transition-all flex items-center justify-center">-</button>
              <span className="w-10 text-center font-black text-lg text-gray-800">{quantity}</span>
              <button type="button" onClick={() => form.setValue("quantity", Math.min(20, quantity + 1))} className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 font-bold text-lg transition-all flex items-center justify-center">+</button>
            </div>
          </div>

          {selectedWilaya && deliveryAvailable && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>سعر المنتج × {quantity}</span>
                <span>{productTotal.toLocaleString("ar-DZ")} دج</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>رسوم التوصيل</span>
                <span>{deliveryPrice} دج</span>
              </div>
              <div className="flex items-center justify-between font-black text-emerald-700 text-base pt-2 border-t border-emerald-200">
                <span>الإجمالي</span>
                <span>{grandTotal.toLocaleString("ar-DZ")} دج</span>
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={orderMutation.isPending || (!!selectedWilaya && !deliveryAvailable)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-13 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-500/30 hover:opacity-90 flex items-center justify-center gap-2 mt-1 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
            data-testid={`${idPrefix}button-place-order`}
          >
            {orderMutation.isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> جاري إرسال الطلب...</>
            ) : (
              <>
                <Package className="w-5 h-5" />
                اطلب الآن
                {selectedWilaya && deliveryAvailable && ` - ${grandTotal.toLocaleString("ar-DZ")} دج`}
              </>
            )}
          </motion.button>
        </form>
      </Form>
    </div>
  );
}
