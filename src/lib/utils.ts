import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Formatea un número como precio en pesos colombianos (COP)
 */
export function formatearPrecio(precio: number): string {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(precio);
}

/**
 * Formatea una fecha en formato legible en español
 */
export function formatearFecha(fecha: string | Date): string {
    const date = typeof fecha === "string" ? new Date(fecha) : fecha;
    return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "long",
    }).format(date);
}

/**
 * Formatea una fecha y hora en formato completo
 */
export function formatearFechaHora(fecha: string | Date): string {
    const date = typeof fecha === "string" ? new Date(fecha) : fecha;
    return new Intl.DateTimeFormat("es-CO", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(date);
}

/**
 * Calcula el nombre completo a partir de nombre y apellido
 */
export function nombreCompleto(nombre: string, apellido: string): string {
    return `${nombre} ${apellido}`;
}
