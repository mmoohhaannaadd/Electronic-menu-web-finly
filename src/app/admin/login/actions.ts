"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return redirect("/admin/login?error=" + encodeURIComponent("يرجى ملء جميع الحقول"));
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        const msg = error.message === "Invalid login credentials"
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة"
            : error.message;
        return redirect("/admin/login?error=" + encodeURIComponent(msg));
    }

    revalidatePath("/", "layout");
    redirect("/admin/dashboard");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string || "";
    const lastName = formData.get("lastName") as string || "";
    const phone = formData.get("phone") as string || "";

    if (!email || !password) {
        return redirect("/admin/login?error=" + encodeURIComponent("يرجى ملء جميع الحقول المطلوبة"));
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`.trim(),
                phone: phone,
            },
        },
    });

    if (error) {
        return redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
    }

    if (data?.user?.identities?.length === 0) {
        return redirect(`/admin/login?error=${encodeURIComponent('البريد الإلكتروني مسجل مسبقاً')}`);
    }

    if (data?.user && !data.session) {
        return redirect(`/admin/login?message=${encodeURIComponent('تم إنشاء الحساب! يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب.')}`);
    }

    revalidatePath("/", "layout");
    redirect("/admin/dashboard");
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient();
    const email = formData.get("email") as string;

    if (!email) {
        return redirect(`/admin/login?error=${encodeURIComponent('يرجى إدخال البريد الإلكتروني')}`);
    }

    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/admin/login`,
    });

    if (error) {
        return redirect(`/admin/login?error=${encodeURIComponent(error.message)}`);
    }

    return redirect(`/admin/login?message=${encodeURIComponent('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')}`);
}
