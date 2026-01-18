"use server";

import { createAdminClient, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";

export interface OperationalSummary {
    operaciones: {
        citasHoy: number;
        citasPendientes: number;
        citasEnProgreso: number;
        otsActivas: number; // EN_PROCESO
        otsPendientesPago: number; // POR_PAGAR
        otsUrgentes: number;
    };
    finanzas: {
        ingresosHoy: number;
        ingresosMes: number;
        gastosMes: number;
        balanceMes: number;
    };
    alertas: {
        stockBajo: number;
        solicitudesRepuestos: number; // Pendientes
        llegadasTardeHoy: number;
    };
    rrhh: {
        presentes: number;
        totalActivos: number;
    };
}

export async function obtenerResumenOperativo(): Promise<OperationalSummary> {
    try {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        const { database } = createAdminClient();

        // --- PARALLEL DATA FETCHING ---
        const [
            citasHoyRes,
            citasMesRes,
            otsActivasRes,
            otsPorPagarRes,
            solicitudesRepuestosRes,
            productosBajoStockRes,
            empleadosActivosRes,
            asistenciasHoyRes,
            gastosMesRes,
            ventasPosMesRes
        ] = await Promise.all([
            // 1. Citas Hoy
            database.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, [
                Query.greaterThanEqual("fechaCita", startOfToday),
                Query.lessThan("fechaCita", new Date(now.getTime() + 86400000).toISOString()),
                Query.limit(100)
            ]),
            // 2. Citas Mes (Finanzas)
            database.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, [
                Query.greaterThanEqual("fechaCita", startOfMonth),
                Query.equal("estado", "completada"),
                Query.equal("pagadoPorCliente", true),
                Query.limit(500)
            ]),
            // 3. OTs Activas
            database.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES_TRABAJO, [
                Query.equal("estado", ["EN_PROCESO", "ACEPTADA"]),
                Query.limit(100)
            ]),
            // 4. OTs Por Pagar
            database.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES_TRABAJO, [
                Query.equal("estado", "POR_PAGAR"),
                Query.limit(100)
            ]),
            // 5. Solicitudes Repuestos Pendientes
            database.listDocuments(DATABASE_ID, COLLECTIONS.OT_SOLICITUDES_REPUESTOS, [
                Query.equal("estado", "SOLICITADO"),
                Query.limit(1) // Just need count
            ]),
            // 6. Productos Bajo Stock
            database.listDocuments(DATABASE_ID, COLLECTIONS.PRODUCTOS, [
                Query.lessThan("stock", 5),
                Query.limit(1) // Just need count
            ]),
            // 7. Empleados Activos
            database.listDocuments(DATABASE_ID, COLLECTIONS.EMPLEADOS, [
                Query.equal("activo", true),
                Query.limit(1) // Count
            ]),
            // 8. Asistencias Hoy
            database.listDocuments(DATABASE_ID, COLLECTIONS.ASISTENCIAS, [
                Query.greaterThanEqual("fechaHora", startOfToday),
                Query.equal("tipo", "ENTRADA"),
                Query.limit(100)
            ]),
            // 9. Gastos Mes
            database.listDocuments(DATABASE_ID, COLLECTIONS.GASTOS, [
                Query.greaterThanEqual("fecha", startOfMonth.split('T')[0]),
                Query.limit(500)
            ]),
            // 10. Ventas POS Mes
            database.listDocuments(DATABASE_ID, COLLECTIONS.ORDENES, [ // POS Orders
                Query.greaterThanEqual("$createdAt", startOfMonth),
                Query.equal("estado", "completada"),
                Query.limit(500)
            ])
        ]);

        // --- CALCULATIONS ---

        // Operations
        const citasHoy = citasHoyRes.documents;
        const citasPendientes = citasHoy.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').length;
        const citasEnProgreso = citasHoy.filter(c => c.estado === 'en-progreso').length;

        const otsActivas = otsActivasRes.documents;
        const otsUrgentes = otsActivas.filter((ot: any) => ot.prioridad === 'URGENTE').length;

        // Finance
        const ingresosCitas = citasMesRes.documents.reduce((acc, c: any) => acc + (c.precioAcordado || 0), 0);
        // Note: For OTs, usually revenue is realized when paid (COMPLETADA/ENTREGADA). 
        // For simplicity in this summary, we might not have a separate 'paid OTs this month' query yet, 
        // so we'll rely on Citas + POS for now, or add a specific Paid OTs query if needed.
        // Let's assume POS orders cover product sales.
        const ingresosPos = ventasPosMesRes.documents.reduce((acc, v: any) => acc + (v.total || 0), 0);

        const totalIngresos = ingresosCitas + ingresosPos;
        const totalGastos = gastosMesRes.documents.reduce((acc, g: any) => acc + (g.monto || 0), 0);

        // HR
        const llegadasTarde = asistenciasHoyRes.documents.filter((a: any) => {
            const hora = new Date(a.fechaHora).getHours();
            return hora >= 9; // Simple threshold
        }).length;

        return {
            operaciones: {
                citasHoy: citasHoyRes.total,
                citasPendientes,
                citasEnProgreso,
                otsActivas: otsActivasRes.total,
                otsPendientesPago: otsPorPagarRes.total,
                otsUrgentes
            },
            finanzas: {
                ingresosHoy: 0, // Placeholder or calculate if needed
                ingresosMes: totalIngresos,
                gastosMes: totalGastos,
                balanceMes: totalIngresos - totalGastos
            },
            alertas: {
                stockBajo: productosBajoStockRes.total,
                solicitudesRepuestos: solicitudesRepuestosRes.total,
                llegadasTardeHoy: llegadasTarde
            },
            rrhh: {
                presentes: asistenciasHoyRes.total,
                totalActivos: empleadosActivosRes.total
            }
        };

    } catch (error) {
        console.error("Error obtaining operational summary:", error);
        return {
            operaciones: { citasHoy: 0, citasPendientes: 0, citasEnProgreso: 0, otsActivas: 0, otsPendientesPago: 0, otsUrgentes: 0 },
            finanzas: { ingresosHoy: 0, ingresosMes: 0, gastosMes: 0, balanceMes: 0 },
            alertas: { stockBajo: 0, solicitudesRepuestos: 0, llegadasTardeHoy: 0 },
            rrhh: { presentes: 0, totalActivos: 0 }
        };
    }
}
