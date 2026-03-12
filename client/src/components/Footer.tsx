import { Link } from "wouter";
import { Heart, Phone, Mail, MapPin, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Link href="/">
              <div className="flex items-center gap-3 mb-4 cursor-pointer">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-1.5">
                  <img src="/zorabio-logo.png" alt="Zora Bio" className="h-10 w-auto" />
                </div>
                <div>
                  <div className="text-white font-black text-lg leading-none">ZORA<span className="text-emerald-400">Bio</span>®</div>
                  <div className="text-gray-500 text-xs">Compléments alimentaires</div>
                </div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              مكملات غذائية طبيعية عالية الجودة لدعم صحتك وأدائك الرياضي. نوصل لكل ولايات الجزائر.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.2, y: -2 }}
                  className="w-9 h-9 bg-gray-800 hover:bg-gradient-to-br hover:from-emerald-600 hover:to-teal-600 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-5 text-base">روابط سريعة</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "الرئيسية", href: "/" },
                { label: "منتجاتنا", href: "/products" },
                { label: "العروض", href: "/products?badge=promo" },
                { label: "الأكثر مبيعاً", href: "/products?featured=true" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-gray-400 hover:text-emerald-400 cursor-pointer transition-all">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-5 text-base">التصنيفات</h4>
            <ul className="flex flex-col gap-3">
              {[
                { label: "بروتين وأمينو", href: "/products?category=protein" },
                { label: "فيتامينات ومعادن", href: "/products?category=vitamins" },
                { label: "تخسيس وحرق الدهون", href: "/products?category=weightloss" },
                { label: "طاقة وأداء", href: "/products?category=energy" },
                { label: "صحة عامة", href: "/products?category=health" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-gray-400 hover:text-emerald-400 cursor-pointer transition-all">
                      {link.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-5 text-base">تواصل معنا</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>0555 123 456</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>contact@zorabio.dz</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>الجزائر العاصمة، الجزائر</span>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-emerald-400 text-xs font-medium mb-1">الدفع عند الاستلام</p>
              <p className="text-gray-500 text-xs">لجميع ولايات الجزائر الـ 58</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2026 ZORA Bio® | Compléments alimentaires. جميع الحقوق محفوظة.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            صُنع بـ <Heart className="w-4 h-4 text-red-500 fill-red-500 mx-1" /> في الجزائر
          </p>
        </div>
      </div>
    </footer>
  );
}
