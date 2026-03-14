"use client";

import { useSearchParams } from "next/navigation";
import { login, signup, resetPassword } from "./actions";
import { Suspense, useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Icons ───────────────────────────────────────────────────────────
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

function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
    );
}

function AppleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
    );
}

function FacebookIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
    );
}

function ShieldIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    );
}

function LockIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
    );
}

function ZapIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
    );
}

function LoaderIcon() {
    return (
        <svg className="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
    );
}

// ─── Password Strength ──────────────────────────────────────────────
function getPasswordStrength(password: string): { level: "weak" | "medium" | "strong"; label: string } {
    if (!password) return { level: "weak", label: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return { level: "weak", label: "ضعيفة" };
    if (score <= 4) return { level: "medium", label: "متوسطة" };
    return { level: "strong", label: "قوية" };
}

// ─── Validate Email ─────────────────────────────────────────────────
function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Side Panel ─────────────────────────────────────────────────────
function SidePanel() {
    const features = [
        { icon: <ShieldIcon />, title: "حماية متقدمة", desc: "تشفير SSL 256-bit لجميع البيانات" },
        { icon: <LockIcon />, title: "مصادقة ثنائية", desc: "طبقة حماية إضافية لحسابك" },
        { icon: <ZapIcon />, title: "أداء عالي", desc: "لوحة تحكم سريعة وسلسة" },
    ];

    return (
        <div className="auth-side-panel hidden lg:flex lg:w-[420px] flex-col justify-between p-10 rounded-l-3xl">
            <div>
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                        <ZapIcon />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">منيو رقمي</h1>
                        <p className="text-xs text-gray-400">Digital Menu</p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-3 leading-relaxed">
                    أدِر مطعمك بذكاء
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-10">
                    منصة رقمية متكاملة لإدارة المنيو، الطلبات، والعملاء — بكل سهولة وأمان.
                </p>

                <div className="space-y-5">
                    {features.map((f, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.15 }}
                            className="flex items-start gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                                {f.icon}
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">{f.title}</p>
                                <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
                <span className="security-badge text-[10px] font-bold px-2.5 py-1 rounded-full">SSL</span>
                <span className="security-badge text-[10px] font-bold px-2.5 py-1 rounded-full">GDPR</span>
                <span className="security-badge text-[10px] font-bold px-2.5 py-1 rounded-full">🔒 اتصال آمن</span>
            </div>
        </div>
    );
}

// ─── OTP Section ────────────────────────────────────────────────────
function OTPSection({ onBack }: { onBack: () => void }) {
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);
        const nextEmpty = newOtp.findIndex(d => !d);
        inputsRef.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                    <LockIcon />
                </div>
                <h3 className="text-xl font-bold text-white">المصادقة الثنائية</h3>
                <p className="text-gray-400 text-sm">أدخل الرمز المكوّن من 6 أرقام المُرسل لبريدك</p>
            </div>

            <div className="flex justify-center gap-2.5" dir="ltr" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                    <input
                        key={i}
                        ref={el => { inputsRef.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        className={`otp-input ${digit ? 'filled' : ''}`}
                        autoComplete="one-time-code"
                    />
                ))}
            </div>

            <button className="auth-submit-btn w-full py-3.5 rounded-xl text-sm" disabled={otp.some(d => !d)}>
                تأكيد الرمز
            </button>

            <div className="flex items-center justify-between text-xs">
                <button onClick={onBack} className="text-orange-400 hover:text-orange-300 transition-colors font-medium">
                    ← العودة لتسجيل الدخول
                </button>
                <button className="text-gray-500 hover:text-gray-400 transition-colors">
                    إعادة إرسال الرمز
                </button>
            </div>
        </motion.div>
    );
}

