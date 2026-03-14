"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { QRCodeCanvas } from "qrcode.react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// ===================== TYPES =====================
type Restaurant = {
    id: string;
    name: string;
    slug: string;
    whatsapp_number: string;
    logo_url: string | null;
    cover_url: string | null;
    subtitle: string | null;
    theme_color: string;
    currency: string;
};

type Category = {
    id: string;
    name: string;
    sort_order: number;
};

type ItemSize = {
    id?: string;
    name: string;
    price: string;
    discount_type?: "percentage" | "fixed_price" | null;
    discount_value?: string | null;
};

type Item = {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number | null;  // null when item has multiple sizes
    image_url: string | null;
    is_available: boolean;
    discount_type: "percentage" | "fixed_price" | null;
    discount_value: number | null;
    sizes?: ItemSize[];
};

type Tab = "overview" | "categories" | "items" | "settings";

const CURRENCIES = [
    { code: "₪", label: "شيكل إسرائيلي (₪)" },
    { code: "ر.س", label: "ريال سعودي (ر.س)" },
    { code: "د.إ", label: "درهم إماراتي (د.إ)" },
    { code: "ج.م", label: "جنيه مصري (ج.م)" },
    { code: "د.ك", label: "دينار كويتي (د.ك)" },
    { code: "ر.ق", label: "ريال قطري (ر.ق)" },
    { code: "د.ب", label: "دينار بحريني (د.ب)" },
    { code: "ر.ع", label: "ريال عماني (ر.ع)" },
    { code: "د.أ", label: "دينار أردني (د.أ)" },
    { code: "$", label: "دولار أمريكي ($)" },
    { code: "€", label: "يورو (€)" },
];

