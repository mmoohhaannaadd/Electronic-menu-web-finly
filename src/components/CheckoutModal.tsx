"use client";

import { X, Send, Download, Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import html2canvas from "html2canvas";

export interface CartItem {
    id: string | number;
    title: string;
    price: number;
    quantity: number;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    totalPrice: number;
    restaurantWhatsApp: string;
    restaurantName: string;
    onUpdateQuantity: (id: string | number, delta: number) => void;
}

export function CheckoutModal({
    isOpen,
    onClose,
    items,
    totalPrice,
    restaurantWhatsApp,
    restaurantName,
    onUpdateQuantity,
}: CheckoutModalProps) {
    const handleWhatsAppOrder = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const customerName = formData.get("customerName") as string;
        const notes = formData.get("notes") as string;
        const tableOrAddress = formData.get("tableOrAddress") as string;

        // Build the WhatsApp message
        let message = `مرحباً ${restaurantName} 👋\n\n`;
        message += `*تفاصيل الطلب:*\n`;

        items.forEach((item) => {
            message += `- ${item.quantity}x ${item.title} (${(item.price * item.quantity).toFixed(2)} ₪)\n`;
        });

        message += `\n*الإجمالي:* ${totalPrice.toFixed(2)} ₪\n`;

        message += `\n*الاسم:* ${customerName}`;
        if (tableOrAddress) message += `\n*الطاولة/العنوان:* ${tableOrAddress}`;
        if (notes) message += `\n*ملاحظات:* ${notes}`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${restaurantWhatsApp}?text=${encodedMessage}`;

        // Open WhatsApp in a new tab
        window.open(whatsappUrl, "_blank");
        onClose();
    };

    const handleDownloadReceipt = async () => {
        const receiptElement = document.getElementById("receipt-capture");
        if (!receiptElement) return;

        // Temporarily style the element for better capture
        const originalStyle = receiptElement.style.cssText;
        receiptElement.style.position = 'relative';
        receiptElement.style.zIndex = '9999';

        try {
            const canvas = await html2canvas(receiptElement, {
                scale: 2, // Higher resolution
                useCORS: true,
                backgroundColor: "#ffffff",
                logging: false,
                windowWidth: receiptElement.scrollWidth,
                windowHeight: receiptElement.scrollHeight,
            });
            const image = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement("a");
            link.href = image;
            link.download = `فاتورة_${restaurantName}_${new Date().getTime()}.jpg`;
            link.click();
        } catch (error) {
            console.error("Failed to generate receipt image", error);
            alert("عذراً، حدث خطأ أثناء محاولة حفظ الفاتورة. يرجى المحاولة مرة أخرى.");
        } finally {
            // Restore original style
            receiptElement.style.cssText = originalStyle;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Container */}
                    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-lg rounded-t-3xl bg-surface sm:rounded-3xl flex flex-col max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between border-b border-border p-4 sm:p-6">
                                <h2 className="text-xl font-bold">إتمام الطلب 🛒</h2>
                                <button
                                    onClick={onClose}
                                    className="rounded-full bg-gray-100 p-2 text-muted transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-4 sm:p-6">
                                {/* Order Summary targeted for receipt download */}
                                <div className="mb-6 rounded-2xl bg-white p-5 border border-gray-100 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                    <div id="receipt-capture" className="bg-[#1a1a1a] text-white p-4 rounded-xl print-dark" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
                                        <div className="text-center mb-4 border-b border-gray-700 pb-4">
                                            <h3 className="font-bold text-lg text-primary">{restaurantName}</h3>
                                            <p className="text-xs text-gray-400 mb-1">فاتورة طلب</p>
                                        </div>
                                        <h4 className="mb-3 font-bold text-gray-300 text-sm px-1">ملخص الطلب</h4>
                                        <div className="space-y-4 px-1">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex flex-col gap-2 border-b border-gray-700 pb-3 last:border-0 last:pb-0">
                                                    <div className="flex justify-between font-medium text-white">
                                                        <span>{item.title}</span>
                                                        <span>{item.price * item.quantity} ₪</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 self-start rounded-full bg-gray-50 px-2 py-1 dark:bg-gray-700" data-html2canvas-ignore="true">
                                                        <button
                                                            type="button"
                                                            onClick={() => onUpdateQuantity(item.id, 1)}
                                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition hover:bg-primary hover:text-white dark:bg-gray-600 dark:text-gray-200"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                        <span className="w-4 text-center text-sm font-bold text-primary">{item.quantity}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => onUpdateQuantity(item.id, -1)}
                                                            className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-600 transition hover:bg-red-500 hover:text-white dark:bg-gray-600 dark:text-gray-200"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-4 flex justify-between border-t border-gray-700 pt-4 px-1 text-lg font-bold text-primary">
                                            <span className="text-white">الإجمالي</span>
                                            <span>{totalPrice.toFixed(2)} ₪</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Details Form */}
                                <form id="checkout-form" onSubmit={handleWhatsAppOrder} className="space-y-4">
                                    <div>
                                        <label htmlFor="customerName" className="mb-1 block text-sm font-bold text-muted">
                                            الاسم
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            id="customerName"
                                            name="customerName"
                                            placeholder="أدخل اسمك"
                                            className="w-full rounded-xl border border-border bg-transparent px-4 py-3 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="tableOrAddress" className="mb-1 block text-sm font-bold text-muted">
                                            رقم الطاولة أو العنوان (اختياري)
                                        </label>
                                        <input
                                            type="text"
                                            id="tableOrAddress"
                                            name="tableOrAddress"
                                            placeholder="مثال: طاولة 4، أو شارع النيل"
                                            className="w-full rounded-xl border border-border bg-transparent px-4 py-3 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="notes" className="mb-1 block text-sm font-bold text-muted">
                                            ملاحظات الطلب (اختياري)
                                        </label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            rows={2}
                                            placeholder="بدون بصل، اكسترا صوص..."
                                            className="w-full resize-none rounded-xl border border-border bg-transparent px-4 py-3 placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </form>
                            </div>

                            <div className="border-t border-border p-4 sm:p-6 bg-surface shrink-0 rounded-b-3xl space-y-3">
                                <button
                                    form="checkout-form"
                                    type="submit"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-4 text-white font-bold text-lg shadow-lg hover:bg-[#20ba56] transition-colors active:scale-[0.98]"
                                >
                                    <Send size={20} className="rtl:-scale-x-100" />
                                    <span>إرسال الطلب عبر واتساب</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDownloadReceipt}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary/20 bg-transparent px-6 py-3 font-bold text-primary transition-colors hover:bg-primary/5 active:scale-[0.98]"
                                >
                                    <Download size={20} />
                                    <span>حفظ الفاتورة كـ صورة</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
