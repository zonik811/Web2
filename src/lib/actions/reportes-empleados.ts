"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { obtenerOrdenTrabajo } from "@/lib/actions/ordenes-trabajo";
import { obtenerVehiculo } from "@/lib/actions/vehiculos";
import type { OrdenTrabajo, Vehiculo, OtProceso, OtActividad } from "@/types";

export interface OrdenEmpleadoResumen {
    ordenId: string;
    numeroOrden: string;
    estado: string;
    vehiculo: {
        marca: string;
        modelo: string;
        placa: string;
    };
    rol: string; // "Responsable" | "Auxiliar" | "Ambos"
    horasRegistradas: number;
    totalGanadoEstimado: number;
    fechaUltimaActividad?: string;
}

export async function obtenerHistorialOrdenesEmpleado(empleadoId: string): Promise<OrdenEmpleadoResumen[]> {
    try {
        // 1. Obtener procesos donde el empleado es responsable o auxiliar
        const [procesosResponsable, procesosAuxiliar] = await Promise.all([
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_PROCESOS, [
                Query.equal("tecnicoResponsableId", empleadoId),
                Query.limit(100)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_PROCESOS, [
                Query.equal("tecnicoAuxiliarId", empleadoId),
                Query.limit(100)
            ])
        ]);

        // Unificar IDs de órdenes únicas
        const ordenesIds = new Set<string>();
        const rolesPorOrden = new Map<string, Set<string>>();

        const registrarRol = (ordenId: string, rol: string) => {
            ordenesIds.add(ordenId);
            if (!rolesPorOrden.has(ordenId)) {
                rolesPorOrden.set(ordenId, new Set());
            }
            rolesPorOrden.get(ordenId)?.add(rol);
        };

        procesosResponsable.documents.forEach((p: any) => registrarRol(p.ordenTrabajoId, "Responsable"));
        procesosAuxiliar.documents.forEach((p: any) => registrarRol(p.ordenTrabajoId, "Auxiliar"));

        if (ordenesIds.size === 0) return [];

        // 2. Procesar cada orden
        const resultados: OrdenEmpleadoResumen[] = [];
        const tarifaEmpleado = await obtenerTarifaEmpleado(empleadoId);

        for (const ordenId of Array.from(ordenesIds)) {
            try {
                // Obtener detalles de la orden
                const orden = await obtenerOrdenTrabajo(ordenId);

                // Filtrar estado COTIZANDO
                if (orden.estado === 'COTIZANDO') continue;

                // Obtener Vehículo
                const vehiculo = await obtenerVehiculo(orden.vehiculoId).catch(() => ({ marca: 'N/A', modelo: 'N/A', placa: 'N/A' } as Vehiculo));

                // 3. Obtener actividades del empleado en esta orden para calcular horas reales
                const actividades = await databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_ACTIVIDADES, [
                    Query.equal("ordenTrabajoId", ordenId),
                    Query.equal("empleadoId", empleadoId)
                ]);

                const horasRegistradas = (actividades.documents as unknown as OtActividad[]).reduce((sum, act) => sum + act.horasTrabajadas, 0);

                // Determinar fecha última actividad
                let fechaUltimaActividad = undefined;
                if (actividades.documents.length > 0) {
                    const fechas = actividades.documents.map((a: any) => new Date(a.fechaHora).getTime());
                    fechaUltimaActividad = new Date(Math.max(...fechas)).toISOString();
                }

                // Determinar Rol Texto
                const roles = rolesPorOrden.get(ordenId);
                let rolTexto = "Participante";
                if (roles?.has("Responsable") && roles?.has("Auxiliar")) rolTexto = "Responsable y Auxiliar";
                else if (roles?.has("Responsable")) rolTexto = "Responsable";
                else if (roles?.has("Auxiliar")) rolTexto = "Auxiliar";

                resultados.push({
                    ordenId: orden.$id,
                    numeroOrden: orden.numeroOrden,
                    estado: orden.estado,
                    vehiculo: {
                        marca: vehiculo.marca,
                        modelo: vehiculo.modelo,
                        placa: vehiculo.placa
                    },
                    rol: rolTexto,
                    horasRegistradas: Number(horasRegistradas.toFixed(2)),
                    totalGanadoEstimado: Number((horasRegistradas * tarifaEmpleado).toFixed(2)),
                    fechaUltimaActividad
                });

            } catch (err) {
                console.error(`Error procesando orden ${ordenId} para empleado ${empleadoId}:`, err);
            }
        }

        // Ordenar por fecha de última actividad o número de orden
        return resultados.sort((a, b) => {
            if (a.fechaUltimaActividad && b.fechaUltimaActividad) {
                return new Date(b.fechaUltimaActividad).getTime() - new Date(a.fechaUltimaActividad).getTime();
            }
            return b.numeroOrden.localeCompare(a.numeroOrden);
        });

    } catch (error) {
        console.error("Error obteniendo historial de órdenes:", error);
        return [];
    }
}


export async function obtenerConteoOrdenesEmpleado(empleadoId: string): Promise<number> {
    try {
        const [procesosResponsable, procesosAuxiliar] = await Promise.all([
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_PROCESOS, [
                Query.equal("tecnicoResponsableId", empleadoId),
                Query.limit(100)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.OT_PROCESOS, [
                Query.equal("tecnicoAuxiliarId", empleadoId),
                Query.limit(100)
            ])
        ]);

        const ordenesIds = new Set<string>();
        procesosResponsable.documents.forEach((p: any) => ordenesIds.add(p.ordenTrabajoId));
        procesosAuxiliar.documents.forEach((p: any) => ordenesIds.add(p.ordenTrabajoId));

        return ordenesIds.size;
    } catch (error) {
        console.error("Error contando órdenes de empleado:", error);
        return 0;
    }
}

async function obtenerTarifaEmpleado(empleadoId: string): Promise<number> {
    try {
        const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.EMPLEADOS, empleadoId);
        return doc.tarifaPorHora || 0;
    } catch {
        return 0;
    }
}

