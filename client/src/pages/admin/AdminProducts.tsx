import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Search, X, Package, Loader2, ImageOff, ExternalLink } from "lucide-react";
import { Product, InsertProduct, insertProductSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import AdminLayout from "./AdminLayout";
import { Link } from "wouter";

const categories = [
  { value: "electronics", label: "إلكترونيات" },
  { value: "fashion", label: "أزياء" },
  { value: "books", label: "كتب" },
  { value: "sports", label: "رياضة" },
  { value: "beauty", label: "جمال" },
  { value: "home", label: "منزل" },
];

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "السعر مطلوب"),
  name: z.string().min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  landingHook: z.string().optional(),
  landingBenefitsText: z.string().optional(),
});

type ProductFormData = z.infer<typeof productFormSchema>;

export default function AdminProducts() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products = [], isLoading } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "", description: "", price: "", category: "electronics", image: "",
      stock: 100, featured: false, badge: "", rating: "4.5", reviews: 0,
      landingEnabled: false, landingHook: "", landingBenefitsText: "",
    },
  });

  const landingEnabled = form.watch("landingEnabled");

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const { landingBenefitsText, ...rest } = data;
      const payload = {
        ...rest,
        landingBenefits: landingBenefitsText ? landingBenefitsText.split("\n").filter(Boolean) : [],
      };
      const res = await apiRequest("POST", "/api/products", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "تم إضافة المنتج بنجاح ✓" });
      setIsFormOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "خطأ", description: "لم يتمكن من إضافة المنتج", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductFormData> }) => {
      const { landingBenefitsText, ...rest } = data;
      const payload = {
        ...rest,
        landingBenefits: landingBenefitsText ? landingBenefitsText.split("\n").filter(Boolean) : [],
      };
      const res = await apiRequest("PATCH", `/api/products/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({ title: "تم تحديث المنتج بنجاح ✓" });
      setIsFormOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: () => toast({ title: "خطأ", description: "لم يتمكن من تحديث المنتج", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "تم حذف المنتج" });
    },
    onError: () => toast({ title: "خطأ في الحذف", variant: "destructive" }),
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      image: product.image,
      stock: product.stock,
      featured: product.featured,
      badge: product.badge || "",
      rating: String(product.rating),
      reviews: product.reviews,
      landingEnabled: product.landingEnabled || false,
      landingHook: product.landingHook || "",
      landingBenefitsText: (product.landingBenefits || []).join("\n"),
    });
    setIsFormOpen(true);
  };

  const onSubmit = (data: ProductFormData) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">المنتجات</h1>
            <p className="text-gray-400">{products.length} منتج في المتجر</p>
          </div>
          <Button
            onClick={() => { setEditingProduct(null); form.reset(); setIsFormOpen(true); }}
            className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl shadow-lg shadow-violet-500/30 hover:opacity-90"
            data-testid="button-add-product"
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة منتج
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full bg-gray-900 border border-gray-800 text-white placeholder-gray-500 pr-11 pl-4 py-3 rounded-xl focus:outline-none focus:border-violet-500"
            data-testid="input-admin-search"
          />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                <Skeleton className="aspect-video bg-gray-800" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-2/3 bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence>
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all group"
                  data-testid={`admin-product-${product.id}`}
                >
                  <div className="relative aspect-video overflow-hidden bg-gray-800">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <ImageOff className="w-8 h-8" />
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-lg">مميز</div>
                    )}
                    {product.landingEnabled && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-fuchsia-600 text-white text-xs font-bold rounded-lg">Landing</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold text-sm line-clamp-1 mb-1">{product.name}</h3>
                    <p className="text-gray-500 text-xs capitalize mb-2">{categories.find(c => c.value === product.category)?.label || product.category}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-violet-400 font-bold">{parseFloat(product.price as string).toLocaleString("ar-DZ")} دج</span>
                      <span className={`text-xs ${product.stock > 10 ? "text-emerald-400" : "text-red-400"}`}>
                        المخزون: {product.stock}
                      </span>
                    </div>
                    {product.landingEnabled && (
                      <Link href={`/landing/${product.id}`}>
                        <div className="flex items-center gap-1.5 text-fuchsia-400 hover:text-fuchsia-300 text-xs mb-3 cursor-pointer transition-colors">
                          <ExternalLink className="w-3 h-3" />
                          عرض Landing Page
                        </div>
                      </Link>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 py-2 bg-gray-800 hover:bg-violet-600/20 border border-gray-700 hover:border-violet-500 text-gray-300 hover:text-violet-400 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1"
                        data-testid={`button-edit-${product.id}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        تعديل
                      </button>
                      <button
                        onClick={() => { if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) deleteMutation.mutate(product.id); }}
                        disabled={deleteMutation.isPending}
                        className="py-2 px-3 bg-gray-800 hover:bg-red-600/20 border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400 rounded-xl text-xs font-medium transition-all flex items-center justify-center"
                        data-testid={`button-delete-${product.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {isFormOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={() => setIsFormOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 sm:inset-8 lg:inset-16 bg-gray-900 border border-gray-800 rounded-3xl z-50 overflow-y-auto"
              >
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-white">
                      {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
                    </h2>
                    <button
                      onClick={() => { setIsFormOpen(false); setEditingProduct(null); form.reset(); }}
                      className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField control={form.control} name="name" render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="text-gray-300">اسم المنتج</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="أدخل اسم المنتج" className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-xl focus:border-violet-500" data-testid="input-product-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="text-gray-300">الوصف</FormLabel>
                            <FormControl>
                              <textarea
                                {...field}
                                rows={3}
                                placeholder="وصف المنتج..."
                                className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl p-3 focus:outline-none focus:border-violet-500 resize-none"
                                data-testid="textarea-product-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="price" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">السعر (دج)</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" placeholder="0" className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-xl focus:border-violet-500" data-testid="input-product-price" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="category" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">الفئة</FormLabel>
                            <FormControl>
                              <select {...field} className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl p-2.5 focus:outline-none focus:border-violet-500 h-10" data-testid="select-product-category">
                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="image" render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel className="text-gray-300">رابط الصورة</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://..." className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-xl focus:border-violet-500" data-testid="input-product-image" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="stock" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">المخزون</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" onChange={e => field.onChange(Number(e.target.value))} className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-xl focus:border-violet-500" data-testid="input-product-stock" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="badge" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-300">الشارة (اختياري)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="جديد، عرض..." className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-xl focus:border-violet-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <div className="sm:col-span-2 flex items-center gap-3 bg-gray-800 rounded-xl p-4 border border-gray-700">
                          <input
                            type="checkbox"
                            id="featured"
                            checked={form.watch("featured") || false}
                            onChange={e => form.setValue("featured", e.target.checked)}
                            className="w-5 h-5 accent-violet-600 rounded"
                            data-testid="checkbox-product-featured"
                          />
                          <label htmlFor="featured" className="text-gray-300 font-medium cursor-pointer">
                            منتج مميز (يظهر في الصفحة الرئيسية)
                          </label>
                        </div>
                      </div>

                      <div className="border-t border-gray-800 pt-5">
                        <div className="flex items-center gap-3 mb-4 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-xl p-4">
                          <input
                            type="checkbox"
                            id="landingEnabled"
                            checked={form.watch("landingEnabled") || false}
                            onChange={e => form.setValue("landingEnabled", e.target.checked)}
                            className="w-5 h-5 accent-fuchsia-600 rounded"
                            data-testid="checkbox-landing-enabled"
                          />
                          <div>
                            <label htmlFor="landingEnabled" className="text-fuchsia-300 font-bold cursor-pointer block">
                              تفعيل Landing Page
                            </label>
                            <p className="text-gray-500 text-xs mt-0.5">صفحة تسويقية مخصصة لإعلانات فيسبوك وتيك توك</p>
                          </div>
                        </div>

                        {landingEnabled && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4">
                            <FormField control={form.control} name="landingHook" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">العنوان التسويقي (Hook)</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value || ""}
                                    placeholder="مثال: الهاتف الأقوى في الجزائر بأفضل سعر!"
                                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 rounded-xl focus:border-fuchsia-500"
                                    data-testid="input-landing-hook"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="landingBenefitsText" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">مميزات المنتج (سطر لكل ميزة)</FormLabel>
                                <FormControl>
                                  <textarea
                                    {...field}
                                    value={field.value || ""}
                                    rows={4}
                                    placeholder={"جودة عالية\nتوصيل سريع\nدفع عند الاستلام\nضمان المنتج"}
                                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-xl p-3 focus:outline-none focus:border-fuchsia-500 resize-none text-sm"
                                    data-testid="textarea-landing-benefits"
                                  />
                                </FormControl>
                                <p className="text-gray-600 text-xs mt-1">أدخل ميزة واحدة في كل سطر</p>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </motion.div>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="submit"
                          disabled={createMutation.isPending || updateMutation.isPending}
                          className="flex-1 h-12 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold hover:opacity-90"
                          data-testid="button-submit-product"
                        >
                          {(createMutation.isPending || updateMutation.isPending) ? (
                            <><Loader2 className="w-5 h-5 animate-spin ml-2" /> جاري الحفظ...</>
                          ) : editingProduct ? "حفظ التغييرات" : "إضافة المنتج"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => { setIsFormOpen(false); setEditingProduct(null); form.reset(); }}
                          className="border-gray-700 text-gray-300 hover:bg-gray-800 rounded-xl h-12"
                        >
                          إلغاء
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
