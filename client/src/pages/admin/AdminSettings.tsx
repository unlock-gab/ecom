import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Settings, Save, Loader2, Facebook, Video, Eye, EyeOff, CheckCircle, Code, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AdminSettings() {
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);

  const { data: settings = {}, isLoading } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
  });

  const [fbPixelId, setFbPixelId] = useState("");
  const [ttPixelId, setTtPixelId] = useState("");
  const [showFb, setShowFb] = useState(false);
  const [showTt, setShowTt] = useState(false);

  useState(() => {
    if (settings.facebookPixelId) setFbPixelId(settings.facebookPixelId);
    if (settings.tiktokPixelId) setTtPixelId(settings.tiktokPixelId);
  });

  const { data: freshSettings } = useQuery<Record<string, string>>({
    queryKey: ["/api/settings"],
    select: (data) => {
      if (data.facebookPixelId && !fbPixelId) setFbPixelId(data.facebookPixelId);
      if (data.tiktokPixelId && !ttPixelId) setTtPixelId(data.tiktokPixelId);
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("PATCH", "/api/settings", {
        facebookPixelId: fbPixelId,
        tiktokPixelId: ttPixelId,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({ title: "تم الحفظ ✓", description: "تم تحديث إعدادات البيكسل بنجاح" });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل حفظ الإعدادات", variant: "destructive" });
    },
  });

  const pixelSections = [
    {
      title: "Facebook Pixel",
      subtitle: "تتبع التحويلات من إعلانات فيسبوك وإنستغرام",
      icon: Facebook,
      color: "from-blue-600 to-blue-700",
      bgLight: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      placeholder: "مثال: 123456789012345",
      value: fbPixelId,
      setValue: setFbPixelId,
      show: showFb,
      setShow: setShowFb,
      fieldId: "fb-pixel",
      description: "أدخل معرّف Facebook Pixel الخاص بك من مدير الأعمال",
    },
    {
      title: "TikTok Pixel",
      subtitle: "تتبع التحويلات من إعلانات تيك توك",
      icon: Video,
      color: "from-gray-800 to-gray-900",
      bgLight: "bg-gray-50",
      borderColor: "border-gray-200",
      textColor: "text-gray-700",
      placeholder: "مثال: C4XXXXXXXXXXXXXXXXXX",
      value: ttPixelId,
      setValue: setTtPixelId,
      show: showTt,
      setShow: setShowTt,
      fieldId: "tt-pixel",
      description: "أدخل معرّف TikTok Pixel الخاص بك من TikTok Ads Manager",
    },
  ];

  return (
    <div className="p-6 md:p-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">إعدادات التتبع</h1>
            <p className="text-gray-400 text-sm">ربط المتجر مع أكواد البيكسل لتتبع الإعلانات</p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-2xl space-y-6">
        {pixelSections.map((section, index) => (
          <motion.div
            key={section.fieldId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${section.color} p-4`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">{section.title}</h2>
                  <p className="text-white/70 text-xs">{section.subtitle}</p>
                </div>
                {section.value && (
                  <div className="mr-auto flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-white text-xs font-medium">مُفعَّل</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5">
              <p className="text-gray-400 text-sm mb-4">{section.description}</p>
              <div className="space-y-2">
                <Label className="text-gray-300 font-semibold text-sm">معرّف البيكسل (Pixel ID)</Label>
                <div className="relative">
                  <Input
                    id={section.fieldId}
                    type={section.show ? "text" : "password"}
                    value={section.value}
                    onChange={e => section.setValue(e.target.value)}
                    placeholder={section.placeholder}
                    className="bg-gray-900 border-gray-600 text-white placeholder-gray-500 focus:border-violet-500 pr-12 h-12 rounded-xl font-mono text-sm"
                    data-testid={`input-${section.fieldId}`}
                  />
                  <button
                    type="button"
                    onClick={() => section.setShow(!section.show)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {section.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {section.value && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4">
                  <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Code className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400 text-xs font-medium">الكود المُدمج في الموقع</span>
                    </div>
                    <code className="text-xs text-emerald-400 font-mono break-all leading-relaxed">
                      {section.fieldId === "fb-pixel"
                        ? `<!-- Facebook Pixel -->\n<!-- fbq('init', '${section.value}'); -->`
                        : `<!-- TikTok Pixel -->\n<!-- ttq.load('${section.value}'); -->`}
                    </code>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-gray-800 rounded-2xl border border-gray-700 p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-bold mb-2">كيف يعمل البيكسل؟</h3>
              <ul className="text-gray-400 text-sm space-y-1.5 list-disc list-inside">
                <li>يتتبع البيكسل زوار موقعك ويسجل تصرفاتهم</li>
                <li>يساعدك في قياس نتائج حملاتك الإعلانية</li>
                <li>يمكّنك من إنشاء جمهور مخصص لإعلاناتك</li>
                <li>يحسّن توصيل إعلاناتك للجمهور المناسب</li>
              </ul>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="w-full h-13 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 text-white font-bold rounded-xl text-base h-12 shadow-lg shadow-violet-500/20"
            data-testid="button-save-settings"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الحفظ...</>
            ) : saved ? (
              <><CheckCircle className="w-4 h-4 ml-2 text-emerald-300" /> تم الحفظ بنجاح!</>
            ) : (
              <><Save className="w-4 h-4 ml-2" /> حفظ الإعدادات</>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
