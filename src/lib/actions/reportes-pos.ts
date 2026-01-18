"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";

export type ReportePago = {
    metodo: string; // 'efectivo', 'tarjeta', 'transferencia'
    detalle: string; // 'Visa', 'Nequi', etc.
    total: number;
    cantidad: number;
};

export type DetalleVenta = {
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
};

export type VentaDetallada = {
    $id: string;
    numeroOrden: string;
    fechaOrden: string;
    clienteNombre: string;
    total: number;
    metodoPago: string;
    detalles: DetalleVenta[];
};

export type ReporteResumen = {
    totalVentas: number;
    totalEfectivo: number;
    totalTarjeta: number;
    totalTransferencia: number;
    desglosePagos: ReportePago[];
};

export async function obtenerReporteVentas(fechaInicio: Date, fechaFin: Date): Promise<ReporteResumen> {
    try {
        // Appwrite queries for range
        const queries = [
            Query.greaterThanEqual("fechaOrden", fechaInicio.toISOString().split('T')[0]),
            Query.lessThanEqual("fechaOrden", fechaFin.toISOString().split('T')[0]),
            Query.limit(100), // Pagination might be needed for large sets, keeping simple for now
            Query.equal("origen", "pos") // Only POS sales
        ];

        let hasMore = true;
        let cursor = null;
        let allOrdenes: any[] = [];

        // Fetch all matching orders
        // Note: For huge data, database-level aggregation is better, but client-side (server here) 
        // aggregation is often necessary with Appwrite until functions are used.
        while (hasMore) {
            const currentQueries = cursor ? [...queries, Query.cursorAfter(cursor)] : queries;
            const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES, currentQueries);

            allOrdenes = [...allOrdenes, ...res.documents];

            if (res.documents.length < 100) {
                hasMore = false;
            } else {
                cursor = res.documents[res.documents.length - 1].$id;
            }
        }

        // Aggregate Data
        const resumen: ReporteResumen = {
            totalVentas: 0,
            totalEfectivo: 0,
            totalTarjeta: 0,
            totalTransferencia: 0,
            desglosePagos: []
        };

        const mapDetalles = new Map<string, ReportePago>();

        allOrdenes.forEach(orden => {
            const total = orden.total || 0;
            const metodo = orden.metodoPago || 'otros'; // Changed from metodo_pago
            let detalle = 'General';

            // Extract detail from 'notas' or specific field if we added it (we put it in notas earlier)
            // Format: "Pago: metodo - detalle"
            if (orden.notas && orden.notas.startsWith("Pago:")) {
                const parts = orden.notas.split(" - ");
                if (parts.length > 1) {
                    detalle = parts[1].trim();
                }
            }

            // Update Totals
            resumen.totalVentas += total;
            if (metodo === 'efectivo') resumen.totalEfectivo += total;
            if (metodo === 'tarjeta') resumen.totalTarjeta += total;
            if (metodo === 'transferencia') resumen.totalTransferencia += total;

            // Update Breakdown
            const key = `${metodo}-${detalle}`;
            if (!mapDetalles.has(key)) {
                mapDetalles.set(key, { metodo, detalle, total: 0, cantidad: 0 });
            }
            const entry = mapDetalles.get(key)!;
            entry.total += total;
            entry.cantidad += 1;
        });

        resumen.desglosePagos = Array.from(mapDetalles.values()).sort((a, b) => b.total - a.total);

        return resumen;

    } catch (error) {
        console.error("Error obteniendo reporte ventas:", error);
        return {
            totalVentas: 0,
            totalEfectivo: 0,
            totalTarjeta: 0,
            totalTransferencia: 0,
            desglosePagos: []
        };
    }
}

export async function obtenerVentasDetalladas(fechaInicio: Date, fechaFin: Date): Promise<VentaDetallada[]> {
    try {
        // Fetch orders
        const queries = [
            Query.greaterThanEqual("fechaOrden", fechaInicio.toISOString().split('T')[0]),
            Query.lessThanEqual("fechaOrden", fechaFin.toISOString().split('T')[0]),
            Query.equal("origen", "pos"),
            Query.orderDesc("$createdAt"),
            Query.limit(100)
        ];

        const ordenesRes = await databases.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES, queries);

        // Fetch details for each order
        const ventasDetalladas: VentaDetallada[] = [];

        for (const orden of ordenesRes.documents) {
            const detallesRes = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.ORDEN_DETALLES,
                [Query.equal("ordenId", orden.$id)]
            );

            ventasDetalladas.push({
                $id: orden.$id,
                numeroOrden: orden.numeroOrden,
                fechaOrden: orden.fechaOrden,
                clienteNombre: orden.clienteNombre || "Cliente Mostrador",
                total: orden.total || 0,
                metodoPago: orden.metodoPago || "efectivo",
                detalles: detallesRes.documents.map((det: any) => ({
                    productoNombre: det.productoNombre,
                    cantidad: det.cantidad,
                    precioUnitario: det.precioUnitario,
                    subtotal: det.subtotal
                }))
            });
        }

        return ventasDetalladas;
    } catch (error) {
        console.error("Error obteniendo ventas detalladas:", error);
        return [];
    }
}

export async function obtenerHistorialCierres(fechaInicio: Date, fechaFin: Date) {
    try {
        const queries = [
            Query.greaterThanEqual("fecha_apertura", fechaInicio.toISOString()),
            Query.lessThanEqual("fecha_apertura", fechaFin.toISOString()),
            Query.orderDesc("fecha_apertura"),
            Query.limit(50)
        ];

        const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, queries);
        return res.documents;
    } catch (error) {
        console.error("Error historial cierres:", error);
        return [];
    }
}
