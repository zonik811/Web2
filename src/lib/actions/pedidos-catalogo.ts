"use server";

import { databases } from "@/lib/appwrite-server";
import { ID, Query } from "node-appwrite";
import { PedidoCatalogo, PedidoItem, EstadoPedido, stringifyItems, parseItems } from "@/types/pedidos-catalogo";
import { registrarMovimiento } from "./inventario";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = "pedidos_catalogo";

// Generar número de pedido único
export async function generarNumeroPedido(): Promise<string> {
    const fecha = new Date();
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    // Buscar el último pedido del día
    const { documents } = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_ID,
        [Query.startsWith("numero_pedido", `PED-${year}${month}${day}`), Query.orderDesc("$createdAt"), Query.limit(1)]
    );

    let secuencial = 1;
    if (documents.length > 0) {
        const ultimo = documents[0].numero_pedido.split('-').pop();
        secuencial = parseInt(ultimo || '0') + 1;
    }

    return `PED-${year}${month}${day}-${String(secuencial).padStart(3, '0')}`;
}

// Función auxiliar para asegurar que existan los atributos
async function ensureSchema() {


    try {
        // 1. Diagnóstico: Ver qué atributos existen realmente
        const { attributes } = await databases.listAttributes(DATABASE_ID, COLLECTION_ID);
        const attributeKeys = attributes.map((a: any) => a.key);


        const missingAttributes = [];

        // Lista completa de atributos requeridos
        const schema = {
            enums: [
                { key: 'estado', elements: ['creado', 'confirmado', 'pagado', 'enviado', 'completado', 'cancelado'], required: true, default: null } // Enviamos valor
            ],
            strings: [
                { key: 'metodo_pago_id', size: 50, required: false },
                { key: 'notas', size: 2000, required: false },
                { key: 'mensaje_cliente', size: 2000, required: false },
                { key: 'direccion_envio', size: 500, required: false },
                { key: 'creado_por', size: 50, required: true },
                { key: 'modificado_por', size: 50, required: false },
                { key: 'fecha_confirmacion', size: 50, required: false },
                { key: 'fecha_pago', size: 50, required: false },
                { key: 'fecha_envio', size: 50, required: false },
                { key: 'fecha_completado', size: 50, required: false },
                { key: 'guia_envio', size: 100, required: false },
                { key: 'empresa_envio', size: 100, required: false },
                { key: 'comprobante_url', size: 1000, required: false }
            ],
            floats: [
                { key: 'monto_pagado', required: true, default: null }, // Enviamos 0
                { key: 'saldo_pendiente', required: true, default: null }, // Enviamos total
            ],
            booleans: [
                { key: 'stock_descontado', required: true, default: false } // Enviamos false
            ]
        };

        // Procesar Enums
        for (const attr of schema.enums) {
            if (!attributeKeys.includes(attr.key)) {

                try {
                    await databases.createEnumAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.elements, attr.required);
                    missingAttributes.push(attr.key);
                } catch (e: any) { console.warn(`⚠️ Error ${attr.key}: ${e.message}`); }
            }
        }

        // Procesar Stocks (Boolean)
        for (const attr of schema.booleans) {
            if (!attributeKeys.includes(attr.key)) {

                try {
                    await databases.createBooleanAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.required, attr.default!);
                    missingAttributes.push(attr.key);
                } catch (e: any) { console.warn(`⚠️ Error ${attr.key}: ${e.message}`); }
            }
        }

        // Procesar Strings
        for (const attr of schema.strings) {
            if (!attributeKeys.includes(attr.key)) {

                try {
                    await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.size, attr.required);
                    missingAttributes.push(attr.key);
                } catch (e: any) { console.warn(`⚠️ Error ${attr.key}: ${e.message}`); }
            }
        }

        // Procesar Floats
        for (const attr of schema.floats) {
            if (!attributeKeys.includes(attr.key)) {

                try {
                    await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.required);
                    missingAttributes.push(attr.key);
                } catch (e: any) { console.warn(`⚠️ Error ${attr.key}: ${e.message}`); }
            }
        }

        if (missingAttributes.length > 0) {

            await new Promise(resolve => setTimeout(resolve, 4000));
        } else {

        }

    } catch (error: any) {
        console.error("❌ Error fatal en ensureSchema:", error);
    }
}

