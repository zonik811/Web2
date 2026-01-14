"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Producto } from '@/types/inventario';
import { CartItem } from '@/types/tienda';

interface CartContextType {
    items: CartItem[];
    addItem: (producto: Producto, cantidad?: number) => void;
    removeItem: (productoId: string) => void;
    updateQuantity: (productoId: string, cantidad: number) => void;
    clearCart: () => void;
    total: number;
    totalItems: number;
    isOpen: boolean;
    openCart: () => void;
    closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dieselparts_cart';

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    // Cargar carrito desde localStorage al montar
    useEffect(() => {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setItems(parsedCart);
            } catch (error) {
                console.error('Error cargando carrito:', error);
            }
        }
    }, []);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const addItem = (producto: Producto, cantidad: number = 1) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.producto.$id === producto.$id);

            if (existingItem) {
                // Si ya existe, incrementar cantidad
                return prevItems.map(item =>
                    item.producto.$id === producto.$id
                        ? { ...item, cantidad: item.cantidad + cantidad }
                        : item
                );
            } else {
                // Si no existe, agregar nuevo
                return [...prevItems, { producto, cantidad }];
            }
        });
    };

    const removeItem = (productoId: string) => {
        setItems(prevItems => prevItems.filter(item => item.producto.$id !== productoId));
    };

    const updateQuantity = (productoId: string, cantidad: number) => {
        if (cantidad <= 0) {
            removeItem(productoId);
            return;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.producto.$id === productoId
                    ? { ...item, cantidad }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const openCart = () => setIsOpen(true);
    const closeCart = () => setIsOpen(false);

    // Calcular total
    const total = items.reduce((sum, item) => {
        const precio = item.producto.tiene_descuento
            ? (item.producto.precio_promocional ?? 0)
            : (item.producto.precio_venta ?? 0);
        return sum + (precio * item.cantidad);
    }, 0);

    // Calcular total de items
    const totalItems = items.reduce((sum, item) => sum + item.cantidad, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                total,
                totalItems,
                isOpen,
                openCart,
                closeCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
