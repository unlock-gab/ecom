# دليل نشر Zora Bio على CyberPanel (Hostinger VPS)

## المتطلبات
- VPS مع CyberPanel مثبت (Hostinger)
- Node.js 18+ مثبت على السيرفر
- PM2 مثبت (`npm install -g pm2`)
- وصول SSH للسيرفر

---

## الخطوة 1: إنشاء قاعدة بيانات MySQL

1. افتح **CyberPanel** → **Databases** → **Create Database**
2. أنشئ قاعدة بيانات جديدة:
   - Database Name: `zorabio`
   - Database User: `zorabio_user`
   - Password: (اختر كلمة مرور قوية)
3. دوّن معلومات الاتصال

---

## الخطوة 2: رفع المشروع

```bash
# عبر SSH، انتقل لمجلد الموقع
cd /home/yourdomain/public_html

# ارفع ملفات المشروع (Git أو SCP أو FileManager)
git clone <your-repo-url> .
# أو انسخ الملفات يدوياً

# تثبيت التبعيات
npm install
```

---

## الخطوة 3: إعداد ملف البيئة

```bash
# أنشئ ملف .env
cp .env.example .env
nano .env
```

عدّل المتغيرات:
```
DATABASE_URL=mysql://zorabio_user:YOUR_PASSWORD@localhost:3306/zorabio
SESSION_SECRET=اكتب-مفتاح-سري-طويل-هنا
PORT=5000
NODE_ENV=production
```

---

## الخطوة 4: بناء المشروع وإنشاء الجداول

```bash
# بناء الفرونت إند والباك إند
npm run build

# إنشاء جداول قاعدة البيانات
npm run db:push
```

هذا سينشئ جداول: `users`, `categories`, `products`, `orders` في MySQL.
عند أول تشغيل، سيُنشأ حساب الأدمن تلقائياً وبيانات تجريبية.

---

## الخطوة 5: تشغيل التطبيق بـ PM2

```bash
# تشغيل التطبيق
pm2 start ecosystem.config.js

# التأكد من أنه يعمل
pm2 status
pm2 logs zorabio

# حفظ الإعداد لإعادة التشغيل التلقائي
pm2 save
pm2 startup
```

---

## الخطوة 6: إعداد Reverse Proxy في OpenLiteSpeed

1. افتح **CyberPanel** → **Websites** → **List Websites** → اختر موقعك
2. اذهب إلى **vHost Conf**
3. في قسم **External App**، أضف:

```
extprocessor zorabio {
  type                    proxy
  address                 127.0.0.1:5000
  maxConns                100
  initTimeout             60
  retryTimeout            0
  respBuffer              0
}
```

4. في قسم **Context**، أضف:

```
context / {
  type                    proxy
  handler                 zorabio
  addDefaultCharset       off
}
```

5. أعد تشغيل OpenLiteSpeed:
```bash
systemctl restart lsws
```

---

## الخطوة 7: إعداد SSL

1. في **CyberPanel** → **SSL** → **Issue SSL**
2. اختر موقعك واضغط **Issue**
3. سيُفعّل HTTPS تلقائياً

---

## أوامر مفيدة

```bash
# إعادة تشغيل التطبيق
pm2 restart zorabio

# مشاهدة السجلات
pm2 logs zorabio

# إيقاف التطبيق
pm2 stop zorabio

# تحديث بعد تعديل الكود
npm run build && pm2 restart zorabio
```

---

## معلومات الدخول الافتراضية

- **رابط الأدمن**: `https://yourdomain.com/admin/login`
- **اسم المستخدم**: `admin`
- **كلمة المرور**: `admin2026`

> **تنبيه**: غيّر كلمة المرور فوراً بعد أول تسجيل دخول!

---

## إدارة قاعدة البيانات عبر phpMyAdmin

1. افتح **CyberPanel** → **phpMyAdmin**
2. سجّل دخول باسم مستخدم وكلمة مرور قاعدة البيانات
3. اختر قاعدة `zorabio` لرؤية وإدارة الجداول والبيانات

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| التطبيق لا يبدأ | تحقق من `pm2 logs zorabio` |
| خطأ في قاعدة البيانات | تأكد من صحة `DATABASE_URL` في `.env` |
| الموقع لا يظهر | تأكد من إعداد Reverse Proxy وإعادة تشغيل OpenLiteSpeed |
| خطأ 502 Bad Gateway | تأكد أن التطبيق يعمل: `pm2 status` |
