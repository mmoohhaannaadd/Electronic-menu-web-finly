-- 1. Create Tables

-- Restaurants Table
CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    logo_url TEXT,
    theme_color TEXT DEFAULT '#f97316',
    currency TEXT DEFAULT '₪'
);

-- Categories Table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
);

-- Items Table
CREATE TABLE public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2), -- Nullable to support sizes
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_price')),
    discount_value NUMERIC
);

-- Item Sizes Table
CREATE TABLE public.item_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    sort_order INTEGER DEFAULT 0,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_price')),
    discount_value NUMERIC
);


-- 2. Setup Row Level Security (RLS)

-- Enable RLS on all tables
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_sizes ENABLE ROW LEVEL SECURITY;

-- 2.a Restaurants Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Users can insert their own restaurant." ON public.restaurants FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own restaurant." ON public.restaurants FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own restaurant." ON public.restaurants FOR DELETE USING (auth.uid() = owner_id);

-- 2.b Categories Policies
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Users can insert categories to own restaurant." ON public.categories FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants WHERE restaurants.id = restaurant_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Users can update own categories." ON public.categories FOR UPDATE USING (EXISTS (SELECT 1 FROM public.restaurants WHERE restaurants.id = restaurant_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Users can delete own categories." ON public.categories FOR DELETE USING (EXISTS (SELECT 1 FROM public.restaurants WHERE restaurants.id = restaurant_id AND restaurants.owner_id = auth.uid()));

-- 2.c Items Policies
CREATE POLICY "Items are viewable by everyone." ON public.items FOR SELECT USING (true);
CREATE POLICY "Users can insert items to own restaurant." ON public.items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.restaurants WHERE restaurants.id = restaurant_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Users can update own items." ON public.items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.restaurants WHERE restaurants.id = restaurant_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Users can delete own items." ON public.items FOR DELETE USING (EXISTS (SELECT 1 FROM public.restaurants WHERE restaurants.id = restaurant_id AND restaurants.owner_id = auth.uid()));

-- 2.d Item Sizes Policies
CREATE POLICY "Sizes are viewable by everyone." ON public.item_sizes FOR SELECT USING (true);
CREATE POLICY "Users can insert sizes to own restaurant items." ON public.item_sizes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.items JOIN public.restaurants ON restaurants.id = items.restaurant_id WHERE items.id = item_sizes.item_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Users can update own item sizes." ON public.item_sizes FOR UPDATE USING (EXISTS (SELECT 1 FROM public.items JOIN public.restaurants ON restaurants.id = items.restaurant_id WHERE items.id = item_sizes.item_id AND restaurants.owner_id = auth.uid()));
CREATE POLICY "Users can delete own item sizes." ON public.item_sizes FOR DELETE USING (EXISTS (SELECT 1 FROM public.items JOIN public.restaurants ON restaurants.id = items.restaurant_id WHERE items.id = item_sizes.item_id AND restaurants.owner_id = auth.uid()));
