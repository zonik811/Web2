"use server";

import { databases, storage } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { CompraProveedor, MovimientoInventario } from "@/types/inventario";
import { revalidatePath } from "next/cache";
import { registrarMovimiento } from "./inventario";

export async function obtenerCompras(filtro?: string): Promise<CompraProveedor[]> {
    try {
        const queries = [Query.orderDesc("fecha_compra"), Query.limit(50)];
        // TODO: Filter by provider name requires joining or searching provider ID if client sends ID
        // For simple UI list now

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMPRAS,
            queries
        );

        // We need to fetch provider names manually or via client side map
        // For server action, let's just return raw and handle lookup in UI or fetch provider names here
        return response.documents as unknown as CompraProveedor[];
    } catch (error) {
        console.error("Error obteniendo compras:", error);
        return [];
    }
}

export interface DetalleItemCompra {
    producto_id: string;
    cantidad: number;
    precio_unitario: number; // Costo en este momento
}

export async function registrarCompra(data: {
    proveedor_id: string;
    fecha_compra: string;
    factura_referencia?: string;
    items: DetalleItemCompra[];
    comprobante_url?: string;
    estado_pago?: 'pendiente' | 'pagado';
    aplicar_iva?: boolean;
    metodo_pago?: string; // New field from UI if added, or default
}) {
    try {
        // 1. Calculate Total
        const subtotal = data.items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
        const impuestos = data.aplicar_iva ? subtotal * 0.19 : 0;
        const total = subtotal + impuestos;

        // 2. Prepare Payload
        // Fix for legacy schema: 'numeroCompra' required
        const numeroCompra = data.factura_referencia
            ? `C-${data.factura_referencia}`
            : `C-${Date.now()}`;

        const payload = {
            // New Schema Fields
            proveedor_id: data.proveedor_id,
            fecha_compra: data.fecha_compra, // Datetime
            factura_referencia: data.factura_referencia,
            comprobante_url: data.comprobante_url,
            detalles_items: JSON.stringify(data.items), // String representation
            subtotal: subtotal,
            iva: impuestos,
            total: total,
            estado_pago: data.estado_pago || 'pagado',

            // Legacy Schema Compatibility Fields (Required based on Dump)
            numeroCompra: numeroCompra,
            proveedorId: data.proveedor_id,
            items: data.items.map(i => JSON.stringify(i)), // Type: string, Array: true
            // Fix legacy Enum: (pendiente, confirmada, recibida, cancelada)
            // If pagado -> recibida (stock added), if pendiente -> pendiente
            estado: data.estado_pago === 'pagado' ? 'recibida' : 'pendiente',
            metodoPago: data.metodo_pago || 'efectivo', // Required
            fechaCompra: data.fecha_compra.substring(0, 10), // Required (Type: string, max 10 chars)
            creadoPor: 'admin', // Required
            pagado: data.estado_pago === 'pagado' // Optional but good to match
        };

        const compra = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.COMPRAS,
            ID.unique(),
            payload
        );

        // 3. Register Stock Movements & Update Product Cost
        for (const item of data.items) {
            // Update stock via movement logic
            await registrarMovimiento({
                producto_id: item.producto_id,
                tipo: 'compra',
                cantidad: item.cantidad,
                motivo: `Compra #${compra.$id.substring(0, 8)} Ref: ${data.factura_referencia || 'N/A'}`,
                fecha: new Date().toISOString()
            });

            // Update Product Cost separate field
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.PRODUCTOS,
                item.producto_id,
                {
                    precio_compra: item.precio_unitario
                }
            );
        }

        revalidatePath("/admin/inventario/compras");
        revalidatePath("/admin/inventario/productos");
        return { success: true, compraId: compra.$id };
    } catch (error) {
        console.error("Error registrando compra:", error);
        return { success: false, error };
    }
}

export async function eliminarCompra(id: string) {
    try {
        // 1. Get Purchase to revert Stock
        const compra = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.COMPRAS,
            id
        ) as unknown as CompraProveedor;

        // Parse items if they exist stringified
        let items: DetalleItemCompra[] = [];
        if (compra.detalles_items) {
            try {
                items = JSON.parse(compra.detalles_items);
            } catch (e) { console.error("Error parsing items", e); }
        } else if (Array.isArray((compra as any).items)) {
            // Legacy fallback
            items = (compra as any).items.map((i: string) => JSON.parse(i));
        }

        // 2. Revert Stock
        for (const item of items) {
            await registrarMovimiento({
                producto_id: item.producto_id,
                tipo: 'salida', // Subtract what was added
                cantidad: item.cantidad,
                motivo: `Anulación Compra #${id.substring(0, 8)}`,
                fecha: new Date().toISOString()
            });
        }

        // 3. Delete Purchase
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.COMPRAS,
            id
        );

        revalidatePath("/admin/inventario/compras");
        revalidatePath("/admin/inventario/productos");
        return { success: true };
    } catch (error) {
        console.error("Error eliminando compra:", error);
        return { success: false, error };
    }
}