// ─── Login Form ─────────────────────────────────────────────────────
function LoginForm({ serverError, serverMessage }: { serverError: string | null; serverMessage: string | null }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    const validate = useCallback(() => {
        let valid = true;
        if (!email) { setEmailError("البريد الإلكتروني مطلوب"); valid = false; }
        else if (!isValidEmail(email)) { setEmailError("صيغة البريد الإلكتروني غير صحيحة"); valid = false; }
        else setEmailError("");

        if (!password) { setPasswordError("كلمة المرور مطلوبة"); valid = false; }
        else if (password.length < 6) { setPasswordError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); valid = false; }
        else setPasswordError("");

        return valid;
    }, [email, password]);

    const handleSubmit = async (formData: FormData) => {
        if (!validate()) return;
        setIsLoading(true);
        try {
            await login(formData);
        } catch {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (formData: FormData) => {
        setResetLoading(true);
        try {
            await resetPassword(formData);
        } catch {
            setResetLoading(false);
        }
    };

    return (
        <AnimatePresence mode="wait">
            {showOtp ? (
                <OTPSection key="otp" onBack={() => setShowOtp(false)} />
            ) : showForgotPassword ? (
                <motion.div
                    key="forgot"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-5"
                >
                    <div className="text-center">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
                            <LockIcon />
                        </div>
                        <h3 className="text-lg font-bold text-white">استعادة كلمة المرور</h3>
                        <p className="text-gray-400 text-sm mt-1">أدخل بريدك وسنرسل لك رابط إعادة التعيين</p>
                    </div>

                    {serverMessage && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-xl text-center">
                            {serverMessage}
                        </motion.p>
                    )}
                    {serverError && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-center">
                            {serverError}
                        </motion.p>
                    )}

                    <form action={handleResetPassword} className="space-y-4">
                        <div>
                            <label htmlFor="reset-email" className="block text-sm font-semibold text-gray-300 mb-1.5">البريد الإلكتروني</label>
                            <input
                                id="reset-email"
                                name="email"
                                type="email"
                                required
                                value={resetEmail}
                                onChange={e => setResetEmail(e.target.value)}
                                className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                                placeholder="example@restaurant.com"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={resetLoading || !resetEmail}
                            className="auth-submit-btn w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
                        >
                            {resetLoading ? <LoaderIcon /> : "إرسال رابط إعادة التعيين"}
                        </button>
                    </form>

                    <button
                        type="button"
                        onClick={() => setShowForgotPassword(false)}
                        className="w-full text-center text-orange-400 hover:text-orange-300 transition-colors text-sm font-medium"
                    >
                        ← العودة لتسجيل الدخول
                    </button>
                </motion.div>
            ) : (
                <motion.div
                    key="login"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    {/* Social Login */}
                    <div className="space-y-2.5 mb-6">
                        <button type="button" className="social-btn w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium">
                            <GoogleIcon />
                            <span>المتابعة مع Google</span>
                        </button>
                        <div className="flex gap-2.5">
                            <button type="button" className="social-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium">
                                <AppleIcon />
                                <span>Apple</span>
                            </button>
                            <button type="button" className="social-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium">
                                <FacebookIcon />
                                <span>Facebook</span>
                            </button>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="text-xs text-gray-500 font-medium">أو عبر البريد الإلكتروني</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    <form action={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-semibold text-gray-300 mb-1.5">البريد الإلكتروني</label>
                            <input
                                id="login-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                                className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                                placeholder="example@restaurant.com"
                            />
                            {emailError && <p className="error-msg text-red-400 text-xs mt-1.5 font-medium">{emailError}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-semibold text-gray-300 mb-1.5">كلمة المرور</label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); if (passwordError) setPasswordError(""); }}
                                    className="auth-input w-full px-4 py-3 rounded-xl text-sm pe-12"
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
                            {passwordError && <p className="error-msg text-red-400 text-xs mt-1.5 font-medium">{passwordError}</p>}
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="auth-checkbox" name="remember" />
                                <span className="text-gray-400 text-xs">تذكّرني</span>
                            </label>
                            <button type="button" onClick={() => setShowForgotPassword(true)} className="text-orange-400 hover:text-orange-300 transition-colors text-xs font-medium">
                                نسيت كلمة المرور؟
                            </button>
                        </div>

                        {/* Server Error */}
                        {serverError && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center"
                            >
                                {serverError}
                            </motion.p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="auth-submit-btn w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? <LoaderIcon /> : "تسجيل الدخول"}
                        </button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Sign Up Form ───────────────────────────────────────────────────
function SignUpForm({ serverError, serverMessage }: { serverError: string | null; serverMessage: string | null }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [newsletter, setNewsletter] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const strength = getPasswordStrength(password);
    const passwordsMatch = confirmPassword ? password === confirmPassword : true;

    const validate = useCallback(() => {
        const e: Record<string, string> = {};
        if (!firstName.trim()) e.firstName = "الاسم الأول مطلوب";
        if (!lastName.trim()) e.lastName = "اسم العائلة مطلوب";
        if (!email) e.email = "البريد الإلكتروني مطلوب";
        else if (!isValidEmail(email)) e.email = "صيغة البريد الإلكتروني غير صحيحة";
        if (!password) e.password = "كلمة المرور مطلوبة";
        else if (password.length < 6) e.password = "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
        if (!confirmPassword) e.confirmPassword = "تأكيد كلمة المرور مطلوب";
        else if (password !== confirmPassword) e.confirmPassword = "كلمات المرور غير متطابقة";
        if (!agreedTerms) e.terms = "يجب الموافقة على شروط الاستخدام";
        setErrors(e);
        return Object.keys(e).length === 0;
    }, [firstName, lastName, email, password, confirmPassword, agreedTerms]);

    const handleSubmit = async (formData: FormData) => {
        if (!validate()) return;
        setIsLoading(true);
        formData.set("firstName", firstName);
        formData.set("lastName", lastName);
        formData.set("phone", phone);
        formData.set("newsletter", newsletter ? "true" : "false");
        try {
            await signup(formData);
        } catch {
            setIsLoading(false);
        }
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Social Sign Up */}
            <div className="flex gap-2.5 mb-6">
                <button type="button" className="social-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium">
                    <GoogleIcon />
                    <span>Google</span>
                </button>
                <button type="button" className="social-btn flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium">
                    <AppleIcon />
                    <span>Apple</span>
                </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-xs text-gray-500 font-medium">أو عبر البريد الإلكتروني</span>
                <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <form action={handleSubmit} className="space-y-3.5">
                {/* Names Row */}
                <div className="flex gap-3">
                    <div className="flex-1">
                        <label htmlFor="signup-first" className="block text-sm font-semibold text-gray-300 mb-1.5">الاسم الأول</label>
                        <input
                            id="signup-first"
                            name="firstName"
                            type="text"
                            autoComplete="given-name"
                            value={firstName}
                            onChange={e => { setFirstName(e.target.value); clearError("firstName"); }}
                            className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                            placeholder="محمد"
                        />
                        {errors.firstName && <p className="error-msg text-red-400 text-xs mt-1 font-medium">{errors.firstName}</p>}
                    </div>
                    <div className="flex-1">
                        <label htmlFor="signup-last" className="block text-sm font-semibold text-gray-300 mb-1.5">اسم العائلة</label>
                        <input
                            id="signup-last"
                            name="lastName"
                            type="text"
                            autoComplete="family-name"
                            value={lastName}
                            onChange={e => { setLastName(e.target.value); clearError("lastName"); }}
                            className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                            placeholder="العلي"
                        />
                        {errors.lastName && <p className="error-msg text-red-400 text-xs mt-1 font-medium">{errors.lastName}</p>}
                    </div>
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="signup-email" className="block text-sm font-semibold text-gray-300 mb-1.5">البريد الإلكتروني</label>
                    <input
                        id="signup-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={e => { setEmail(e.target.value); clearError("email"); }}
                        className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                        placeholder="example@restaurant.com"
                    />
                    {errors.email && <p className="error-msg text-red-400 text-xs mt-1 font-medium">{errors.email}</p>}
                    {email && isValidEmail(email) && !errors.email && (
                        <p className="text-green-400 text-xs mt-1 font-medium">✓ البريد الإلكتروني صحيح</p>
                    )}
                </div>

                {/* Phone (optional) */}
                <div>
                    <label htmlFor="signup-phone" className="block text-sm font-semibold text-gray-300 mb-1.5">
                        رقم الهاتف <span className="text-gray-500 font-normal">(اختياري)</span>
                    </label>
                    <input
                        id="signup-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="auth-input w-full px-4 py-3 rounded-xl text-sm"
                        placeholder="+966 5XX XXX XXXX"
                        dir="ltr"
                    />
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="signup-password" className="block text-sm font-semibold text-gray-300 mb-1.5">كلمة المرور</label>
                    <div className="relative">
                        <input
                            id="signup-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={e => { setPassword(e.target.value); clearError("password"); }}
                            className="auth-input w-full px-4 py-3 rounded-xl text-sm pe-12"
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
                    {errors.password && <p className="error-msg text-red-400 text-xs mt-1 font-medium">{errors.password}</p>}
                    {/* Strength meter */}
                    {password && (
                        <div className="mt-2">
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className={`strength-bar strength-${strength.level}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: strength.level === "weak" ? "33%" : strength.level === "medium" ? "66%" : "100%" }}
                                />
                            </div>
                            <p className={`text-xs mt-1 font-medium ${strength.level === "weak" ? "text-red-400" : strength.level === "medium" ? "text-yellow-400" : "text-green-400"}`}>
                                قوة كلمة المرور: {strength.label}
                            </p>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="signup-confirm" className="block text-sm font-semibold text-gray-300 mb-1.5">تأكيد كلمة المرور</label>
                    <div className="relative">
                        <input
                            id="signup-confirm"
                            name="confirmPassword"
                            type={showConfirm ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={e => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                            className="auth-input w-full px-4 py-3 rounded-xl text-sm pe-12"
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
                    {errors.confirmPassword && <p className="error-msg text-red-400 text-xs mt-1 font-medium">{errors.confirmPassword}</p>}
                    {confirmPassword && !errors.confirmPassword && (
                        <p className={`text-xs mt-1 font-medium ${passwordsMatch ? "text-green-400" : "text-red-400"}`}>
                            {passwordsMatch ? "✓ كلمات المرور متطابقة" : "✗ كلمات المرور غير متطابقة"}
                        </p>
                    )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            className="auth-checkbox mt-0.5"
                            checked={agreedTerms}
                            onChange={e => { setAgreedTerms(e.target.checked); clearError("terms"); }}
                        />
                        <span className="text-gray-400 text-xs leading-relaxed">
                            أوافق على{" "}
                            <span className="text-orange-400 hover:underline cursor-pointer">شروط الاستخدام</span>
                            {" "}و{" "}
                            <span className="text-orange-400 hover:underline cursor-pointer">سياسة الخصوصية</span>
                        </span>
                    </label>
                    {errors.terms && <p className="error-msg text-red-400 text-xs font-medium me-6">{errors.terms}</p>}
                    <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                            type="checkbox"
                            className="auth-checkbox"
                            checked={newsletter}
                            onChange={e => setNewsletter(e.target.checked)}
                        />
                        <span className="text-gray-400 text-xs">الاشتراك في النشرة البريدية (اختياري)</span>
                    </label>
                </div>

                {/* Server Error or Message */}
                {serverError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-center">
                        {serverError}
                    </motion.p>
                )}
                {serverMessage && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-medium text-green-400 bg-green-500/10 border border-green-500/20 p-3 rounded-lg text-center">
                        {serverMessage}
                    </motion.p>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="auth-submit-btn w-full py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-1"
                >
                    {isLoading ? <LoaderIcon /> : "إنشاء الحساب"}
                </button>
            </form>
        </motion.div>
    );
}

// ─── Main Auth Content ──────────────────────────────────────────────
function AuthContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const message = searchParams.get("message");
    const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

    // Reset error when switching tabs
    useEffect(() => {
        // Clear URL params on tab switch (cosmetic only)
    }, [activeTab]);

    return (
        <div className="auth-bg min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="auth-panel w-full max-w-[920px] rounded-3xl overflow-hidden flex flex-col lg:flex-row shadow-2xl"
            >
                {/* Side Panel - Desktop */}
                <SidePanel />

                {/* Main Form Area */}
                <div className="flex-1 p-6 sm:p-8 lg:p-10">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                            <ZapIcon />
                        </div>
                        <h1 className="text-lg font-bold text-white">منيو رقمي</h1>
                    </div>

                    {/* Tabs */}
                    <div className="relative mb-8">
                        <div className="flex bg-white/5 rounded-xl p-1">
                            <button
                                onClick={() => setActiveTab("login")}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === "login" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "text-gray-400 hover:text-gray-300"}`}
                            >
                                تسجيل الدخول
                            </button>
                            <button
                                onClick={() => setActiveTab("signup")}
                                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === "signup" ? "bg-orange-500 text-white shadow-lg shadow-orange-500/25" : "text-gray-400 hover:text-gray-300"}`}
                            >
                                حساب جديد
                            </button>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="max-h-[65vh] overflow-y-auto pe-1 scrollbar-thin" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(249,115,22,0.3) transparent" }}>
                        <AnimatePresence mode="wait">
                            {activeTab === "login" ? (
                                <motion.div
                                    key="login-tab"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <LoginForm serverError={error} serverMessage={message} />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="signup-tab"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <SignUpForm serverError={error} serverMessage={message} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile Security Badges */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mt-6">
                        <span className="security-badge text-[10px] font-bold px-2 py-0.5 rounded-full">SSL</span>
                        <span className="security-badge text-[10px] font-bold px-2 py-0.5 rounded-full">🔒 آمن</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

// ─── Page Export ─────────────────────────────────────────────────────
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="auth-bg min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-orange-500/20 flex items-center justify-center mb-3">
                        <LoaderIcon />
                    </div>
                    <p className="text-gray-400 text-sm">جاري التحميل...</p>
                </div>
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
