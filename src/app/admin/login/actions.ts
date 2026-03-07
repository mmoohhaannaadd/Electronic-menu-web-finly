"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return redirect("/admin/login?error=Invalid login credentials");
    }

    revalidatePath("/", "layout");
    redirect("/admin/dashboard");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        return redirect(`/admin/login?error=${error.message}`);
    }

    if (data?.user?.identities?.length === 0) {
        return redirect(`/admin/login?error=البريد الإلكتروني مسجل مسبقاً`);
    }

    if (data?.user && !data.session) {
        return redirect(`/admin/login?message=تم إنشاء الحساب! يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب.`);
    }

    revalidatePath("/", "layout");
    redirect("/admin/dashboard");
}
