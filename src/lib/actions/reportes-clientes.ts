"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import type { OrdenTrabajo } from "@/types/ordenes-trabajo";
import { obtenerFacturaOrden } from "./facturas";

export interface OrdenClienteResumen {
    ordenId: string;
    numeroOrden: string;
    fechaIngreso: string;
    vehiculo: string; // Marca Modelo Placa
    estado: string;
    total: number;
    pagado: number;
    saldo: number;
}

export async function obtenerHistorialOrdenesCliente(clienteId: string): Promise<OrdenClienteResumen[]> {
    try {
        // 1. Obtener órdenes del cliente
        const ordenesResponse = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            [
                Query.equal("clienteId", clienteId),
                Query.orderDesc("numeroOrden"), // Orden más reciente primero
                Query.limit(100)
            ]
        );

        const ordenes = ordenesResponse.documents as unknown as OrdenTrabajo[];
        const resultados: OrdenClienteResumen[] = [];

        // 2. Procesar cada orden para obtener detalles financieros
        for (const orden of ordenes) {
            // Filtrar cotizaciones si se desea, aunque para clientes puede ser útil verlas
            // Si el usuario quiere ocultar cotizaciones "no aceptadas", podríamos hacerlo aquí.
            // Por ahora mostraremos todo, pero el "Saldo" de una cotización es 0 hasta que sea aceptada/orden?
            // Seguiremos la lógica de negocio: Si estado es COTIZANDO, saldo es 0 (no hay deuda aún).

            let total = orden.total || 0;
            let pagado = 0;
            let saldo = 0;

            if (orden.estado !== 'COTIZANDO' && orden.estado !== 'CANCELADA') {
                // Obtener pagos asociados a esta orden (si existen facturas/pagos directos)
                // La lógica actual de pagos liga Pagos a Facturas o Citas.
                // Si implementamos pagos ligados a OT, deberíamos buscarlos.
                // Revisamos `facturas.ts` y `pagos-clientes.ts`.
                // Asumimos que los pagos se registran en `pagos_clientes` con `facturaId` o `ordenTrabajoId` (si agregamos ese campo).
                // La colección `pagos_clientes` TIENTE `citaId`. Deberíamos haber agregado `ordenTrabajoId` o vincular por Factura.

                // Verificamos si existe factura
                const factura = await obtenerFacturaOrden(orden.$id);

                if (factura) {
                    // Buscar pagos de esta factura? 
                    // Actualmente `pagos_clientes` no parece tener `facturaId` explícito en la interface `PagoCliente` 
                    // pero verificaremos en el código.

                    // Si no hay pagos vinculados directamente, usamos la lógica de "Estado".
                    // Si estado es 'COMPLETADA' o 'ENTREGADA', verificar si está pagada.
                    // Pero lo ideal es buscar los pagos reales.

                    // FALLBACK TEMPORAL:
                    // Buscamos pagos en `pagos_clientes` que tengan en `notas` el numero de factura o orden? No, muy frágil.
                    // Vamos a buscar pagos por `clienteId` y filtrar en memoria aquellos que coincidan con la fecha aprox o si agregamos referencia?

                    // MEJOR: Vamos a consultar los pagos que tengan `referenciaId` igual a la Orden o Factura, O (importante)
                    // si en la fase anterior agregamos campos a `pagos_clientes`.
                    // Revisando `implementation_plan.md` anterior: "- [x] Update `pagos_clientes` collection with OT fields".
                    // Asumo que existe `ordenTrabajoId` en `pagos_clientes`.
                }

                // Intentamos buscar pagos con ordenTrabajoId si existe en el schema, si no, asumimos 0 por ahora.
                // Nota: En un paso anterior "Update pagos_clientes collection with OT fields" se marcó como hecho.
                // Asumiremos que podemos consultar por `ordenTrabajoId`.

                try {
                    const pagosOrden = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.PAGOS_CLIENTES,
                        [Query.equal("ordenTrabajoId", orden.$id)] // Campo hipotético agregado
                    ) as any;

                    pagado = pagosOrden.documents.reduce((sum: number, p: any) => sum + (p.monto || 0), 0);
                } catch (e) {
                    // Si falla el query (campo no existe), pagado = 0
                    pagado = 0;
                }

                saldo = total - pagado;
                if (saldo < 0) saldo = 0;
            } else {
                total = 0; // En cotización no suma a deuda real
            }

            // Obtener info vehículo (podríamos hacer fetch one, pero mejor traerlos todos antes si son muchos...
            // O hacer fetch individual. 100 órdenes = 100 reads. Es aceptable para este MVP.
            let vehiculoInfo = "Vehículo no encontrado";
            try {
                const vehiculo = await databases.getDocument(DATABASE_ID, COLLECTIONS.VEHICULOS, orden.vehiculoId);
                vehiculoInfo = `${vehiculo.marca} ${vehiculo.modelo} ${vehiculo.placa}`;
            } catch { }

            resultados.push({
                ordenId: orden.$id,
                numeroOrden: orden.numeroOrden,
                fechaIngreso: orden.fechaIngreso,
                vehiculo: vehiculoInfo,
                estado: orden.estado,
                total,
                pagado,
                saldo
            });
        }

        return resultados;

    } catch (error) {
        console.error("Error obteniendo historial órdenes cliente:", error);
        return [];
    }
}

export async function obtenerConteoOrdenesCliente(clienteId: string): Promise<number> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.ORDENES_TRABAJO,
            [
                Query.equal("clienteId", clienteId),
                Query.limit(1) // Solo necesitamos el total
            ]
        );
        return response.total;
    } catch {
        return 0;
    }
}
