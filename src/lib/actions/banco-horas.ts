"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    MovimientoBancoHoras,
    CrearMovimientoBancoInput
} from "@/types";

export async function obtenerBalanceBancoHoras(empleadoId: string): Promise<number> {
    try {
        const movimientos = await obtenerHistorialBanco(empleadoId);

        // Sumar ABONOS y restar DEUDAS
        const balance = movimientos.reduce((acc, mov) => {
            if (mov.tipo === 'ABONO') return acc + mov.cantidadMinutos;
            if (mov.tipo === 'DEUDA') return acc - mov.cantidadMinutos;
            return acc;
        }, 0);

        return balance;
    } catch (error) {
        console.error("Error obteniendo balance:", error);
        return 0;
    }
}

export async function registrarMovimientoBanco(data: CrearMovimientoBancoInput): Promise<{ success: boolean; error?: string }> {
    try {
        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.BANCO_HORAS,
            ID.unique(),
            {
                ...data,
                cantidadMinutos: Math.abs(data.cantidadMinutos) // Asegurar positivo
            }
        );
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function obtenerHistorialBanco(empleadoId: string): Promise<MovimientoBancoHoras[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.BANCO_HORAS,
            [
                Query.equal("empleadoId", empleadoId),
                Query.orderDesc("fecha")
            ]
        );
        return response.documents as unknown as MovimientoBancoHoras[];
    } catch (error) {
        return [];
    }
}

/**
 * Obtener todos los movimientos del banco de horas (Admin)
 */
export async function obtenerTodosLosMovimientos(): Promise<MovimientoBancoHoras[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.BANCO_HORAS,
            [
                Query.orderDesc("fecha"),
                Query.limit(100) // Limit initial load for performance
            ]
        );
        return response.documents as unknown as MovimientoBancoHoras[];
    } catch (error: any) {
        // Fallback for missing index
        if (error.message?.includes("Index not found")) {
            console.warn("Index missing, fetching all without sort");
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.BANCO_HORAS,
                []
            );
            return (response.documents as unknown as MovimientoBancoHoras[])
                .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        }
        console.error(error);
        return [];
    }
}

/**
 * Obtener balance actual de todos los empleados
 * Retorna un mapa { empleadoId: minutos }
 */
export async function obtenerBalancesGlobales(): Promise<Record<string, number>> {
    try {
        // Fetch all movements (this might be heavy in production, but okay for MVP)
        // In a real app, we should have a separate 'Balances' collection updated via triggers.
        // For now, we aggregate in memory.
        let allMovements: MovimientoBancoHoras[] = [];
        let cursor = null;

        // Simple loop to fetch all if needed, but for now just one page
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.BANCO_HORAS,
            [Query.limit(1000)]
        );
        allMovements = response.documents as unknown as MovimientoBancoHoras[];

        const balances: Record<string, number> = {};

        allMovements.forEach(mov => {
            if (!balances[mov.empleadoId]) balances[mov.empleadoId] = 0;
            if (mov.tipo === 'ABONO') balances[mov.empleadoId] += mov.cantidadMinutos;
            else if (mov.tipo === 'DEUDA') balances[mov.empleadoId] -= mov.cantidadMinutos;
        });

        return balances;
    } catch (error) {
        console.error("Error calculando balances globales:", error);
        return {};
    }
}
