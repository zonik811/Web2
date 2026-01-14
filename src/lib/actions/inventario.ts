"use server";

import { databases, storage } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID, Query, Models } from "node-appwrite";
import { Producto, Proveedor, MovimientoInventario } from "@/types/inventario";
import { revalidatePath } from "next/cache";

// ... (existing code) ...

// ==========================================
// PROVEEDORES
// ==========================================

export async function obtenerProveedores(filtro?: string): Promise<Proveedor[]> {
    try {
        const queries = [Query.orderAsc("nombre")];
        if (filtro) {
            queries.push(Query.search("nombre", filtro));
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PROVEEDORES,
            queries
        );
        return response.documents as unknown as Proveedor[];
    } catch (error) {
        console.error("Error obteniendo proveedores:", error);
        return [];
    }
}

export async function crearProveedor(data: Omit<Proveedor, "$id" | "createdAt" | "updatedAt">) {
    try {
        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PROVEEDORES,
            ID.unique(),
            data
        );
        revalidatePath("/admin/inventario/proveedores");
        return { success: true };
    } catch (error) {
        console.error("Error creando proveedor:", error);
        return { success: false, error };
    }
}

export async function actualizarProveedor(id: string, data: Partial<Proveedor>) {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PROVEEDORES,
            id,
            data
        );
        revalidatePath("/admin/inventario/proveedores");
        return { success: true };
    } catch (error) {
        console.error("Error actualizando proveedor:", error);
        return { success: false, error };
    }
}

// ==========================================
// PRODUCTOS
// ==========================================

export async function eliminarProveedor(id: string) {
    try {
        // 1. Check for dependencies (purchases)
        const compras = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMPRAS,
            [Query.equal("proveedor_id", id), Query.limit(1)]
        );

        if (compras.total > 0) {
            return { success: false, error: "No se puede eliminar: El proveedor tiene historial de compras." };
        }

        // 2. Delete
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.PROVEEDORES,
            id
        );

        revalidatePath("/admin/inventario/proveedores");
        return { success: true };
    } catch (error) {
        console.error("Error eliminando proveedor:", error);
        return { success: false, error };
    }
}

export async function obtenerKPIsProveedores() {
    try {
        // 1. Total & Active Suppliers
        const totalProvs = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PROVEEDORES,
            [Query.limit(1)]
        );

        const activeProvs = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PROVEEDORES,
            [Query.equal("activo", true), Query.limit(1)]
        );

        // 2. Pending Debt (COMPRAS collection)
        const pendingPurchases = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.COMPRAS,
            [Query.equal("estado_pago", "pendiente"), Query.limit(1000)]
        );

        const totalDeuda = pendingPurchases.documents.reduce((acc, doc) => acc + (doc.total || 0), 0);
        const proveedoresConDeuda = new Set(pendingPurchases.documents.map(d => d.proveedor_id)).size;

        return {
            totalProveedores: totalProvs.total,
            proveedoresActivos: activeProvs.total,
            proveedoresConDeuda: proveedoresConDeuda,
            totalDeuda: totalDeuda
        };
    } catch (error) {
        console.error("Error calculando KPIs proveedores:", error);
        return {
            totalProveedores: 0,
            proveedoresActivos: 0,
            proveedoresConDeuda: 0,
            totalDeuda: 0
        };
    }
}

export async function obtenerProductos(search?: string): Promise<Producto[]> {
    try {
        const queries = [Query.limit(100), Query.orderDesc("createdAt")];
        if (search) {
            // Search by name, SKU or barcode provided by user
            queries.push(Query.search("nombre", search));
            // Note: Appwrite doesn't support OR between fields easily in one query yet without specific index setup
            // For now search on name is primary. 
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PRODUCTOS,
            queries
        );

        // Populate supplier info if needed? (Not doing join here for performance unless requested)
        return response.documents as unknown as Producto[];
    } catch (error) {
        console.error("Error obteniendo productos:", error);
        return [];
    }
}

