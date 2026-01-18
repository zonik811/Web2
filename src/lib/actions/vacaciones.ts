"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query, ID } from "node-appwrite";
import type {
    Vacacion,
    SaldoVacaciones,
    SolicitarVacacionInput,
    InicializarSaldoInput
} from "@/types";

/**
 * Calcular días hábiles entre dos fechas (excluye sábados y domingos)
 */
export async function calcularDiasHabiles(fechaInicio: string, fechaFin: string): Promise<number> {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    let diasHabiles = 0;

    for (let d = new Date(inicio); d <= fin; d.setDate(d.getDate() + 1)) {
        const diaSemana = d.getDay();
        // 0 = domingo, 6 = sábado
        if (diaSemana !== 0 && diaSemana !== 6) {
            diasHabiles++;
        }
    }

    return diasHabiles;
}

/**
 * Inicializar saldo de vacaciones para un empleado
 */
export async function inicializarSaldoVacaciones(data: InicializarSaldoInput): Promise<{ success: boolean; error?: string }> {
    try {
        // Verificar si ya existe
        const existente = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.SALDO_VACACIONES,
            [Query.equal("empleadoId", data.empleadoId)]
        );

        if (existente.documents.length > 0) {
            // Actualizar
            await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.SALDO_VACACIONES,
                existente.documents[0].$id,
                {
                    anioActual: data.anioActual,
                    diasTotales: data.diasTotales,
                    diasDisponibles: data.diasTotales
                }
            );
        } else {
            // Crear nuevo
            await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.SALDO_VACACIONES,
                ID.unique(),
                {
                    empleadoId: data.empleadoId,
                    anioActual: data.anioActual,
                    diasTotales: data.diasTotales,
                    diasUsados: 0,
                    diasPendientes: 0,
                    diasDisponibles: data.diasTotales
                }
            );
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error inicializando saldo:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtener saldo de vacaciones de un empleado
 */
export async function obtenerSaldoVacaciones(empleadoId: string): Promise<SaldoVacaciones | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.SALDO_VACACIONES,
            [Query.equal("empleadoId", empleadoId)]
        );

        if (response.documents.length === 0) {
            // Inicializar con defaults
            const anioActual = new Date().getFullYear();
            await inicializarSaldoVacaciones({
                empleadoId,
                anioActual,
                diasTotales: 15 // Default
            });

            return await obtenerSaldoVacaciones(empleadoId);
        }

        return response.documents[0] as unknown as SaldoVacaciones;
    } catch (error) {
        console.error("Error obteniendo saldo:", error);
        return null;
    }
}

/**
 * Recalcular saldo de vacaciones
 */
async function recalcularSaldo(empleadoId: string): Promise<void> {
    const saldo = await obtenerSaldoVacaciones(empleadoId);
    if (!saldo) return;

    // Obtener vacaciones del año actual
    const vacaciones = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.VACACIONES,
        [
            Query.equal("empleadoId", empleadoId),
            Query.equal("anio", saldo.anioActual)
        ]
    );

    let diasUsados = 0;
    let diasPendientes = 0;

    for (const vac of vacaciones.documents as unknown as Vacacion[]) {
        if (vac.estado === 'APROBADO') {
            diasUsados += vac.diasSolicitados;
        } else if (vac.estado === 'PENDIENTE') {
            diasPendientes += vac.diasSolicitados;
        }
    }

    const diasDisponibles = saldo.diasTotales - diasUsados - diasPendientes;

    await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.SALDO_VACACIONES,
        saldo.$id,
        {
            diasUsados,
            diasPendientes,
            diasDisponibles
        }
    );
}

/**
 * Solicitar vacaciones
 */
