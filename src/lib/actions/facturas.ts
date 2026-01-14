"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type { CreateResponse, UpdateResponse } from "@/types";

/**
 * Factura interface
 */
export interface Factura {
    $id: string;
    ordenTrabajoId: string;
    numeroFactura: string;
    fecha: string;
    subtotal: number;
    impuestos: number;
    total: number;
    terminosPago?: string;
    observaciones?: string;
    createdAt: string;
}

/**
 * Generate invoice number (INV-YYYY-####)
 */
async function generarNumeroFactura(): Promise<string> {
    const year = new Date().getFullYear();

    try {
        // Get all invoices from this year
        const facturas = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FACTURAS,
            [
                Query.greaterThanEqual("numeroFactura", `INV-${year}-0000`),
                Query.lessThan("numeroFactura", `INV-${year + 1}-0000`),
                Query.orderDesc("numeroFactura"),
                Query.limit(1)
            ]
        );

        if (facturas.documents.length === 0) {
            return `INV-${year}-0001`;
        }

        const ultimoNumero = facturas.documents[0].numeroFactura as string;
        const numeroActual = parseInt(ultimoNumero.split('-')[2]);
        const nuevoNumero = (numeroActual + 1).toString().padStart(4, '0');

        return `INV-${year}-${nuevoNumero}`;
    } catch (error) {
        // If error, start from 0001
        return `INV-${year}-0001`;
    }
}

/**
 * Create invoice for order
 */
export async function crearFactura(data: {
    ordenTrabajoId: string;
    subtotal: number;
    impuestos: number;
    total: number;
    terminosPago?: string;
    observaciones?: string;
}): Promise<CreateResponse<Factura>> {
    try {


        // Check if invoice already exists for this order
        const existing = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FACTURAS,
            [Query.equal("ordenTrabajoId", data.ordenTrabajoId)]
        );

        if (existing.documents.length > 0) {
            return {
                success: false,
                error: "Ya existe una factura para esta orden"
            };
        }

        const numeroFactura = await generarNumeroFactura();

        const factura = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.FACTURAS,
            ID.unique(),
            {
                ordenTrabajoId: data.ordenTrabajoId,
                numeroFactura,
                fecha: new Date().toISOString(),
                subtotal: data.subtotal,
                impuestos: data.impuestos,
                total: data.total,
                terminosPago: data.terminosPago || "",
                observaciones: data.observaciones || "",
                createdAt: new Date().toISOString()
            }
        );

        return {
            success: true,
            data: factura as unknown as Factura
        };
    } catch (error: any) {
        console.error("Error creando factura:", error);
        return {
            success: false,
            error: error.message || "Error al crear factura"
        };
    }
}

/**
 * Get invoice for order
 */
export async function obtenerFacturaOrden(ordenId: string): Promise<Factura | null> {
    try {
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FACTURAS,
            [Query.equal("ordenTrabajoId", ordenId)]
        );

        if (result.documents.length === 0) {
            return null;
        }

        return result.documents[0] as unknown as Factura;
    } catch (error: any) {
        console.error("Error obteniendo factura:", error);
        return null;
    }
}
