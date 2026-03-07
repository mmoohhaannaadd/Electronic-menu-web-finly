"use client";

import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingCartProps {
    itemCount: number;
    totalPrice: number;
    onCheckout: () => void;
}

export function FloatingCart({ itemCount, totalPrice, onCheckout }: FloatingCartProps) {
    return (
        <AnimatePresence>
            {itemCount > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="fixed bottom-6 left-0 right-0 z-50 mx-auto max-w-2xl px-4"
                >
                    <button
                        onClick={onCheckout}
                        className="flex w-full items-center justify-between rounded-full bg-primary px-6 py-4 text-white shadow-xl shadow-primary/30 transition-transform active:scale-95"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                                <ShoppingBag size={20} />
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-primary">
                                    {itemCount}
                                </span>
                            </div>
                            <span className="font-bold text-lg">عرض السلة</span>
                        </div>

                        <div className="flex items-center gap-2 font-bold">
                            <span>{totalPrice.toFixed(2)}</span>
                            <span className="text-sm opacity-90">مجـ</span>
                        </div>
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
