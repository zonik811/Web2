'use server'

import { databases } from "@/lib/appwrite-admin";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { PagoCompra, CompraProveedor } from "@/types/inventario";

const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLL_COMPRAS = 'compras';
const COLL_PAGO_COMPRAS = 'pago_compras';

export async function registrarPagoCompra(data: {
    compra_id: string;
    monto: number;
    fecha_pago: string;
    metodo_pago: string;
    referencia?: string;
    notas?: string;
}) {
    try {
        // databases is already initialized with admin privileges


        // 1. Create Payment Record
        await databases.createDocument(
            DB_ID,
            COLL_PAGO_COMPRAS,
            ID.unique(),
            {
                compra_id: data.compra_id,
                monto: data.monto,
                fecha_pago: data.fecha_pago,
                metodo_pago: data.metodo_pago,
                referencia: data.referencia,
                notas: data.notas
            }
        );

        // 2. Check Total Payments vs Purchase Total
        // Get all payments for this purchase
        const pagos = await databases.listDocuments(
            DB_ID,
            COLL_PAGO_COMPRAS,
            [Query.equal('compra_id', data.compra_id)]
        );

        const totalPagado = pagos.documents.reduce((acc: number, doc: any) => acc + (doc.monto || 0), 0);

        // Get Purchase
        const compra = await databases.getDocument<CompraProveedor>(
            DB_ID,
            COLL_COMPRAS,
            data.compra_id
        );

        // Update Status if paid in full (or close enough for floating point)
        // Update Status and Total Paid
        const nuevoEstado = (totalPagado >= (compra.total - 1)) ? 'pagado' : compra.estado_pago;

        await databases.updateDocument(
            DB_ID,
            COLL_COMPRAS,
            data.compra_id,
            {
                estado_pago: nuevoEstado,
                monto_pagado: totalPagado
            }
        );

        revalidatePath('/admin/inventario/compras');
        return { success: true };
    } catch (error) {
        console.error("Error registrando pago:", error);
        return { success: false, error: "Error al registrar pago" };
    }
}

export async function obtenerPagosCompra(compraId: string) {
    try {
        const response = await databases.listDocuments<PagoCompra>(
            DB_ID,
            COLL_PAGO_COMPRAS,
            [Query.equal('compra_id', compraId), Query.orderDesc('fecha_pago')]
        );
        return response.documents;
    } catch (error) {
        console.error("Error obteniendo pagos:", error);
        return [];
    }
}
