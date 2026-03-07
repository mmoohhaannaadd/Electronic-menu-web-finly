"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { CheckoutModal, CartItem } from "@/components/CheckoutModal";
import type { SupabaseClient } from "@supabase/supabase-js";

type Restaurant = {
    id: string;
    name: string;
    slug: string;
    whatsapp_number: string;
    logo_url: string | null;
    theme_color: string;
    currency: string;
};

type Category = {
    id: string;
    name: string;
    sort_order: number;
};

type ItemSize = {
    id: string;
    name: string;
    price: number;
    discount_type: "percentage" | "fixed_price" | null;
    discount_value: number | null;
};

type Item = {
    id: string;
    category_id: string;
    name: string;
    description: string | null;
    price: number;
    image_url: string | null;
    is_available: boolean;
    discount_type: "percentage" | "fixed_price" | null;
    discount_value: number | null;
    item_sizes: ItemSize[];
};

function calcFinalPrice(price: number, discountType: string | null, discountValue: number | null): number {
    if (!discountType || !discountValue) return price;
    if (discountType === "percentage") return price - (price * discountValue) / 100;
    if (discountType === "fixed_price") return discountValue;
    return price;
}

export default function PublicMenuPage({ params }: { params: Promise<{ slug: string }> }) {
    // Stable supabase client ref — prevents re-creating on every render
    const supabaseRef = useRef<SupabaseClient>(createClient());
    const supabase = supabaseRef.current;

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("all");

    // Selected size per item { itemId: sizeId }
    const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});

    // Cart
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);



    useEffect(() => {
        const load = async () => {
            const { slug } = await params;
            const { data: rest } = await supabase.from("restaurants").select("*").eq("slug", slug).maybeSingle();
            if (!rest) { setNotFound(true); setLoading(false); return; }
            setRestaurant(rest);

            const { data: cats } = await supabase.from("categories").select("*").eq("restaurant_id", rest.id).order("sort_order");
            const { data: its } = await supabase.from("items").select("*, item_sizes(*)").eq("restaurant_id", rest.id).eq("is_available", true).order("sort_order");

            setCategories(cats ?? []);
            setItems(its ?? []);

            // Default: first size selected for each item
            const defaults: Record<string, string> = {};
            (its ?? []).forEach((item: Item) => {
                if (item.item_sizes?.length > 0) defaults[item.id] = item.item_sizes[0].id;
            });
            setSelectedSizes(defaults);

            setActiveCategory("all");
            setLoading(false);
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    const getItemDisplayPrice = (item: Item): { final: number; original: number | null; hasDiscount: boolean; discountType?: string | null; discountValue?: number | null } => {
        const hasSizes = item.item_sizes?.length > 0;
        if (hasSizes) {
            const selSizeId = selectedSizes[item.id];
            const size = item.item_sizes.find(s => s.id === selSizeId) ?? item.item_sizes[0];
            const final = calcFinalPrice(size.price, size.discount_type, size.discount_value);
            const hasDiscount = !!size.discount_type && !!size.discount_value && final !== size.price;
            return { final, original: hasDiscount ? size.price : null, hasDiscount, discountType: size.discount_type, discountValue: size.discount_value };
        }
        const final = calcFinalPrice(item.price, item.discount_type, item.discount_value);
        const hasDiscount = !!item.discount_type && !!item.discount_value && final !== item.price;
        return { final, original: hasDiscount ? item.price : null, hasDiscount, discountType: item.discount_type, discountValue: item.discount_value };
    };

    const handleAddToCart = (item: Item) => {
        const { final } = getItemDisplayPrice(item);
        const hasSizes = item.item_sizes?.length > 0;
        const selSize = hasSizes ? item.item_sizes.find(s => s.id === selectedSizes[item.id]) ?? item.item_sizes[0] : null;
        const cartId = hasSizes ? `${item.id}-${selSize?.id}` : item.id;
        const title = hasSizes ? `${item.name} (${selSize?.name})` : item.name;

        setCartItems(prev => {
            const existing = prev.find(i => i.id === cartId);
            if (existing) return prev.map(i => i.id === cartId ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { id: cartId, title, price: final, quantity: 1 }];
        });
    };

    const updateCartItemQuantity = (id: string | number, delta: number) => {
        setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter(i => i.quantity > 0));
    };

    const getItemQty = (item: Item): number => {
        const hasSizes = item.item_sizes?.length > 0;
        const selSize = hasSizes ? item.item_sizes.find(s => s.id === selectedSizes[item.id]) ?? item.item_sizes[0] : null;
        const cartId = hasSizes ? `${item.id}-${selSize?.id}` : item.id;
        return cartItems.find(i => i.id === cartId)?.quantity ?? 0;
    };

    const totalCount = cartItems.reduce((a, i) => a + i.quantity, 0);
    const totalPrice = cartItems.reduce((a, i) => a + i.price * i.quantity, 0);
    const currency = restaurant?.currency ?? "₪";

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-muted text-sm">جاري تحميل المنيو...</p>
                </div>
            </div>
        );
    }

    if (notFound || !restaurant) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4" dir="rtl">
                <p className="text-6xl">🔍</p>
                <h1 className="mt-4 text-2xl font-bold">المطعم غير موجود</h1>
                <p className="mt-2 text-muted">تأكد من صحة الرابط أو تواصل مع المطعم</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32" dir="rtl" style={{ "--primary": restaurant.theme_color } as React.CSSProperties}>
            {/* Hero */}
            <header className="relative h-56 w-full overflow-hidden sm:h-72">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                <div className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop)` }} />
                <div className="absolute bottom-0 left-0 right-0 z-20 flex items-end gap-4 p-5">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-white/80 bg-white soft-shadow sm:h-20 sm:w-20">
                        {restaurant.logo_url ? (
                            <img src={restaurant.logo_url} alt="logo" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-3xl">🍽️</div>
                        )}
                    </div>
                    <div className="mb-1 text-white">
                        <h1 className="text-2xl font-bold sm:text-3xl">{restaurant.name}</h1>
                        <p className="mt-0.5 text-sm opacity-80">اطلب الآن عبر واتساب ⚡</p>
                    </div>
                </div>
            </header>

            {/* Sticky Category Tabs */}
            <div className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
                <div className="flex gap-1 overflow-x-auto px-4 py-3" style={{ scrollbarWidth: "none" }}>
                    <button
                        onClick={() => setActiveCategory("all")}
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${activeCategory === "all" ? "text-white shadow-md" : "bg-background text-muted hover:text-foreground"}`}
                        style={activeCategory === "all" ? { backgroundColor: restaurant.theme_color } : {}}>
                        المنيو كامل
                    </button>
                    {categories.map(cat => (
                        <button key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${activeCategory === cat.id ? "text-white shadow-md" : "bg-background text-muted hover:text-foreground"}`}
                            style={activeCategory === cat.id ? { backgroundColor: restaurant.theme_color } : {}}>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu */}
            <main className="mx-auto max-w-2xl px-4 pt-6">
                {categories.map(cat => {
                    if (activeCategory !== "all" && activeCategory !== cat.id) return null;
                    const catItems = items.filter(i => i.category_id === cat.id);
                    if (!catItems.length) return null;
                    return (
                        <div key={cat.id} id={cat.id} className="mb-8">
                            {activeCategory === "all" && <h2 className="mb-3 text-xl font-bold">{cat.name}</h2>}
                            <div className="flex flex-col gap-3">
                                {catItems.map(item => {
                                    const { final, original, hasDiscount, discountType, discountValue } = getItemDisplayPrice(item);
                                    const hasSizes = item.item_sizes?.length > 0;
                                    const qty = getItemQty(item);
                                    return (
                                        <div key={item.id} className="rounded-2xl border border-border bg-surface p-4 soft-shadow hover-shadow transition-shadow">
                                            <div className="flex gap-4">
                                                {item.image_url && (
                                                    <img src={item.image_url} alt={item.name} className="h-24 w-24 shrink-0 rounded-xl object-cover" loading="lazy" />
                                                )}
                                                <div className="flex flex-1 flex-col justify-between min-w-0">
                                                    <div>
                                                        <h3 className="font-bold leading-tight">{item.name}</h3>
                                                        {item.description && <p className="mt-1 text-xs text-muted line-clamp-2">{item.description}</p>}
                                                    </div>
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {hasDiscount && original && (
                                                                <span className="text-xs text-muted line-through">{original}{currency}</span>
                                                            )}
                                                            <span className="font-bold text-primary" style={{ color: restaurant.theme_color }}>
                                                                {final.toFixed(2)}{currency}
                                                            </span>
                                                            {hasDiscount && discountType === "percentage" && (
                                                                <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600 dark:bg-red-900/30">
                                                                    {discountValue}% خصم
                                                                </span>
                                                            )}
                                                        </div>
                                                        {!hasSizes && (
                                                            <div>
                                                                {qty === 0 ? (
                                                                    <button onClick={() => handleAddToCart(item)}
                                                                        className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xl font-bold transition hover:scale-110 active:scale-95"
                                                                        style={{ backgroundColor: restaurant.theme_color }}>+</button>
                                                                ) : (
                                                                    <div className="flex items-center gap-2 rounded-full px-2 py-1 text-white text-sm font-bold" style={{ backgroundColor: restaurant.theme_color }}>
                                                                        <button onClick={() => updateCartItemQuantity(item.id, -1)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30">-</button>
                                                                        <span className="w-4 text-center">{qty}</span>
                                                                        <button onClick={() => handleAddToCart(item)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30">+</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Sizes + Add Button */}
                                            {hasSizes && (
                                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.item_sizes.map(size => {
                                                            const sFinal = calcFinalPrice(size.price, size.discount_type, size.discount_value);
                                                            const sHasDiscount = sFinal !== size.price;
                                                            return (
                                                                <button key={size.id}
                                                                    onClick={() => setSelectedSizes(p => ({ ...p, [item.id]: size.id }))}
                                                                    className={`rounded-full border-2 px-3 py-1 text-xs font-bold transition ${selectedSizes[item.id] === size.id ? "border-primary text-primary" : "border-border text-muted"}`}
                                                                    style={selectedSizes[item.id] === size.id ? { borderColor: restaurant.theme_color, color: restaurant.theme_color } : {}}>
                                                                    {size.name} – {sHasDiscount && <span className="line-through opacity-50 ml-1">{size.price.toFixed(2)}</span>} {sFinal.toFixed(2)}{currency}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                    {qty === 0 ? (
                                                        <button onClick={() => handleAddToCart(item)}
                                                            className="rounded-full px-4 py-1.5 text-sm font-bold text-white transition hover:opacity-90"
                                                            style={{ backgroundColor: restaurant.theme_color }}>
                                                            إضافة +
                                                        </button>
                                                    ) : (
                                                        <div className="flex items-center gap-2 rounded-full px-2 py-1 text-white text-sm font-bold" style={{ backgroundColor: restaurant.theme_color }}>
                                                            <button onClick={() => {
                                                                const selSize = item.item_sizes.find(s => s.id === selectedSizes[item.id]) ?? item.item_sizes[0];
                                                                updateCartItemQuantity(`${item.id}-${selSize?.id}`, -1);
                                                            }} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">-</button>
                                                            <span className="w-4 text-center">{qty}</span>
                                                            <button onClick={() => handleAddToCart(item)} className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">+</button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </main>

            {/* Floating Cart */}
            {totalCount > 0 && (
                <div className="fixed bottom-6 left-4 right-4 z-40 mx-auto max-w-sm">
                    <button onClick={() => setIsCheckoutOpen(true)}
                        className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-white shadow-2xl transition hover:opacity-90 active:scale-[0.98]"
                        style={{ backgroundColor: restaurant.theme_color }}>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-sm font-bold">{totalCount}</div>
                        <span className="font-bold">عرض السلة والطلب</span>
                        <span className="font-bold">{totalPrice.toFixed(2)}{currency}</span>
                    </button>
                </div>
            )}

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                items={cartItems}
                totalPrice={totalPrice}
                restaurantName={restaurant.name}
                restaurantWhatsApp={restaurant.whatsapp_number}
                onUpdateQuantity={updateCartItemQuantity}
            />
        </div>
    );
}
