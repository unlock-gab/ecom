# متجر نوفا | Nova Store - الجزائر

## نظرة عامة
متجر إلكتروني جزائري كامل بالعربية RTL. مبني بـ React + Express.js مع تخزين في الذاكرة.
العملة: دج (الدينار الجزائري). البلد المستهدف: الجزائر.

## الميزات

### المتجر (للزوار)
- **الصفحة الرئيسية** (`/`): Hero متحرك، فئات، منتجات مميزة، تقييمات جزائرية، بانر عروض
- **صفحة المنتجات** (`/products`): فلتر الفئات، البحث، ترتيب حسب السعر/التقييم
- **صفحة المنتج** (`/products/:id`): تفاصيل + **نموذج طلب مباشر** (الاسم + الهاتف + الولاية)
- **Landing Page** (`/landing/:id`): صفحة تسويقية مخصصة لكل منتج للإعلانات

### نموذج الطلب
- **3 حقول فقط**: الاسم الكامل + رقم الهاتف + الولاية (58 ولاية جزائرية)
- **دفع عند الاستلام**: لا بطاقة مطلوبة
- **لا يوجد سلة تسوق**: الطلب مباشرة من صفحة المنتج

### لوحة الإدارة (`/admin`)
- **لوحة التحكم**: إحصائيات إيرادات بالدج، رسوم بيانية، آخر الطلبات
- **إدارة المنتجات**: CRUD + تفعيل Landing Page لكل منتج + hook + مميزات
- **إدارة الطلبات**: عرض حسب الولاية، الهاتف، اسم المنتج، تحديث الحالة
- **إعدادات البيكسل** (`/admin/settings`): Facebook Pixel ID + TikTok Pixel ID

## الولايات الجزائرية
58 ولاية رسمية من أدرار إلى المنيعة في `ALGERIAN_WILAYAS` من `shared/schema.ts`

## Stack التقني
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Wouter
- **Backend**: Express.js, TypeScript, In-memory storage
- **UI**: Shadcn/UI, Lucide icons, Recharts
- **Language**: Arabic (RTL), Cairo/Tajawal fonts

## هيكل الملفات
- `shared/schema.ts` - Types: Product, Order, Category, ALGERIAN_WILAYAS
- `server/storage.ts` - In-memory storage + getSettings/updateSettings
- `server/routes.ts` - REST API + /api/settings endpoint
- `client/src/pages/ProductDetail.tsx` - نموذج الطلب مدمج مباشرة
- `client/src/pages/ProductLanding.tsx` - Landing page تسويقية
- `client/src/pages/admin/AdminSettings.tsx` - إعدادات Facebook/TikTok Pixel
- `client/src/pages/admin/AdminLayout.tsx` - Layout إداري مع 4 قوائم
- `client/src/components/Navbar.tsx` - بدون سلة تسوق
- `client/src/components/ProductCard.tsx` - "اطلب الآن" بدلاً من "أضف للسلة"

## API Endpoints
- `GET /api/products` - قائمة المنتجات
- `GET/POST /api/products/:id` - منتج واحد
- `GET /api/categories` - الفئات
- `GET /api/orders` - الطلبات
- `POST /api/orders` - إنشاء طلب جديد (يتضمن: customerName, customerPhone, wilaya, productId...)
- `PATCH /api/orders/:id/status` - تحديث حالة الطلب
- `GET /api/stats` - إحصائيات الإدارة
- `GET/PATCH /api/settings` - إعدادات البيكسل

## ألوان التصميم
- Primary: Violet/Purple (#7c3aed)
- Accent: Fuchsia/Pink
- Admin: Dark (gray-950)
- Animations: Framer Motion