const Icon = ({ path, className = "h-5 w-5" }: { path: string; className?: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
);

function calcFinalPrice(price: number | null, discountType: string | null, discountValue: number | null): number | null {
    if (price === null) return null;
    if (!discountType || !discountValue) return price;
    if (discountType === "percentage") return price - (price * discountValue) / 100;
    if (discountType === "fixed_price") return discountValue;
    return price;
}

// ===================== MAIN COMPONENT =====================
export default function AdminDashboard() {
    const router = useRouter();
    // Use a ref to hold a stable supabase client — prevents useCallback from
    // being recreated on every render (which would cause an infinite loop).
    const supabaseRef = useRef<SupabaseClient>(createClient());
    const supabase = supabaseRef.current;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [userEmail, setUserEmail] = useState("");

    // Settings
    const [settingsForm, setSettingsForm] = useState({ name: "", slug: "", whatsapp_number: "", theme_color: "#f97316", currency: "₪", logo_url: "", cover_url: "", subtitle: "" });
    const [settingsSaving, setSettingsSaving] = useState(false);
    const [settingsMsg, setSettingsMsg] = useState("");

    // Categories
    const [newCategoryName, setNewCategoryName] = useState("");
    const [categoryLoading, setCategoryLoading] = useState(false);

    // Item form
    const [showItemForm, setShowItemForm] = useState(false);
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const [itemForm, setItemForm] = useState({
        name: "",
        description: "",
        price: "",
        category_id: "",
        image_url: "",
        is_available: true,
        discount_type: "" as "" | "percentage" | "fixed_price",
        discount_value: "",
    });
    const [itemSizes, setItemSizes] = useState<ItemSize[]>([]);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");
    const [imageUploading, setImageUploading] = useState(false);
    const [itemLoading, setItemLoading] = useState(false);
    const [itemError, setItemError] = useState("");

    // ===================== LOAD DATA =====================
    const loadData = useCallback(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push("/admin/login"); return; }
        setUserEmail(user.email ?? "");

        const { data: rest } = await supabase.from("restaurants").select("*").eq("owner_id", user.id).maybeSingle();
        if (!rest) { router.push("/admin/setup"); return; }

        setRestaurant(rest);
        setSettingsForm({ name: rest.name, slug: rest.slug, whatsapp_number: rest.whatsapp_number, theme_color: rest.theme_color, currency: rest.currency ?? "₪", logo_url: rest.logo_url ?? "", cover_url: rest.cover_url ?? "", subtitle: rest.subtitle ?? "" });

        const { data: cats } = await supabase.from("categories").select("*").eq("restaurant_id", rest.id).order("sort_order");
        setCategories(cats ?? []);

        const { data: its } = await supabase.from("items").select("*, item_sizes(*)").eq("restaurant_id", rest.id).order("sort_order");
        setItems(its ?? []);

        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]);

    useEffect(() => { loadData(); }, [loadData]);

    // ===================== SIGN OUT =====================
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
    };

    // ===================== SETTINGS =====================
    const handleSettingsImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logo_url" | "cover_url") => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSettingsSaving(true);
        const ext = file.name.split(".").pop();
        const fileName = `restaurant-${field}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage.from("menu-images").upload(fileName, file, { upsert: true });
        if (error) { alert("فشل رفع الصورة: " + error.message); setSettingsSaving(false); return; }
        const { data: urlData } = supabase.storage.from("menu-images").getPublicUrl(data.path);
        setSettingsForm(p => ({ ...p, [field]: urlData.publicUrl }));
        setSettingsSaving(false);
    };

    const handleSaveSettings = async () => {
        if (!restaurant) return;
        setSettingsSaving(true);
        setSettingsMsg("");
        const { error } = await supabase.from("restaurants").update({
            name: settingsForm.name,
            slug: settingsForm.slug.toLowerCase().replace(/\s+/g, "-"),
            whatsapp_number: settingsForm.whatsapp_number,
            theme_color: settingsForm.theme_color,
            currency: settingsForm.currency,
            logo_url: settingsForm.logo_url || null,
            cover_url: settingsForm.cover_url || null,
            subtitle: settingsForm.subtitle || null,
        }).eq("id", restaurant.id);
        setSettingsSaving(false);
        if (error) setSettingsMsg("❌ " + error.message);
        else { setSettingsMsg("✅ تم الحفظ بنجاح!"); loadData(); }
    };

    const downloadQRCode = () => {
        const canvas = document.getElementById("qr-gen") as HTMLCanvasElement;
        if (!canvas) return;
        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `QR_${settingsForm.name}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // ===================== CATEGORIES =====================
    const handleAddCategory = async () => {
        if (!newCategoryName.trim() || !restaurant) return;
        setCategoryLoading(true);
        await supabase.from("categories").insert({ name: newCategoryName.trim(), restaurant_id: restaurant.id, sort_order: categories.length });
        setCategoryLoading(false);
        setNewCategoryName("");
        loadData();
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("حذف هذا التصنيف وجميع منتجاته؟")) return;
        await supabase.from("categories").delete().eq("id", id);
        loadData();
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination || !restaurant) return;
        
        const items = Array.from(categories);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        // Update the state immediately for smooth UI
        const updatedCategories = items.map((cat, index) => ({
            ...cat,
            sort_order: index
        }));
        setCategories(updatedCategories);

        // Update in the database
        const updates = updatedCategories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            restaurant_id: restaurant.id,
            sort_order: cat.sort_order
        }));
        
        const { error } = await supabase.from('categories').upsert(updates);
        if (error) {
            console.error("Error updating category order:", error);
            alert("حدث خطأ أثناء حفظ الترتيب الجديد");
            loadData(); // Revert back to server state on error
        }
    };

    // ===================== IMAGE UPLOAD =====================
    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setItemForm(p => ({ ...p, image_url: "" }));
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile) return itemForm.image_url || null;
        setImageUploading(true);
        const ext = imageFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { data, error } = await supabase.storage.from("menu-images").upload(fileName, imageFile, { upsert: true });
        setImageUploading(false);
        if (error) { alert("فشل رفع الصورة: " + error.message); return null; }
        const { data: urlData } = supabase.storage.from("menu-images").getPublicUrl(data.path);
        return urlData.publicUrl;
    };

    // ===================== ITEMS =====================
    const openAddItem = () => {
        setEditingItem(null);
        setItemForm({ name: "", description: "", price: "", category_id: categories[0]?.id ?? "", image_url: "", is_available: true, discount_type: "", discount_value: "" });
        setItemSizes([]);
        setImageFile(null);
        setImagePreview("");
        setItemError("");
        setShowItemForm(true);
    };

    const openEditItem = async (item: Item) => {
        setEditingItem(item);
        setItemForm({
            name: item.name,
            description: item.description ?? "",
            price: String(item.price),
            category_id: item.category_id,
            image_url: item.image_url ?? "",
            is_available: item.is_available,
            discount_type: item.discount_type ?? "",
            discount_value: item.discount_value ? String(item.discount_value) : "",
        });
        // Load sizes
        const { data: sizes } = await supabase.from("item_sizes").select("*").eq("item_id", item.id).order("sort_order");
        setItemSizes(sizes?.map(s => ({ id: s.id, name: s.name, price: String(s.price) })) ?? []);
        setImageFile(null);
        setImagePreview(item.image_url ?? "");
        setItemError("");
        setShowItemForm(true);
    };

    const handleSaveItem = async () => {
        const hasValidSizes = itemSizes.some(s => s.name && s.price);
        if (!restaurant || !itemForm.name || (!itemForm.price && !hasValidSizes) || !itemForm.category_id) return;

        setItemLoading(true);
        setItemError("");

        try {
            const imageUrl = await uploadImage();
            const hasSizes = itemSizes.some(s => s.name && s.price);

            const payload = {
                name: itemForm.name,
                description: itemForm.description || null,
                price: hasSizes ? null : (itemForm.price ? parseFloat(itemForm.price) : null),
                category_id: itemForm.category_id,
                image_url: imageUrl,
                is_available: itemForm.is_available,
                restaurant_id: restaurant.id,
                discount_type: hasSizes ? null : (itemForm.discount_type || null),
                discount_value: hasSizes ? null : (itemForm.discount_value ? parseFloat(itemForm.discount_value) : null),
            };

            let itemId = editingItem?.id;

            if (editingItem) {
                const { error } = await supabase.from("items").update(payload).eq("id", editingItem.id);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from("items").insert({ ...payload, sort_order: items.length }).select().single();
                if (error) throw error;
                itemId = data?.id;
            }

            // Save sizes
            if (itemId) {
                const { error: delError } = await supabase.from("item_sizes").delete().eq("item_id", itemId);
                if (delError) throw delError;

                if (itemSizes.filter(s => s.name && s.price).length > 0) {
                    const { error: insError } = await supabase.from("item_sizes").insert(
                        itemSizes.filter(s => s.name && s.price).map((s, i) => ({
                            item_id: itemId,
                            name: s.name,
                            price: parseFloat(s.price),
                            sort_order: i,
                            discount_type: s.discount_type || null,
                            discount_value: s.discount_value ? parseFloat(s.discount_value) : null,
                        }))
                    );
                    if (insError) throw insError;
                }
            }

            setShowItemForm(false);
            loadData();
        } catch (err) {
            console.error("Error saving item:", err);
            setItemError(err instanceof Error ? err.message : "حدث خطأ أثناء حفظ المنتج");
        } finally {
            setItemLoading(false);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm("حذف هذا المنتج؟")) return;
        await supabase.from("items").delete().eq("id", id);
        loadData();
    };

    const handleToggleAvailable = async (item: Item) => {
        await supabase.from("items").update({ is_available: !item.is_available }).eq("id", item.id);
        loadData();
    };

    // Size management
    const addSize = () => setItemSizes(p => [...p, { name: "", price: "" }]);
    const removeSize = (i: number) => setItemSizes(p => p.filter((_, idx) => idx !== i));
    const updateSize = (i: number, field: keyof ItemSize, value: string | null) =>
        setItemSizes(p => p.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

    const currency = restaurant?.currency ?? "₪";

    // ===================== LOADING =====================
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted text-sm">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background" dir="rtl">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg">🍽️</div>
                        <div>
                            <p className="text-sm font-bold">{restaurant?.name}</p>
                            <a href={`/menu/${restaurant?.slug}`} target="_blank" className="text-xs text-primary hover:underline">
                                /menu/{restaurant?.slug} ↗
                            </a>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="hidden text-xs text-muted sm:block">{userEmail}</span>
                        <button onClick={handleSignOut} className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-muted transition hover:border-red-300 hover:text-red-500">
                            خروج
                        </button>
                    </div>
                </div>
                <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
                    {([
                        { id: "overview", label: "الرئيسية", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
                        { id: "categories", label: "التصنيفات", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
                        { id: "items", label: "المنتجات", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
                        { id: "settings", label: "الإعدادات", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
                    ] as { id: Tab; label: string; icon: string }[]).map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}>
                            <Icon path={tab.icon} className="h-4 w-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </nav>

            <main className="mx-auto max-w-6xl px-4 py-8">

                {/* ===== OVERVIEW ===== */}
                {activeTab === "overview" && (
                    <div className="space-y-6">
                        <h1 className="text-2xl font-bold">مرحباً بك! 👋</h1>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-border bg-surface p-6 soft-shadow">
                                <p className="text-sm font-bold text-muted">التصنيفات</p>
                                <p className="mt-2 text-4xl font-bold text-primary">{categories.length}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-surface p-6 soft-shadow">
                                <p className="text-sm font-bold text-muted">المنتجات</p>
                                <p className="mt-2 text-4xl font-bold text-primary">{items.length}</p>
                            </div>
                            <div className="rounded-2xl border border-border bg-surface p-6 soft-shadow">
                                <p className="text-sm font-bold text-muted">العملة</p>
                                <p className="mt-2 text-4xl font-bold text-primary">{currency}</p>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-border bg-surface p-6 soft-shadow">
                            <h3 className="mb-3 font-bold">رابط منيو مطعمك</h3>
                            <div className="flex items-center gap-3 rounded-xl bg-background p-4">
                                <span className="flex-1 font-mono text-sm text-primary break-all">
                                    {typeof window !== "undefined" ? window.location.origin : ""}/menu/{restaurant?.slug}
                                </span>
                                <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/menu/${restaurant?.slug}`)}
                                    className="shrink-0 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary/90">
                                    نسخ
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== CATEGORIES ===== */}
                {activeTab === "categories" && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">التصنيفات</h2>
                        <div className="flex gap-3">
                            <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAddCategory()}
                                placeholder="مثال: برجر، مشروبات، حلويات..."
                                className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            <button onClick={handleAddCategory} disabled={categoryLoading || !newCategoryName.trim()}
                                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50">
                                {categoryLoading ? "..." : "إضافة"}
                            </button>
                        </div>
                        {categories.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
                                <p className="text-3xl">📂</p>
                                <p className="mt-3 font-bold">لا يوجد تصنيفات</p>
                            </div>
                        ) : (
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="categories">
                                    {(provided) => (
                                        <div className="space-y-3" {...provided.droppableProps} ref={provided.innerRef}>
                                            {categories.map((cat, index) => (
                                                <Draggable key={cat.id} draggableId={cat.id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                opacity: snapshot.isDragging ? 0.8 : 1
                                                            }}
                                                            className={`flex items-center justify-between rounded-2xl border border-border bg-surface p-4 soft-shadow ${snapshot.isDragging ? 'shadow-lg border-primary' : ''}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div 
                                                                    {...provided.dragHandleProps}
                                                                    className="cursor-move text-muted hover:text-primary transition p-1"
                                                                >
                                                                    <Icon path="M4 8h16M4 16h16" className="h-5 w-5" />
                                                                </div>
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">{cat.name[0]}</div>
                                                                <div>
                                                                    <p className="font-bold">{cat.name}</p>
                                                                    <p className="text-xs text-muted">{items.filter(i => i.category_id === cat.id).length} منتج</p>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => handleDeleteCategory(cat.id)}
                                                                className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                                                                <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </div>
                )}

                {/* ===== ITEMS ===== */}
                {activeTab === "items" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold">المنتجات</h2>
                                <p className="mt-1 text-muted">{items.length} منتج</p>
                            </div>
                            <button onClick={openAddItem} disabled={categories.length === 0}
                                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50">
                                <Icon path="M12 4v16m8-8H4" className="h-4 w-4" />
                                إضافة منتج
                            </button>
                        </div>
                        {items.length === 0 ? (
                            <div className="rounded-2xl border-2 border-dashed border-border p-10 text-center">
                                <p className="text-3xl">🍽️</p>
                                <p className="mt-3 font-bold">لا يوجد منتجات</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {categories.map(cat => {
                                    const catItems = items.filter(i => i.category_id === cat.id);
                                    if (!catItems.length) return null;
                                    return (
                                        <div key={cat.id}>
                                            <h3 className="mb-2 text-sm font-bold text-muted">{cat.name}</h3>
                                            <div className="space-y-2">
                                                {catItems.map(item => {
                                                    const finalPrice = calcFinalPrice(item.price, item.discount_type, item.discount_value);
                                                    const hasDiscount = item.discount_type && item.discount_value;
                                                    const hasSizes = item.sizes && item.sizes.length > 0;
                                                    return (
                                                        <div key={item.id} className={`flex items-center gap-4 rounded-2xl border bg-surface p-4 soft-shadow transition ${!item.is_available ? "opacity-60" : "border-border"}`}>
                                                            {item.image_url ? (
                                                                <img src={item.image_url} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                                                            ) : (
                                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-background text-2xl">🍴</div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold truncate">{item.name}</p>
                                                                {item.description && <p className="mt-0.5 text-xs text-muted line-clamp-1">{item.description}</p>}
                                                                <div className="mt-1 flex flex-wrap items-center gap-2">
                                                                    {hasSizes ? (
                                                                        <div className="flex flex-wrap gap-1">
                                                                            {item.sizes?.map(s => (
                                                                                <span key={s.id || s.name} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                                                                                    {s.name}: {s.price}{currency}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-2">
                                                                            {hasDiscount && (
                                                                                <span className="text-xs text-muted line-through">{item.price}{currency}</span>
                                                                            )}
                                                                            <span className="text-sm font-bold text-primary">{finalPrice !== null ? finalPrice.toFixed(2) : "--"}{currency}</span>
                                                                            {hasDiscount && item.discount_type === "percentage" && (
                                                                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-900/30">
                                                                                    {item.discount_value}% خصم
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex shrink-0 items-center gap-2">
                                                                <button onClick={() => handleToggleAvailable(item)}
                                                                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${item.is_available ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-gray-100 text-gray-500 dark:bg-gray-800"}`}>
                                                                    {item.is_available ? "متاح" : "غير متاح"}
                                                                </button>
                                                                <button onClick={() => openEditItem(item)} className="rounded-lg p-2 text-muted transition hover:bg-primary/10 hover:text-primary">
                                                                    <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </button>
                                                                <button onClick={() => handleDeleteItem(item.id)} className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                                                                    <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== SETTINGS ===== */}
                {activeTab === "settings" && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold">إعدادات المطعم</h2>
                        <div className="rounded-2xl border border-border bg-surface p-6 soft-shadow space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-muted">اسم المطعم</label>
                                <input value={settingsForm.name} onChange={e => setSettingsForm(p => ({ ...p, name: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-muted">رابط المنيو (slug)</label>
                                <div className="mt-1 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
                                    <span className="text-sm text-muted">/menu/</span>
                                    <input value={settingsForm.slug} onChange={e => setSettingsForm(p => ({ ...p, slug: e.target.value }))}
                                        className="flex-1 bg-transparent text-sm outline-none" placeholder="burger-house" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-muted">رقم WhatsApp</label>
                                <input value={settingsForm.whatsapp_number} onChange={e => setSettingsForm(p => ({ ...p, whatsapp_number: e.target.value }))}
                                    placeholder="972501234567" className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" dir="ltr" />
                                <p className="mt-1 text-xs text-muted">رمز الدولة بدون + (مثال: 972 لفلسطين/إسرائيل)</p>
                            </div>

                            {/* Logo */}
                            <div>
                                <label className="block text-sm font-bold text-muted">لوجو المطعم</label>
                                <div className="mt-1 flex items-center gap-4">
                                    {(settingsForm.logo_url) ? (
                                        <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-border">
                                            <img src={settingsForm.logo_url} className="h-full w-full object-cover" alt="Logo" />
                                            <button onClick={() => setSettingsForm(p => ({ ...p, logo_url: "" }))} className="absolute inset-0 bg-black/50 text-white flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
                                                <Icon path="M6 18L18 6M6 6l12 12" className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-16 w-16 shrink-0 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted">🍽️</div>
                                    )}
                                    <div className="flex-1">
                                        <input type="file" accept="image/*" onChange={e => handleSettingsImageUpload(e, "logo_url")} className="hidden" id="logo-upload" />
                                        <label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-background border border-border px-4 py-2 text-sm font-bold transition hover:border-primary">
                                            {settingsSaving && !settingsForm.logo_url ? "جاري الرفع..." : "تغيير اللوجو"}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Cover */}
                            <div>
                                <label className="block text-sm font-bold text-muted">صورة الغلاف</label>
                                <div className="mt-1 flex flex-col gap-3">
                                    {(settingsForm.cover_url) && (
                                        <div className="relative h-32 w-full rounded-xl overflow-hidden border border-border">
                                            <img src={settingsForm.cover_url} className="h-full w-full object-cover" alt="Cover" />
                                            <button onClick={() => setSettingsForm(p => ({ ...p, cover_url: "" }))} className="absolute inset-0 bg-black/50 text-white flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
                                                <Icon path="M6 18L18 6M6 6l12 12" className="h-6 w-6" />
                                            </button>
                                        </div>
                                    )}
                                    <div>
                                        <input type="file" accept="image/*" onChange={e => handleSettingsImageUpload(e, "cover_url")} className="hidden" id="cover-upload" />
                                        <label htmlFor="cover-upload" className="cursor-pointer inline-flex items-center justify-center rounded-xl bg-background border border-border px-4 py-2 text-sm font-bold transition hover:border-primary w-full shadow-sm">
                                            {settingsSaving && !settingsForm.cover_url ? "جاري الرفع..." : "رفع صورة غلاف جديدة"}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Subtitle */}
                            <div>
                                <label className="block text-sm font-bold text-muted">النص الفرعي (يظهر أسفل الاسم)</label>
                                <input value={settingsForm.subtitle} onChange={e => setSettingsForm(p => ({ ...p, subtitle: e.target.value }))}
                                    placeholder="مثال: أفضل برجر في المدينة 🍔"
                                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            </div>

                            {/* Currency */}
                            <div>
                                <label className="block text-sm font-bold text-muted">عملة المطعم</label>
                                <select value={settingsForm.currency} onChange={e => setSettingsForm(p => ({ ...p, currency: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                                    {CURRENCIES.map(c => (
                                        <option key={c.code} value={c.code}>{c.label}</option>
                                    ))}
                                </select>
                                <p className="mt-1 text-xs text-muted">العملة الافتراضية: الشيكل الإسرائيلي (₪)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-muted">لون المطعم</label>
                                <div className="mt-1 flex items-center gap-3">
                                    <input type="color" value={settingsForm.theme_color} onChange={e => setSettingsForm(p => ({ ...p, theme_color: e.target.value }))}
                                        className="h-12 w-16 cursor-pointer rounded-xl border border-border" />
                                    <span className="text-sm text-muted">{settingsForm.theme_color}</span>
                                </div>
                            </div>

                            {settingsMsg && (
                                <p className={`rounded-xl p-3 text-sm font-bold ${settingsMsg.startsWith("✅") ? "bg-green-50 text-green-700 dark:bg-green-900/20" : "bg-red-50 text-red-700 dark:bg-red-900/20"}`}>
                                    {settingsMsg}
                                </p>
                            )}
                            <button onClick={handleSaveSettings} disabled={settingsSaving}
                                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50">
                                {settingsSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
                            </button>

                            {/* QR CODE Section */}
                            <div className="border-t border-border pt-6 mt-4">
                                <h3 className="text-lg font-bold">باركود المنيو (QR Code)</h3>
                                <p className="text-sm text-muted mb-4">اطبع هذا الباركود وضعه على طاولات المطعم ليصل الزبائن للمنيو فوراً.</p>
                                <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl bg-background p-6 border border-border shadow-sm">
                                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex-shrink-0">
                                        <QRCodeCanvas
                                            id="qr-gen"
                                            value={`${typeof window !== "undefined" ? window.location.origin : ""}/menu/${settingsForm.slug}`}
                                            size={160}
                                            level={"H"}
                                            includeMargin={false}
                                            fgColor={settingsForm.theme_color}
                                        />
                                    </div>
                                    <div className="flex-1 space-y-4 text-center sm:text-right w-full min-w-0">
                                        <div>
                                            <p className="font-bold">رابط المنيو الحالي:</p>
                                            <div className="mt-1 text-sm text-primary font-mono bg-primary/5 px-3 py-2 rounded-lg break-all text-left" dir="ltr">
                                                {typeof window !== "undefined" ? window.location.origin : ""}/menu/{settingsForm.slug}
                                            </div>
                                        </div>
                                        <button onClick={downloadQRCode} className="w-full sm:w-auto inline-flex justify-center rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition hover:bg-primary/90">
                                            حفظ الباركود كصورة ⬇️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ===== ITEM FORM MODAL ===== */}
            {showItemForm && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center"
                    onClick={e => { if (e.target === e.currentTarget) setShowItemForm(false); }}>
                    <div className="w-full max-w-lg rounded-t-3xl bg-surface p-6 sm:rounded-3xl soft-shadow max-h-[92vh] overflow-y-auto" dir="rtl">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="text-xl font-bold">{editingItem ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
                            <button onClick={() => setShowItemForm(false)} className="rounded-full bg-background p-2 text-muted hover:text-foreground">
                                <Icon path="M6 18L18 6M6 6l12 12" className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Category */}
                            <div>
                                <label className="block text-sm font-bold text-muted">التصنيف *</label>
                                <select value={itemForm.category_id} onChange={e => setItemForm(p => ({ ...p, category_id: e.target.value }))}
                                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary">
                                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                </select>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-muted">اسم المنتج *</label>
                                <input value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))}
                                    placeholder="مثال: برجر كلاسيك"
                                    className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-muted">الوصف</label>
                                <textarea value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))}
                                    rows={2} placeholder="وصف مختصر وشهي..."
                                    className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-bold text-muted">صورة المنتج</label>
                                <div className="mt-1 space-y-2">
                                    {/* File Upload Button */}
                                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-4 text-sm font-bold text-muted transition hover:border-primary hover:text-primary">
                                        <Icon path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" className="h-5 w-5" />
                                        {imageFile ? imageFile.name : "رفع صورة من الجهاز"}
                                    </button>
                                    {/* OR URL */}
                                    <div className="flex items-center gap-2">
                                        <div className="h-px flex-1 bg-border" />
                                        <span className="text-xs text-muted">أو</span>
                                        <div className="h-px flex-1 bg-border" />
                                    </div>
                                    <input value={itemForm.image_url} onChange={e => { setItemForm(p => ({ ...p, image_url: e.target.value })); setImageFile(null); setImagePreview(e.target.value); }}
                                        placeholder="https://... (رابط صورة)"
                                        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" dir="ltr" />
                                    {/* Preview */}
                                    {imagePreview && (
                                        <div className="relative">
                                            <img src={imagePreview} alt="preview" className="h-32 w-full rounded-xl object-cover"
                                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                                            <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); setItemForm(p => ({ ...p, image_url: "" })); }}
                                                className="absolute left-2 top-2 rounded-full bg-black/50 p-1 text-white">
                                                <Icon path="M6 18L18 6M6 6l12 12" className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Base Price - Hidden if sizes exist */}
                            {itemSizes.length === 0 && (
                                <div>
                                    <label className="block text-sm font-bold text-muted">
                                        السعر الأساسي ({currency}) *
                                    </label>
                                    <input type="number" min="0" step="0.5" value={itemForm.price} onChange={e => setItemForm(p => ({ ...p, price: e.target.value }))}
                                        placeholder="0.00"
                                        className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary" dir="ltr" />
                                </div>
                            )}

                            {/* Sizes Section */}
                            <div className="rounded-xl border border-border p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-sm">أحجام متعددة</p>
                                        <p className="text-xs text-muted">مثال: صغير / وسط / كبير</p>
                                    </div>
                                    <button type="button" onClick={addSize}
                                        className="flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20">
                                        <Icon path="M12 4v16m8-8H4" className="h-3 w-3" />
                                        إضافة حجم
                                    </button>
                                </div>
                                {itemSizes.map((size, i) => (
                                    <div key={i} className="space-y-2 rounded-lg border border-border/50 p-3 bg-background/50">
                                        <div className="flex items-center gap-2">
                                            <input value={size.name} onChange={e => updateSize(i, "name", e.target.value)}
                                                placeholder="الحجم (مثال: وسط)"
                                                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" />
                                            <input type="number" min="0" step="0.5" value={size.price} onChange={e => updateSize(i, "price", e.target.value)}
                                                placeholder="السعر"
                                                className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" dir="ltr" />
                                            <button type="button" onClick={() => removeSize(i)} className="rounded-lg p-2 text-muted hover:text-red-500">
                                                <Icon path="M6 18L18 6M6 6l12 12" className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {/* Size specific discount */}
                                        <div className="flex flex-col gap-2 border-t border-border/50 pt-2 mt-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-muted">خصم خاص للحجم (اختياري)</span>
                                                <div className="flex gap-1">
                                                    <button type="button"
                                                        onClick={() => updateSize(i, "discount_type", size.discount_type === "percentage" ? null : "percentage")}
                                                        className={`rounded px-2 py-1 text-[10px] font-bold border transition ${size.discount_type === "percentage" ? "bg-primary text-white border-primary" : "border-border text-muted"}`}>
                                                        % نسبة
                                                    </button>
                                                    <button type="button"
                                                        onClick={() => updateSize(i, "discount_type", size.discount_type === "fixed_price" ? null : "fixed_price")}
                                                        className={`rounded px-2 py-1 text-[10px] font-bold border transition ${size.discount_type === "fixed_price" ? "bg-primary text-white border-primary" : "border-border text-muted"}`}>
                                                        💰 سعر ثابت
                                                    </button>
                                                </div>
                                            </div>
                                            {size.discount_type && (
                                                <div className="flex items-center gap-2">
                                                    <input type="number" min="0" step="any"
                                                        value={size.discount_value || ""}
                                                        onChange={e => updateSize(i, "discount_value", e.target.value)}
                                                        placeholder={size.discount_type === "percentage" ? "نسبة الخصم" : "السعر الجديد"}
                                                        className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary" dir="ltr" />
                                                    {size.price && size.discount_value && (() => {
                                                        const fp = calcFinalPrice(parseFloat(size.price), size.discount_type, parseFloat(size.discount_value));
                                                        return fp !== null && (
                                                            <span className="text-[10px] font-bold text-green-600 dark:text-green-400">
                                                                {fp.toFixed(2)} {currency}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {itemSizes.length === 0 && (
                                    <p className="text-xs text-muted text-center py-1">لا يوجد أحجام – اضغط &quot;إضافة حجم&quot; لإضافة أحجام مختلفة</p>
                                )}
                            </div>

                            {/* Discount Section - Hidden if sizes exist */}
                            {itemSizes.length === 0 && (
                                <div className="rounded-xl border border-border p-4 space-y-3">
                                    <div>
                                        <p className="font-bold text-sm">خصم على المنتج</p>
                                        <p className="text-xs text-muted">اختياري – اتركه فارغاً إذا لا يوجد خصم</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button type="button"
                                            onClick={() => setItemForm(p => ({ ...p, discount_type: p.discount_type === "percentage" ? "" : "percentage", discount_value: "" }))}
                                            className={`rounded-xl border-2 p-3 text-sm font-bold transition ${itemForm.discount_type === "percentage" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:border-primary/50"}`}>
                                            <p>🏷️ نسبة مئوية</p>
                                            <p className="text-xs font-normal">مثال: خصم 20%</p>
                                        </button>
                                        <button type="button"
                                            onClick={() => setItemForm(p => ({ ...p, discount_type: p.discount_type === "fixed_price" ? "" : "fixed_price", discount_value: "" }))}
                                            className={`rounded-xl border-2 p-3 text-sm font-bold transition ${itemForm.discount_type === "fixed_price" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:border-primary/50"}`}>
                                            <p>💰 سعر ثابت جديد</p>
                                            <p className="text-xs font-normal">مثال: بدل {currency}50 ← {currency}35</p>
                                        </button>
                                    </div>
                                    {itemForm.discount_type && (
                                        <div>
                                            <label className="block text-xs font-bold text-muted">
                                                {itemForm.discount_type === "percentage" ? `نسبة الخصم (%)` : `السعر الجديد (${currency})`}
                                            </label>
                                            <input type="number" min="0" step="any" value={itemForm.discount_value}
                                                onChange={e => setItemForm(p => ({ ...p, discount_value: e.target.value }))}
                                                placeholder={itemForm.discount_type === "percentage" ? "مثال: 20" : "مثال: 35"}
                                                className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary" dir="ltr" />
                                            {itemForm.price && itemForm.discount_value && (() => {
                                                const fp = calcFinalPrice(parseFloat(itemForm.price), itemForm.discount_type, parseFloat(itemForm.discount_value));
                                                return fp !== null && (
                                                    <p className="mt-1 text-xs text-green-600 dark:text-green-400 font-bold">
                                                        السعر بعد الخصم: {fp.toFixed(2)} {currency}
                                                    </p>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Availability Toggle */}
                            <div className="flex items-center justify-between rounded-xl border border-border p-4">
                                <div>
                                    <p className="font-bold text-sm">متاح للطلب</p>
                                    <p className="text-xs text-muted">يظهر في المنيو للعملاء</p>
                                </div>
                                <button type="button" onClick={() => setItemForm(p => ({ ...p, is_available: !p.is_available }))}
                                    className={`relative h-6 w-11 rounded-full transition-colors ${itemForm.is_available ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"}`}>
                                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${itemForm.is_available ? "right-0.5" : "left-0.5"}`} />
                                </button>
                            </div>
                        </div>

                        {itemError && (
                            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700 dark:bg-red-900/20">
                                ❌ {itemError}
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setShowItemForm(false)} className="flex-1 rounded-xl border border-border py-3 text-sm font-bold text-muted transition hover:bg-background">
                                إلغاء
                            </button>
                            <button onClick={handleSaveItem}
                                disabled={itemLoading || imageUploading || !itemForm.name || (!itemForm.price && itemSizes.filter(s => s.name && s.price).length === 0) || !itemForm.category_id}
                                className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-white transition hover:bg-primary/90 disabled:opacity-50">
                                {imageUploading ? "جاري رفع الصورة..." : itemLoading ? "جاري الحفظ..." : editingItem ? "تحديث" : "إضافة"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
