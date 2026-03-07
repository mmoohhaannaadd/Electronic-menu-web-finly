"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { QrCode, Smartphone, MessageCircle, Zap, ShieldCheck } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <QrCode className="h-6 w-6 text-primary" />,
      title: "باركود QR مخصص",
      description: "احصل على رمز استجابة سريعة (QR Code) لطباعته ووضعه على طاولات مطعمك لسهولة وصول الزبائن."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-primary" />,
      title: "منيو عصري وتفاعلي",
      description: "تصميم متجاوب بالكامل يناسب جميع شاشات الجوال ويوفر تجربة تصفح تفاعلية وممتازة."
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-primary" />,
      title: "طلبات عبر واتساب",
      description: "استقبل طلبات الزبائن وتفاصيل الدفع مباشرة على رقم الواتساب الخاص بك بدون أي عمولات خفية."
    },
    {
      icon: <Zap className="h-6 w-6 text-primary" />,
      title: "لوحة تحكم فورية",
      description: "عدل أسعارك، أضف منتجات وصور جديدة، وقم بإخفاء المتاح بضغطة زر تنعكس فوراً للمستخدمين."
    }
  ];

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20" dir="rtl">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
              <QrCode className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tight flex items-center gap-1">
              منيو <span className="text-primary">طيارة</span>
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/admin/login" className="hidden px-2 py-2 text-sm font-bold text-muted transition hover:text-foreground sm:block">
              تسجيل الدخول
            </Link>
            <Link href="/admin/login" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 hover:scale-105 active:scale-95">
              ابدأ الآن مجاناً
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-24">
          {/* Background effect */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                <span>المنصة الأولى لإدارة قوائم الطعام الرقمية</span>
              </div>

              <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1] sm:leading-[1.1]">
                حول مطعمك إلى العالم <br className="hidden sm:block" />
                الرقمي في <span className="text-primary relative inline-block">
                  دقائق معدودة
                  <svg className="absolute -bottom-2 w-full h-3 text-primary/30" viewBox="0 0 100 12" preserveAspectRatio="none">
                    <path d="M0,0 Q50,12 100,0" fill="currentColor" />
                  </svg>
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted sm:text-xl">
                منصة متكاملة لإنشاء المنيو الإلكتروني الخاص بك وعرض منتجاتك. استقبل الطلبات عبر WhatsApp مباشرة واسمح لزبائنك بتصفح قائمة طعام تفاعلية بسهولة.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/admin/setup" className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-base font-bold text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 hover:-translate-y-1">
                  <Zap className="h-5 w-5" />
                  أنشئ منيو مطعمك وتفوق
                </Link>
                <Link href="/admin/login" className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border-2 border-border bg-surface px-8 py-4 text-base font-bold transition-all hover:border-primary/50 hover:bg-muted/10">
                  لدي حساب مسبقاً
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-surface/50 border-y border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">كل ما تحتاجه لإدارة طلباتك بنجاح</h2>
              <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">أدوات قوية وسهلة الاستخدام مصممة لمساعدة المطاعم والمقاهي على النمو وتقديم تجربة حجز عصرية.</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group rounded-3xl border border-border/50 bg-background p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30"
                >
                  <div className="mb-5 inline-block rounded-2xl bg-primary/10 p-4 transition-transform group-hover:scale-110 group-hover:bg-primary/20">
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted leading-relaxed text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="rounded-[2.5rem] bg-primary px-6 py-16 sm:px-20 sm:py-24 relative overflow-hidden text-white shadow-2xl shadow-primary/20">
              {/* Decorative shapes */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-80 w-80 rounded-full bg-black/10 blur-3xl"></div>

              <div className="relative z-10 text-center max-w-4xl mx-auto">
                <h2 className="text-3xl font-black sm:text-5xl mb-6 leading-tight">جاهز للانطلاق؟ <br />ابدأ في 3 خطوات بسيطة فقط!</h2>

                <div className="grid gap-12 sm:grid-cols-3 mt-16 text-center text-white/90">
                  <div className="space-y-5 relative">
                    <div className="hidden sm:block absolute top-8 left-0 right-0 h-0.5 w-[calc(100%-4rem)] mx-auto bg-white/20 -z-10"></div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-primary shadow-lg">1</div>
                    <h3 className="font-bold text-2xl text-white">سجل حسابك</h3>
                    <p className="text-base text-white/80">أدخل تفاصيل وموقع مطعمك ورقم الواتساب الخاص باستقبال الطلبات</p>
                  </div>
                  <div className="space-y-5 relative">
                    <div className="hidden sm:block absolute top-8 left-0 right-0 h-0.5 w-[calc(100%-4rem)] mx-auto bg-white/20 -z-10"></div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-primary shadow-lg">2</div>
                    <h3 className="font-bold text-2xl text-white">أضف منتجاتك</h3>
                    <p className="text-base text-white/80">ارفع صور الوجبات، الأسعار، والتصنيفات في لوحة تحكم سهلة جداً</p>
                  </div>
                  <div className="space-y-5 relative">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl font-black text-primary shadow-lg">3</div>
                    <h3 className="font-bold text-2xl text-white">اطبع الباركود</h3>
                    <p className="text-base text-white/80">شارك رابط المنيو أو اطبع الـ QR Code لعملائك ليطلبوا مباشرة لطاولاتهم!</p>
                  </div>
                </div>

                <div className="mt-16">
                  <Link href="/admin/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-10 py-4 text-lg font-bold text-primary shadow-xl transition-all hover:bg-white/90 hover:scale-105 active:scale-95">
                    الاشتراك مجاني بالكامل 🎉
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-background py-10 text-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2 font-black text-foreground text-xl">
              <QrCode className="h-6 w-6 text-primary" />
              منيو <span className="text-primary">طيارة</span>
            </div>
            <p className="text-sm font-medium">جميع الحقوق محفوظة &copy; {new Date().getFullYear()} - تم الصنع في 🌍 للجميع.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
