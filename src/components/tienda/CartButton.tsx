"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

export function CartButton() {
    const { totalItems, openCart } = useCart();

    if (totalItems === 0) {
        return null; // No mostrar si el carrito está vacío
    }

    return (
        <button
            onClick={openCart}
            className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group animate-pulse hover:animate-none"
            aria-label="Abrir carrito"
        >
            <div className="relative">
                <ShoppingCart className="h-8 w-8" />
                {totalItems > 0 && (
                    <span className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-black shadow-lg">
                        {totalItems}
                    </span>
                )}
            </div>
        </button>
    );
}
