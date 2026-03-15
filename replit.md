# Zora Bio | متجر مكملات غذائية - الجزائر

## نظرة عامة
متجر إلكتروني جزائري كامل بالعربية RTL لبيع المكملات الغذائية.
مبني بـ React + Express.js مع قاعدة بيانات MySQL عبر Drizzle ORM.
العملة: دج (الدينار الجزائري). البلد المستهدف: الجزائر.

## الميزات

### المتجر (للزوار)
- **الصفحة الرئيسية** (`/`): Hero متحرك، فئات، منتجات مميزة، تقييمات جزائرية، بانر عروض
- **صفحة المنتجات** (`/products`): فلتر الفئات، البحث، ترتيب حسب السعر/التقييم
- **صفحة المنتج** (`/products/:id`): تفاصيل + **نموذج طلب مباشر** (الاسم + الهاتف + الولاية + نوع التوصيل)
- **Landing Page** (`/landing/:id`): صفحة تسويقية مخصصة لكل منتج للإعلانات

### نموذج الطلب
- **الاسم + الهاتف + الولاية + نوع التوصيل (منزل/مكتب)**
- **دفع عند الاستلام**: لا بطاقة مطلوبة
- **لا يوجد سلة تسوق**: الطلب مباشرة من صفحة المنتج
- **أسعار توصيل حسب الولاية**: 58 ولاية بأسعار مختلفة للمنزل والمكتب

### لوحة الإدارة (`/admin`)
- **لوحة التحكم**: إحصائيات إيرادات بالدج، رسوم بيانية، آخر الطلبات
- **إدارة المنتجات**: CRUD + تفعيل Landing Page لكل منتج + hook + مميزات
- **إدارة الطلبات**: عرض + تحديث الحالة + تعيين مؤكد + تعديل كامل (الاسم، الهاتف، الولاية، الكمية، الملاحظات)
- **أسعار التوصيل** (`/admin/delivery`): إدارة أسعار التوصيل لكل ولاية
- **إعدادات البيكسل** (`/admin/settings`): Facebook Pixel ID + TikTok Pixel ID
- **إدارة المؤكدين** (`/admin/confirmateurs`): CRUD + إحصائيات لكل مؤكد

### المصادقة
- **الأدمن** (`admin` / `admin2026`): وصول كامل
- **المؤكد**: وصول للطلبات المعيّنة له فقط (`/confirmateur/orders`)
- **express-session** مع SHA-256 password hashing

## Stack التقني
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion, TanStack Query, Wouter
- **Backend**: Express.js, TypeScript
- **Database**: MySQL (Drizzle ORM) — متوافق مع phpMyAdmin
- **UI**: Shadcn/UI, Lucide icons, Recharts
- **Language**: Arabic (RTL), Cairo/Tajawal fonts
- **Deployment**: PM2 + CyberPanel (OpenLiteSpeed reverse proxy)

## هيكل الملفات
- `shared/schema.ts` - Drizzle MySQL schema: users, products, orders, categories + types + delivery prices
- `server/db.ts` - MySQL connection via mysql2/promise pool
- `server/storage.ts` - DatabaseStorage class (CRUD) + seedDatabase + hashPassword
- `server/routes.ts` - REST API routes + auth middleware
- `server/index.ts` - Express setup + session + logging
- `drizzle.config.ts` - Drizzle Kit config (MySQL dialect)
- `ecosystem.config.js` - PM2 production config
- `DEPLOY.md` - دليل النشر الكامل على CyberPanel

## API Endpoints
- `GET /api/products` - قائمة المنتجات
- `GET/POST /api/products/:id` - منتج واحد / تحديث
- `DELETE /api/products/:id` - حذف منتج
- `GET /api/categories` - الفئات
- `GET /api/orders` - الطلبات
- `POST /api/orders` - إنشاء طلب جديد
- `PATCH /api/orders/:id` - تحديث طلب (الاسم، الهاتف، الولاية، الحالة، الملاحظات...)
- `PATCH /api/orders/:id/status` - تحديث حالة الطلب
- `POST /api/orders/:id/assign` - تعيين مؤكد للطلب
- `GET /api/stats` - إحصائيات الإدارة
- `GET/PATCH /api/settings` - إعدادات البيكسل وأسعار التوصيل
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - المستخدم الحالي
- `POST /api/auth/logout` - تسجيل الخروج
- `GET/POST/PUT/DELETE /api/confirmateurs` - إدارة المؤكدين

## ألوان التصميم
- Store: White with emerald/teal gradient hero
- Admin: Dark (gray-950)
- Brand: Emerald/teal throughout
- Animations: Framer Motion