export async function solicitarVacaciones(data: SolicitarVacacionInput): Promise<{ success: boolean; error?: string }> {
    try {
        const diasSolicitados = await calcularDiasHabiles(data.fechaInicio, data.fechaFin);

        // Verificar saldo disponible
        const saldo = await obtenerSaldoVacaciones(data.empleadoId);
        if (!saldo) {
            return { success: false, error: "No se encontró saldo de vacaciones" };
        }

        if (diasSolicitados > saldo.diasDisponibles) {
            return { success: false, error: `Solo tienes ${saldo.diasDisponibles} días disponibles` };
        }

        const anio = new Date(data.fechaInicio).getFullYear();

        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.VACACIONES,
            ID.unique(),
            {
                empleadoId: data.empleadoId,
                anio,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin,
                diasSolicitados,
                estado: 'PENDIENTE',
                motivo: data.motivo || ''
            }
        );

        // Recalcular saldo
        await recalcularSaldo(data.empleadoId);

        return { success: true };
    } catch (error: any) {
        console.error("Error solicitando vacaciones:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtener vacaciones de un empleado
 */
export async function obtenerVacacionesEmpleado(empleadoId: string, anio?: number): Promise<Vacacion[]> {
    try {
        const queries = [
            Query.equal("empleadoId", empleadoId),
            Query.orderDesc("$createdAt")
        ];

        // Try with database filter first
        if (anio) {
            try {
                const queriesWithAnio = [...queries, Query.equal("anio", anio)];
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.VACACIONES,
                    queriesWithAnio
                );
                return response.documents as unknown as Vacacion[];
            } catch (error: any) {
                // If attribute 'anio' is missing, fall back to in-memory filtering
                if (error.message?.includes("Attribute not found")) {
                    console.warn("Attribute 'anio' missing in schema, filtering in memory");
                    const response = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.VACACIONES,
                        queries
                    );
                    const docs = response.documents as unknown as Vacacion[];
                    return docs.filter(d => d.anio === anio);
                }
                throw error;
            }
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.VACACIONES,
            queries
        );

        return response.documents as unknown as Vacacion[];
    } catch (error) {
        console.error("Error obteniendo vacaciones:", error);
        return [];
    }
}

/**
 * Obtener TODAS las vacaciones (para vista admin)
 */
export async function obtenerTodasLasVacaciones(anio?: number): Promise<Vacacion[]> {
    try {
        const queries = [
            Query.orderDesc("fechaInicio")
        ];

        // Try with database filter first
        if (anio) {
            try {
                const queriesWithAnio = [...queries, Query.equal("anio", anio)];
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTIONS.VACACIONES,
                    queriesWithAnio
                );
                return response.documents as unknown as Vacacion[];
            } catch (error: any) {
                // Fallback to in-memory filtering if schema invalid
                if (error.message?.includes("Attribute not found")) {
                    const response = await databases.listDocuments(
                        DATABASE_ID,
                        COLLECTIONS.VACACIONES,
                        queries
                    );
                    const docs = response.documents as unknown as Vacacion[];
                    return docs.filter(d => d.anio === anio);
                }
                throw error;
            }
        }

        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.VACACIONES,
            queries
        );

        return response.documents as unknown as Vacacion[];
    } catch (error) {
        console.error("Error obteniendo todas las vacaciones:", error);
        return [];
    }
}

/**
 * Obtener vacaciones pendientes de aprobación
 */
export async function obtenerVacacionesPendientes(): Promise<Vacacion[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.VACACIONES,
            [
                Query.equal("estado", "PENDIENTE"),
                Query.orderDesc("$createdAt")
            ]
        );

        return response.documents as unknown as Vacacion[];
    } catch (error) {
        console.error("Error obteniendo vacaciones pendientes:", error);
        return [];
    }
}

/**
 * Aprobar vacaciones
 */
export async function aprobarVacaciones(vacacionId: string, adminId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const vacacion = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.VACACIONES,
            vacacionId
        ) as unknown as Vacacion;

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.VACACIONES,
            vacacionId,
            {
                estado: 'APROBADO',
                aprobadoPor: adminId,
                fechaAprobacion: new Date().toISOString()
            }
        );

        // Recalcular saldo
        await recalcularSaldo(vacacion.empleadoId);

        return { success: true };
    } catch (error: any) {
        console.error("Error aprobando vacaciones:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Rechazar vacaciones
 */
export async function rechazarVacaciones(vacacionId: string, adminId: string, motivo: string): Promise<{ success: boolean; error?: string }> {
    try {
        const vacacion = await databases.getDocument(
            DATABASE_ID,
            COLLECTIONS.VACACIONES,
            vacacionId
        ) as unknown as Vacacion;

        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.VACACIONES,
            vacacionId,
            {
                estado: 'RECHAZADO',
                aprobadoPor: adminId,
                fechaAprobacion: new Date().toISOString(),
                comentariosRechazo: motivo
            }
        );

        // Recalcular saldo
        await recalcularSaldo(vacacion.empleadoId);

        return { success: true };
    } catch (error: any) {
        console.error("Error rechazando vacaciones:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Verificar si un empleado tiene vacaciones en una fecha
 */
export async function tieneVacacionesEnFecha(empleadoId: string, fecha: string): Promise<boolean> {
    try {
        const fechaObj = new Date(fecha);
        const vacaciones = await obtenerVacacionesEmpleado(empleadoId);

        const aprobadas = vacaciones.filter(v => v.estado === 'APROBADO');

        return aprobadas.some(vac => {
            const inicio = new Date(vac.fechaInicio);
            const fin = new Date(vac.fechaFin);
            return fechaObj >= inicio && fechaObj <= fin;
        });
    } catch (error) {
        console.error("Error verificando vacaciones:", error);
        return false;
    }
}
