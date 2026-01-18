"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { revalidatePath } from "next/cache";
import { registrarMovimientoCaja } from "./caja";

type VentaItem = {
    id: string; // Product ID
    nombre: string;
    precio: number;
    cantidad: number;
};

type VentaData = {
    turno_id: string;
    total: number;
    subtotal: number;
    impuestos: number;
    metodo_pago: 'efectivo' | 'tarjeta' | 'transferencia';
    metodo_pago_detalle?: string;
    items: VentaItem[];
    usuario_id: string;
    monto_recibido: number;
    cambio: number;
    cliente_id?: string;
    cliente_nombre?: string;
    cliente_telefono?: string;
    cliente_email?: string;
};


async function generarNumeroOrdenVenta(): Promise<string> {
    const año = new Date().getFullYear();
    const mes = String(new Date().getMonth() + 1).padStart(2, '0');

    // Get last order to increment
    const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.ORDENES,
        [
            Query.orderDesc("$createdAt"),
            Query.limit(1)
        ]
    );

    let numero = 1;
    if (response.documents.length > 0) {
        // Try to parse last order number
        // Expected format: POS-2024-05-0001 or V-2024-05-0001
        // We will stick to POS-{Y}-{M}-{SEQ} for POS sales or just general if mixed.
        // Let's check if the last one matches a pattern
        const ultimaOrden = response.documents[0];
        if (ultimaOrden.numeroOrden) {
            const parts = ultimaOrden.numeroOrden.split('-');
            if (parts.length >= 4) {
                const lastSeq = parseInt(parts[3]);
                if (!isNaN(lastSeq)) numero = lastSeq + 1;
            }
        }
    }

    return `POS-${año}-${mes}-${String(numero).padStart(4, '0')}`;
}

export async function procesarVenta(data: VentaData) {
    try {
        // 1. Validate Stock first (optimistic check)
        for (const item of data.items) {
            const productDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.PRODUCTOS, item.id);
            if (productDoc.stock < item.cantidad) {
                return { success: false, error: `Stock insuficiente para ${item.nombre}. Stock actual: ${productDoc.stock}` };
            }
        }

        // 2. Create Venta (Master)
        const ventaId = ID.unique();
        const numeroOrden = await generarNumeroOrdenVenta();

        const venta = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.ORDENES,
            ventaId,
            {
                numeroOrden: numeroOrden,
                fechaOrden: new Date().toISOString().split('T')[0],
                clienteNombre: data.cliente_nombre || "Cliente Mostrador",
                clienteTelefono: data.cliente_telefono || "0000000000",
                clienteEmail: data.cliente_email || "venta@pos.com",
                total: data.total,
                subtotal: data.subtotal,
                impuestos: data.impuestos,
                estado: "entregada",
                items: data.items.map(item => item.nombre),
                metodoPago: data.metodo_pago,
                notas: data.metodo_pago_detalle ? `Pago: ${data.metodo_pago} - ${data.metodo_pago_detalle}` : undefined,
                origen: "pos",
                turnoId: data.turno_id,
                usuarioId: data.usuario_id
            }
        );

        // 3. Create Details & Update Stock
        for (const item of data.items) {
            // A. Save detailed line item to ORDEN_DETALLES
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.ORDEN_DETALLES,
                ID.unique(),
                {
                    ordenId: ventaId,
                    productoId: item.id,
                    productoNombre: item.nombre,
                    cantidad: item.cantidad,
                    precioUnitario: item.precio,
                    subtotal: item.precio * item.cantidad
                }
            );

            // B. Decrease Stock
            const productDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.PRODUCTOS, item.id);
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.PRODUCTOS,
                item.id,
                { stock: productDoc.stock - item.cantidad }
            );
        }

        // 4. Register Cash Movement
        await registrarMovimientoCaja({
            turno_id: data.turno_id,
            tipo: 'venta',
            monto: data.total,
            descripcion: `Venta POS #${numeroOrden} - ${data.metodo_pago_detalle || data.metodo_pago}`,
            metodo_pago: data.metodo_pago,
            referencia_id: ventaId,
            fecha: new Date().toISOString(),
            usuario_id: data.usuario_id
        });

        revalidatePath("/admin/ventas/pos");
        return { success: true, ventaId: ventaId };

    } catch (error) {
        console.error("Error procesando venta:", error);
        return { success: false, error: "Error interno procesando venta" };
    }
}

