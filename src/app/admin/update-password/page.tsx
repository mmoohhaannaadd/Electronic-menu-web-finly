"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function EyeIcon({ open }: { open: boolean }) {
    if (open) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        );
    }
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
    );
}

function LoaderIcon() {
    return (
        <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
    );
}

export default function UpdatePasswordPage() {
    const router = useRouter();
    const supabase = createClient();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!password || password.length < 6) {
            setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
            return;
        }
        if (password !== confirmPassword) {
            setError("كلمتا المرور غير متطابقتين");
            return;
        }

        setIsLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        setIsLoading(false);

        if (updateError) {
            setError(updateError.message === "Auth session missing!"
                ? "انتهت صلاحية الرابط، يرجى طلب رابط جديد من صفحة تسجيل الدخول."
                : updateError.message);
            return;
        }

        setSuccess(true);
        setTimeout(() => router.push("/admin/dashboard"), 2000);
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            dir="rtl"
            style={{
                background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 50%, #16213e 100%)",
            }}
        >
            <div className="w-full max-w-md">
                {/* Card */}
                <div
                    className="rounded-3xl p-8 shadow-2xl"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">تعيين كلمة مرور جديدة</h1>
                        <p className="text-gray-400 text-sm">أدخل كلمة مرور قوية لحماية حسابك</p>
                    </div>

                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <p className="text-green-400 font-bold text-lg">تم تغيير كلمة المرور بنجاح!</p>
                            <p className="text-gray-400 text-sm">جاري توجيهك إلى لوحة التحكم...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* New Password */}
                            <div>
                                <label htmlFor="new-password" className="block text-sm font-semibold text-gray-300 mb-1.5">
                                    كلمة المرور الجديدة
                                </label>
                                <div className="relative">
                                    <input
                                        id="new-password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-sm text-white pe-12 outline-none transition-all"
                                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                        tabIndex={-1}
                                    >
                                        <EyeIcon open={showPassword} />
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-semibold text-gray-300 mb-1.5">
                                    تأكيد كلمة المرور
                                </label>
                                <div className="relative">
                                    <input
                                        id="confirm-password"
                                        type={showConfirm ? "text" : "password"}
                                        autoComplete="new-password"
                                        required
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-sm text-white pe-12 outline-none transition-all"
                                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                        tabIndex={-1}
                                    >
                                        <EyeIcon open={showConfirm} />
                                    </button>
                                </div>
                                {confirmPassword && (
                                    <p className={`text-xs mt-1 font-medium ${password === confirmPassword ? "text-green-400" : "text-red-400"}`}>
                                        {password === confirmPassword ? "✓ كلمتا المرور متطابقتان" : "✗ كلمتا المرور غير متطابقتين"}
                                    </p>
                                )}
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                                style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
                            >
                                {isLoading ? <LoaderIcon /> : "حفظ كلمة المرور الجديدة"}
                            </button>

                            {/* Back Link */}
                            <p className="text-center text-sm text-gray-500">
                                <a href="/admin/login" className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
                                    ← العودة لتسجيل الدخول
                                </a>
                            </p>
                        </form>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-600 mt-6">
                    منيو رقمي — Digital Menu
                </p>
            </div>
        </div>
    );
}
