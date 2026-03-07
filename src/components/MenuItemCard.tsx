"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface MenuItemCardProps {
    title: string;
    description: string;
    price: number;
    discount_type?: "percentage" | "fixed_price" | null;
    discount_value?: number | null;
    imageUrl?: string;
    onAdd?: () => void;
}

export function MenuItemCard({ title, description, price, discount_type, discount_value, imageUrl, onAdd }: MenuItemCardProps) {
    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="group relative flex overflow-hidden rounded-2xl bg-surface soft-shadow transition-shadow hover:hover-shadow p-3 gap-4"
        >
            {/* Image Section (Right side in RTL) */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        sizes="112px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl text-gray-300">
                        🍔
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col justify-between py-1">
                <div>
                    <h3 className="font-bold text-lg text-foreground line-clamp-1">{title}</h3>
                    <p className="mt-1 text-sm text-muted leading-relaxed line-clamp-2">
                        {description}
                    </p>
                </div>

                <div className="flex items-end justify-between mt-2">
                    <div className="flex flex-col">
                        {discount_type && discount_value && (
                            <span className="text-xs text-muted line-through">
                                {price.toFixed(2)} ₪
                            </span>
                        )}
                        <span className="font-bold text-primary">
                            {(discount_type === "percentage"
                                ? price - (price * (discount_value || 0)) / 100
                                : discount_type === "fixed_price"
                                    ? discount_value
                                    : price
                            )?.toFixed(2)} ₪
                        </span>
                    </div>
                    <button
                        onClick={onAdd}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                        <Plus size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
