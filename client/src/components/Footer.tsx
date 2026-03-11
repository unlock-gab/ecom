import { Link } from "wouter";
import { Zap, Heart, Phone, Mail, MapPin, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <Link href="/">
              <div className="flex items-center gap-2 mb-4 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                  نوفا
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              متجرك الإلكتروني المتميز للتسوق بأفضل الأسعار وأرقى المنتجات. نوصل لك كل ما تحتاج بسرعة وأمان.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.2, y: -2 }}
                  className="w-9 h-9 bg-gray-800 hover:bg-gradient-to-br hover:from-violet-600 hover:to-fuchsia-600 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
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
                { label: "المنتجات", href: "/products" },
                { label: "العروض", href: "/products?badge=sale" },
                { label: "الأكثر مبيعاً", href: "/products?featured=true" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-gray-400 hover:text-violet-400 cursor-pointer transition-colors hover:pr-1 transition-all">
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
                { label: "إلكترونيات", href: "/products?category=electronics" },
                { label: "أزياء وملابس", href: "/products?category=fashion" },
                { label: "الجمال والعناية", href: "/products?category=beauty" },
                { label: "الرياضة", href: "/products?category=sports" },
                { label: "المنزل", href: "/products?category=home" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>
                    <span className="text-sm text-gray-400 hover:text-violet-400 cursor-pointer transition-colors">
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
                <Phone className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span>0555 123 456</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-violet-400 flex-shrink-0" />
                <span>support@nova-store.dz</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
                <span>الجزائر العاصمة، الجزائر</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © 2026 متجر نوفا. جميع الحقوق محفوظة.
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            صُنع بـ <Heart className="w-4 h-4 text-red-500 fill-red-500" /> في الجزائر
          </p>
        </div>
      </div>
    </footer>
  );
}
