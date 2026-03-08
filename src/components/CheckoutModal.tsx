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
    restaurantLogo?: string | null;
    restaurantSubtitle?: string | null;
    onUpdateQuantity: (id: string | number, delta: number) => void;
}

export function CheckoutModal({
    isOpen,
    onClose,
    items,
    totalPrice,
    restaurantWhatsApp,
    restaurantName,
    restaurantLogo,
    restaurantSubtitle,
    onUpdateQuantity,
}: CheckoutModalProps) {
    const handleWhatsAppOrder = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const customerName = formData.get("customerName") as string;
        const notes = formData.get("notes") as string;
        const tableOrAddress = formData.get("tableOrAddress") as string;

        let message = `مرحباً ${restaurantName} 👋\n\n`;
        message += `*تفاصيل الطلب:*\n`;

        items.forEach((item) => {
            message += `- ${item.quantity}x ${item.title} (${(item.price * item.quantity).toFixed(2)} ₪)\n`;
        });

        message += `\n*الإجمالي:* ${totalPrice.toFixed(2)} ₪\n`;

        message += `\n*الاسم:* ${customerName}`;
        if (tableOrAddress) message += `\n*العنوان:* ${tableOrAddress}`;
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
                allowTaint: false,
                backgroundColor: "#ffffff",
                logging: false,
            });
            const image = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement("a");
            link.href = image;
            link.download = `فاتورة_${restaurantName}_${new Date().getTime()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
                                <div className="mb-6 rounded-3xl bg-white p-5 border border-border shadow-sm print-container print:shadow-none">
                                    <div id="receipt-capture" className="bg-white text-black p-6 rounded-3xl" style={{ backgroundColor: '#ffffff', color: '#000000', direction: 'rtl' }}>
                                        <div className="text-center mb-6 border-b-2 border-dashed border-gray-200 pb-6">
                                            {restaurantLogo && (
                                                <img src={restaurantLogo} alt="Logo" className="mx-auto h-20 w-20 rounded-2xl object-cover mb-4 shadow-sm border border-gray-100" crossOrigin="anonymous" />
                                            )}
                                            <h3 className="font-extrabold text-2xl" style={{ color: '#111827' }}>{restaurantName}</h3>
                                            {restaurantSubtitle && <p className="text-sm font-medium mt-1" style={{ color: '#6b7280' }}>{restaurantSubtitle}</p>}
                                            <div className="mt-4 inline-block bg-gray-100 px-4 py-1.5 rounded-full text-xs font-bold" style={{ color: '#4b5563' }}>فاتورة طلب إلكترونية</div>
                                        </div>
                                        <h4 className="mb-4 font-bold text-sm px-1" style={{ color: '#374151' }}>ملخص الطلبات</h4>
                                        <div className="space-y-4 px-1">
                                            {items.map((item) => (
                                                <div key={item.id} className="flex flex-col gap-2 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                                    <div className="flex justify-between font-bold text-lg" style={{ color: '#1f2937' }}>
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
                                        <div className="mt-6 flex justify-between border-t-2 border-dashed border-gray-200 pt-5 px-1 text-xl font-black">
                                            <span style={{ color: '#111827' }}>الإجمالي المستحق</span>
                                            <span style={{ color: '#111827' }}>{totalPrice.toFixed(2)} ₪</span>
                                        </div>
                                        <div className="mt-6 text-center text-xs font-medium" style={{ color: '#9ca3af' }}>
                                            نشكركم لاختياركم {restaurantName} - أُنشئت بواسطة <strong>menuUp</strong>
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
                                            العنوان (اختياري)
                                        </label>
                                        <input
                                            type="text"
                                            id="tableOrAddress"
                                            name="tableOrAddress"
                                            placeholder="مثال: شارع الجامعة، عمارة 5"
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