// Crear pedido
export async function crearPedido(data: {
    cliente_id?: string;
    cliente_nombre: string;
    cliente_telefono: string;
    cliente_email?: string;
    items: PedidoItem[];
    subtotal: number;
    descuento?: number;
    iva?: number;
    total: number;
    mensaje_cliente?: string;
    direccion_envio?: string;
    creado_por: string;
}): Promise<{ success: boolean; pedido?: PedidoCatalogo; message: string }> {
    const payload = {
        numero_pedido: await generarNumeroPedido(),
        fecha_creacion: new Date().toISOString(),
        cliente_id: data.cliente_id || '',
        cliente_nombre: data.cliente_nombre,
        cliente_telefono: data.cliente_telefono,
        cliente_email: data.cliente_email || '',
        items: stringifyItems(data.items),
        subtotal: data.subtotal,
        descuento: data.descuento || 0,
        iva: data.iva || 0,
        total: data.total,
        estado: 'creado' as EstadoPedido,
        metodo_pago_id: '',
        monto_pagado: 0,
        saldo_pendiente: data.total,
        notas: '',
        mensaje_cliente: data.mensaje_cliente || '',
        direccion_envio: data.direccion_envio || '',
        creado_por: data.creado_por,
        modificado_por: '',
        stock_descontado: false
    };

    try {
        const pedido = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_ID,
            ID.unique(),
            payload
        );

        return {
            success: true,
            pedido: pedido as unknown as PedidoCatalogo,
            message: `Pedido ${payload.numero_pedido} creado exitosamente`
        };
    } catch (error: any) {
        // Auto-reparación: Si falla por estructura inválida, intentamos arreglar y reintentar
        if (error.code === 400 && (error.message.includes('Unknown attribute') || error.message.includes('Invalid document structure'))) {


            await ensureSchema();

            try {

                const pedido = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    ID.unique(),
                    payload
                );

                return {
                    success: true,
                    pedido: pedido as unknown as PedidoCatalogo,
                    message: `Pedido ${payload.numero_pedido} creado exitosamente (tras recuperación)`
                };
            } catch (retryError: any) {
                console.error('Error final tras reintento:', retryError);
                return {
                    success: false,
                    message: retryError.message || 'Error creando pedido tras reparación'
                };
            }
        }

        console.error('Error creando pedido:', error);
        return {
            success: false,
            message: error.message || 'Error creando pedido'
        };
    }
}

// Obtener todos los pedidos
export async function obtenerPedidos(): Promise<PedidoCatalogo[]> {
    try {
        const { documents } = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.orderDesc("$createdAt")]
        );
        return documents as unknown as PedidoCatalogo[];
    } catch (error) {
        console.error('Error obteniendo pedidos:', error);
        return [];
    }
}

// Obtener pedido por ID
export async function obtenerPedido(id: string): Promise<PedidoCatalogo | null> {
    try {
        const pedido = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
        return pedido as unknown as PedidoCatalogo;
    } catch (error) {
        console.error('Error obteniendo pedido:', error);
        return null;
    }
}

// Obtener pedidos de un cliente
export async function obtenerPedidosCliente(clienteId: string): Promise<PedidoCatalogo[]> {
    try {
        const { documents } = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal("cliente_id", clienteId), Query.orderDesc("$createdAt")]
        );
        return documents as unknown as PedidoCatalogo[];
    } catch (error) {
        console.error('Error obteniendo pedidos del cliente:', error);
        return [];
    }
}

