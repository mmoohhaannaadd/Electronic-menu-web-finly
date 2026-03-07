"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SetupPage() {
    const router = useRouter();
    const supabase = createClient();

    const [form, setForm] = useState({ name: "", slug: "", whatsapp_number: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/admin/login"); return; }

        const slug = form.slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        if (!slug) { setError("الرابط يجب أن يحتوي على أحرف إنجليزية"); setLoading(false); return; }

        const { error: err } = await supabase.from("restaurants").insert({
            owner_id: user.id,
            name: form.name,
            slug,
            whatsapp_number: form.whatsapp_number,
        });

        setLoading(false);
        if (err) {
            if (err.code === "23505") setError("هذا الرابط مستخدم بالفعل، جرب اسماً آخر");
            else setError(err.message);
        } else {
            router.push("/admin/dashboard");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12" dir="rtl">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-4xl">
                        🍽️
                    </div>
                    <h1 className="text-3xl font-bold">أهلاً! نبدأ معاً</h1>
                    <p className="mt-2 text-muted">أخبرنا عن مطعمك لننشئ منيوك الرقمي</p>
                </div>

                <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-surface p-8 soft-shadow space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-muted">اسم المطعم *</label>
                        <input
                            required
                            value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                            placeholder="مثال: ذا برجر لاب"
                            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-muted">رابط المنيو (بالإنجليزية) *</label>
                        <div className="mt-1 flex items-center rounded-xl border border-border bg-background focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                            <span className="px-3 text-sm text-muted">/menu/</span>
                            <input
                                required
                                value={form.slug}
                                onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
                                placeholder="burger-lab"
                                className="flex-1 bg-transparent py-3 pr-1 text-sm outline-none"
                                dir="ltr"
                            />
                        </div>
                        <p className="mt-1 text-xs text-muted">أحرف إنجليزية وأرقام وشرطة فقط – هذا رابط منيوك للعملاء</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-muted">رقم WhatsApp *</label>
                        <input
                            required
                            value={form.whatsapp_number}
                            onChange={e => setForm(p => ({ ...p, whatsapp_number: e.target.value }))}
                            placeholder="966501234567"
                            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            dir="ltr"
                        />
                        <p className="mt-1 text-xs text-muted">رمز الدولة بدون + (مثال: 966 للسعودية، 20 لمصر)</p>
                    </div>

                    {error && (
                        <div className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !form.name || !form.slug || !form.whatsapp_number}
                        className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "جاري الإنشاء..." : "إنشاء منيوي ✨"}
                    </button>
                </form>
            </div>
        </div>
    );
}
