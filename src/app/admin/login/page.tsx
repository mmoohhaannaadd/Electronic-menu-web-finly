"use client";

import { useSearchParams } from "next/navigation";
import { login, signup } from "./actions";
import { Suspense } from "react";

function LoginContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const message = searchParams.get("message");

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 rounded-3xl bg-surface p-8 soft-shadow">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <svg
                            className="h-8 w-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        أهلاً بك 👋
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                        سجل دخولك لإدارة مطعمك والمنيو الرقمي
                    </p>
                </div>

                <form className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-bold text-muted"
                            >
                                البريد الإلكتروني
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full rounded-xl border border-border bg-transparent px-4 py-3 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="restaurant@example.com"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-bold text-muted"
                            >
                                كلمة المرور
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="mt-1 block w-full rounded-xl border border-border bg-transparent px-4 py-3 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="mt-4 text-center text-sm font-bold text-red-500 bg-red-50 p-3 rounded-lg dark:bg-red-900/20">
                            {error}
                        </p>
                    )}

                    {message && (
                        <p className="mt-4 text-center text-sm font-bold text-green-500 bg-green-50 p-3 rounded-lg dark:bg-green-900/20">
                            {message}
                        </p>
                    )}

                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            formAction={login}
                            className="flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98]"
                        >
                            تسجيل الدخول
                        </button>
                        <button
                            formAction={signup}
                            className="flex w-full justify-center rounded-xl border-2 border-primary/20 bg-transparent px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 active:scale-[0.98]"
                        >
                            إنشاء حساب جديد
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center">جاري التحميل...</div>}>
            <LoginContent />
        </Suspense>
    );
}