// Cambiar estado del pedido
export async function cambiarEstadoPedido(
    pedidoId: string,
    nuevoEstado: EstadoPedido,
    modificadoPor: string,
    datosAdicionales?: {
        guia_envio?: string;
        empresa_envio?: string;
        notas?: string;
    }
): Promise<{ success: boolean; message: string }> {
    try {
        const pedido = await obtenerPedido(pedidoId);
        if (!pedido) {
            return { success: false, message: 'Pedido no encontrado' };
        }

        const updates: any = {
            estado: nuevoEstado,
            modificado_por: modificadoPor
        };

        // Agregar datos adicionales si existen
        if (datosAdicionales) {
            if (datosAdicionales.guia_envio) updates.guia_envio = datosAdicionales.guia_envio;
            if (datosAdicionales.empresa_envio) updates.empresa_envio = datosAdicionales.empresa_envio;
            if (datosAdicionales.notas) updates.notas = datosAdicionales.notas;
        }

        // Actualizar fechas según estado
        const ahora = new Date().toISOString();
        if (nuevoEstado === 'confirmado') updates.fecha_confirmacion = ahora;
        if (nuevoEstado === 'pagado') updates.fecha_pago = ahora;
        if (nuevoEstado === 'enviado') updates.fecha_envio = ahora;
        if (nuevoEstado === 'completado') updates.fecha_completado = ahora;

        // 1. Descontar stock si cambia a pagado, enviado o confirmado
        if ((nuevoEstado === 'pagado' || nuevoEstado === 'enviado' || nuevoEstado === 'confirmado') && !pedido.stock_descontado) {

            const items = parseItems(pedido.items);

            for (const item of items) {
                try {
                    await registrarMovimiento({
                        producto_id: item.producto_id,
                        tipo: 'venta',
                        cantidad: item.cantidad,
                        motivo: 'Venta Online',
                        referencia: `Pedido ${pedido.numero_pedido}`,
                        fecha: new Date().toISOString()
                    });
                } catch (err) {
                    console.error(`Error descontando stock para ${item.nombre}:`, err);
                }
            }
            updates.stock_descontado = true;
        }

        // 2. Devolver stock si se cancela o se devuelve a creado/borrador y ya se había descontado
        if ((nuevoEstado === 'cancelado' || nuevoEstado === 'creado') && pedido.stock_descontado) {

            const items = parseItems(pedido.items);

            for (const item of items) {
                try {
                    await registrarMovimiento({
                        producto_id: item.producto_id,
                        tipo: 'entrada', // Entrada por devolución
                        cantidad: item.cantidad,
                        motivo: nuevoEstado === 'creado' ? 'Corrección de Estado' : 'Cancelación',
                        referencia: `Corrección ${pedido.numero_pedido}`,
                        fecha: new Date().toISOString()
                    });
                } catch (err) {
                    console.error(`Error devolviendo stock para ${item.nombre}:`, err);
                }
            }
            updates.stock_descontado = false;
        }

        await databases.updateDocument(DATABASE_ID, COLLECTION_ID, pedidoId, updates);

        return {
            success: true,
            message: `Estado actualizado a ${nuevoEstado}`
        };
    } catch (error: any) {
        console.error('Error cambiando estado:', error);
        return {
            success: false,
            message: error.message || 'Error cambiando estado'
        };
    }
}

// Registrar pago
export async function registrarPago(
    pedidoId: string,
    monto: number,
    metodoPagoId?: string,
    modificadoPor?: string,
    comprobanteUrl?: string
): Promise<{ success: boolean; message: string }> {
    try {
        const pedido = await obtenerPedido(pedidoId);
        if (!pedido) {
            return { success: false, message: 'Pedido no encontrado' };
        }

        const nuevoMontoPagado = pedido.monto_pagado + monto;
        const nuevoSaldo = pedido.total - nuevoMontoPagado;

        const updates: any = {
            monto_pagado: nuevoMontoPagado,
            saldo_pendiente: nuevoSaldo,
            modificado_por: modificadoPor || pedido.creado_por
        };

        if (metodoPagoId) {
            updates.metodo_pago_id = metodoPagoId;
        }

        if (comprobanteUrl) {
            updates.comprobante_url = comprobanteUrl;
        }

        // Si se pagó completo y no está en pagado, cambiar estado
        if (nuevoSaldo <= 0 && pedido.estado !== 'pagado') {
            updates.estado = 'pagado';
            updates.fecha_pago = new Date().toISOString();
        }

        await databases.updateDocument(DATABASE_ID, COLLECTION_ID, pedidoId, updates);

        return {
            success: true,
            message: `Pago de ${monto} registrado. Saldo: ${nuevoSaldo}`
        };
    } catch (error: any) {
        console.error('Error registrando pago:', error);
        return {
            success: false,
            message: error.message || 'Error registrando pago'
        };
    }
}