export async function obtenerProductoPorCodigo(codigo: string): Promise<Producto | null> {
    try {
        // Try searching by SKU or Barcode
        // Logic: First try Barcode
        let response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTOS, [
            Query.equal("codigo_barras", codigo),
            Query.limit(1)
        ]);

        if (response.documents.length === 0) {
            // Try SKU
            response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTOS, [
                Query.equal("sku", codigo),
                Query.limit(1)
            ]);
        }

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as Producto;
        }
        return null;
    } catch (error) {
        console.error("Error buscando producto por codigo:", error);
        return null;
    }
}

export async function crearProducto(data: Omit<Producto, "$id" | "createdAt" | "updatedAt"> & { imagenesFiles?: FormData }) {
    try {
        // TODO: Handle Image Upload processing if 'imagenesFiles' logic is added here or separate

        // Fix for legacy schema: We updated schema to include new fields!
        // Now we can send everything + redundant legacy fields for safety.

        const payload = {
            ...data,
            // Legacy Mappings
            categoria: data.categoria_id || "general",
            precio: data.precio_venta,
            // stock: data.stock, // Removed duplicate

            // Explicit New Fields (Required by upgraded schema)
            stock: data.stock, // Ensure stock is set
            precio_venta: data.precio_venta,
            categoria_id: data.categoria_id || "general"
        };

        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PRODUCTOS,
            ID.unique(),
            payload
        );

        // Initial Stock Movement
        if (data.stock > 0) {
            // We'll treat this as initial inventory (we need the new product ID though)
            // Complexity: we get the doc back.
        }

        revalidatePath("/admin/inventario/productos");
        return { success: true };
    } catch (error) {
        console.error("Error creando producto:", error);
        return { success: false, error };
    }
}

export async function actualizarProducto(id: string, data: Partial<Producto>) {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PRODUCTOS,
            id,
            data
        );
        revalidatePath("/admin/inventario/productos");
        return { success: true };
    } catch (error) {
        console.error("Error actualizando producto:", error);
        return { success: false, error };
    }
}

// ==========================================
// MOVIMIENTOS E INVENTARIO
// ==========================================

export async function registrarMovimiento(movimiento: Omit<MovimientoInventario, keyof Models.Document>) {
    try {
        // 1. Fetch Product FIRST to get current stock (stockAnterior)
        const producto = await databases.getDocument(DATABASE_ID, COLLECTIONS.PRODUCTOS, movimiento.producto_id);

        // Handle both fields for safety
        const currentStock = Number(producto.stock !== undefined ? producto.stock : (producto.stock_actual || 0));

        // 2. Calculate New Stock Logic
        let newStock = currentStock;
        if (['entrada', 'compra'].includes(movimiento.tipo)) {
            newStock += Math.abs(movimiento.cantidad);
        } else if (['salida', 'venta'].includes(movimiento.tipo)) {
            newStock -= Math.abs(movimiento.cantidad);
        } else if (movimiento.tipo === 'ajuste') {
            newStock += movimiento.cantidad;
        }



        // 3. Create movement record with strictly typed payload
        // Map types to DB Enum (entrada, salida, ajuste)
        let dbTipo = movimiento.tipo;
        if (movimiento.tipo === 'compra') dbTipo = 'entrada';
        if (movimiento.tipo === 'venta') dbTipo = 'salida';

        const payload = {
            productoId: movimiento.producto_id,
            producto_id: movimiento.producto_id, // Fix: Both formats exist and are required in DB
            tipo: dbTipo,
            cantidad: Math.abs(movimiento.cantidad),
            stockAnterior: currentStock,
            stockNuevo: newStock,
            motivo: movimiento.motivo || '',
            referenciaId: movimiento.referencia || '', // Mapeo correcto: referencia -> referenciaId
            notas: movimiento.notas || '',
            creadoPor: 'admin', // TODO: Usar usuario real
            fecha: movimiento.fecha.substring(0, 10)
        };

        if (!payload.productoId) throw new Error("productoId is missing");

        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.MOVIMIENTOS,
            ID.unique(),
            payload
        );

        // 4. Update Product Stock
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.PRODUCTOS,
            movimiento.producto_id,
            {
                stock: newStock,
                stock_actual: newStock
            }
        );

        revalidatePath("/admin/inventario/productos");
        return { success: true };
    } catch (error) {
        console.error("Error registrando movimiento:", error);
        return { success: false, error };
    }
}
