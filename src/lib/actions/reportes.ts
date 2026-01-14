"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { Query } from "node-appwrite";
import { Cita, Empleado, Gasto } from "@/types";
import { obtenerEmpleados } from "./empleados";

export interface ReporteFinancieroMes {
    mes: string;
    ingresos: number;
    gastos: number;
    beneficio: number;
}

export interface EstadisticaServicio {
    nombre: string;
    cantidad: number;
    fill?: string;
}

export interface RendimientoEmpleado {
    empleadoId: string;
    nombre: string;
    serviciosCompletados: number;
    totalGenerado: number; // New: Value of completed services
    calificacionPromedio: number;
}

export interface ClienteTop {
    clienteId: string; // Phone number or ID
    nombre: string;
    totalGastado: number;
    serviciosContratados: number;
}

export interface CarteraEstado {
    totalPorCobrar: number;
    citasPendientesPago: number;
    antiguedadPromedioDias: number;
}

export interface EstadoNomina {
    totalGenerado: number; // Total value of completed services attributed to employees
    totalPagado: number; // Placeholder: Actual payments made
    totalPendiente: number;
}

/**
 * Helper to filter dates
 */
const getDateFilter = (start?: Date, end?: Date, field: string = "createdAt") => {
    const filters = [];
    if (start) filters.push(Query.greaterThanEqual(field, start.toISOString()));
    if (end) filters.push(Query.lessThanEqual(field, end.toISOString()));
    return filters;
};

/**
 * Obtiene el resumen financiero mensual
 */
export async function obtenerResumenFinanciero(year?: number): Promise<ReporteFinancieroMes[]> {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1).toISOString();
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59).toISOString();

    try {
        const [citasResponse, gastosResponse] = await Promise.all([
            databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, [
                Query.equal("estado", "completada"),
                // Removed strict pagadoPorCliente check to show Total Sales (Invoiced) instead of just Cash Collected
                Query.greaterThanEqual("fechaCita", startDate),
                Query.lessThanEqual("fechaCita", endDate),
                Query.limit(5000)
            ]),
            databases.listDocuments(DATABASE_ID, COLLECTIONS.GASTOS, [
                Query.greaterThanEqual("fecha", startDate),
                Query.lessThanEqual("fecha", endDate),
                Query.limit(5000)
            ])
        ]);

        const citas = citasResponse.documents as unknown as Cita[];
        const gastos = gastosResponse.documents as unknown as Gasto[];

        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const reporte = meses.map(mes => ({ mes, ingresos: 0, gastos: 0, beneficio: 0 }));

        citas.forEach(cita => {
            const mesIndex = new Date(cita.fechaCita).getMonth();
            if (mesIndex >= 0 && mesIndex < 12) {
                // Ensure number casting and fallback
                const precio = Number(cita.precioAcordado) || Number(cita.precioCliente) || 0;
                reporte[mesIndex].ingresos += precio;
            }
        });

        gastos.forEach(gasto => {
            const mesIndex = new Date(gasto.fecha).getMonth();
            if (mesIndex >= 0 && mesIndex < 12) {
                // Ensure number casting
                const monto = Number(gasto.monto) || 0;
                reporte[mesIndex].gastos += monto;
            }
        });

        reporte.forEach(item => { item.beneficio = item.ingresos - item.gastos; });
        return reporte;
    } catch (error) {
        console.error("Error generando reporte financiero:", error);
        return [];
    }
}

/**
 * Obtiene estadísticas de servicios (con filtros de fecha)
 */
export async function obtenerEstadisticasServicios(fechaInicio?: Date, fechaFin?: Date): Promise<EstadisticaServicio[]> {
    try {
        const filters = [Query.limit(5000), ...getDateFilter(fechaInicio, fechaFin, "fechaCita")];

        const citasResponse = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, filters);
        const citas = citasResponse.documents as unknown as Cita[];

        const stats: Record<string, number> = {};
        citas.forEach(cita => {
            const tipo = cita.tipoPropiedad || "Otros";
            const tipoFormatted = tipo.charAt(0).toUpperCase() + tipo.slice(1);
            stats[tipoFormatted] = (stats[tipoFormatted] || 0) + 1;
        });

        const colors = ["#0ea5e9", "#22c55e", "#eab308", "#f43f5e", "#8b5cf6"];
        return Object.entries(stats)
            .map(([nombre, cantidad], index) => ({ nombre, cantidad, fill: colors[index % colors.length] }))
            .sort((a, b) => b.cantidad - a.cantidad);
    } catch (error) {
        console.error("Error stats servicios:", error);
        return [];
    }
}

/**
 * Obtiene mejores clientes por ingresos generados
 */
export async function obtenerMejoresClientes(fechaInicio?: Date, fechaFin?: Date): Promise<ClienteTop[]> {
    try {
        const filters = [
            Query.equal("estado", "completada"),
            Query.limit(5000),
            ...getDateFilter(fechaInicio, fechaFin, "fechaCita")
        ];

        const citasResponse = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, filters);
        const citas = citasResponse.documents as unknown as Cita[];

        const clientesMap = new Map<string, ClienteTop>();

        citas.forEach(cita => {
            // Identifier: Phone or Name (since we don't have separate Client collection IDs strictly linked yet)
            const id = cita.clienteTelefono || cita.clienteNombre;

            if (!clientesMap.has(id)) {
                clientesMap.set(id, {
                    clienteId: id,
                    nombre: cita.clienteNombre,
                    totalGastado: 0,
                    serviciosContratados: 0
                });
            }

            const cliente = clientesMap.get(id)!;
            // Ensure number casting
            const precio = Number(cita.precioAcordado) || Number(cita.precioCliente) || 0;
            cliente.totalGastado += precio;
            cliente.serviciosContratados += 1;
        });

        // Convert map to array and sort top 10
        return Array.from(clientesMap.values())
            .sort((a, b) => b.totalGastado - a.totalGastado)
            .slice(0, 10);

    } catch (error) {
        console.error("Error obteniendo mejores clientes:", error);
        return [];
    }
}

/**
 * Obtiene estado de cartera (Cuentas por Cobrar)
 */
export async function obtenerCartera(fechaInicio?: Date, fechaFin?: Date): Promise<CarteraEstado> {
    try {
        // Find completed citas that are NOT paid
        const filters = [
            Query.equal("estado", "completada"),
            Query.equal("pagadoPorCliente", false),
            Query.limit(5000),
            ...getDateFilter(fechaInicio, fechaFin, "fechaCita")
        ];

        const citasResponse = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, filters);
        const citas = citasResponse.documents as unknown as Cita[];

        const now = new Date();
        let totalDias = 0;

        const totalPorCobrar = citas.reduce((sum, cita) => {
            const fechaCita = new Date(cita.fechaCita);
            const diffTime = Math.abs(now.getTime() - fechaCita.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            totalDias += diffDays;

            return sum + (Number(cita.precioAcordado) || Number(cita.precioCliente) || 0);
        }, 0);

        return {
            totalPorCobrar,
            citasPendientesPago: citas.length,
            antiguedadPromedioDias: citas.length > 0 ? Math.round(totalDias / citas.length) : 0
        };

    } catch (error) {
        console.error("Error obteniendo cartera:", error);
        return { totalPorCobrar: 0, citasPendientesPago: 0, antiguedadPromedioDias: 0 };
    }
}

/**
 * Obtiene estado de nómina (Simulado vs Real)
 */
export async function obtenerEstadoNomina(fechaInicio?: Date, fechaFin?: Date): Promise<EstadoNomina> {
    try {
        // 1. Calculate "Generated" Payroll (Estimated as % of completed services or fixed logic)
        // For this demo, let's assume payroll cost is roughly 60% of service value if not explicitly tracked yet
        // In a real system, this would sum up explicit 'pago_empleado' records.

        const filters = [
            Query.equal("estado", "completada"),
            ...getDateFilter(fechaInicio, fechaFin, "fechaCita")
        ];

        const citasResponse = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, filters);
        const citas = citasResponse.documents as unknown as Cita[];

        let totalGenerado = 0;
        let totalPagado = 0; // Requires a "Pagos" collection to be accurate

        // Mock logic: 
        // Generado = 70% of Service Price (Typical in cleaning industry)
        // Pagado = We'll assume for now 90% is paid to show some pending

        citas.forEach(cita => {
            const precio = Number(cita.precioAcordado) || Number(cita.precioCliente) || 0;
            const payrollCost = precio * 0.7;
            totalGenerado += payrollCost;

            // Randomly some are unpaid for demo visualization
            // In reality, query 'pagos_empleados' collection
            const isPaid = Math.random() > 0.1;
            if (isPaid) totalPagado += payrollCost;
        });

        return {
            totalGenerado,
            totalPagado,
            totalPendiente: totalGenerado - totalPagado
        };
    } catch (error) {
        return { totalGenerado: 0, totalPagado: 0, totalPendiente: 0 };
    }
}

/**
 * Obtiene el rendimiento del equipo (Employee Performance)
 */
export async function obtenerRendimientoPersonal(fechaInicio?: Date, fechaFin?: Date): Promise<RendimientoEmpleado[]> {
    try {
        const filters = [
            Query.equal("estado", "completada"),
            Query.limit(5000),
            ...getDateFilter(fechaInicio, fechaFin, "fechaCita")
        ];

        const citasResponse = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, filters);
        const citas = citasResponse.documents as unknown as Cita[];
        const empleados = await obtenerEmpleados({ activo: true });

        const statsMap = new Map<string, { count: number, revenue: number }>();

        citas.forEach(cita => {
            if (cita.empleadosAsignados && cita.empleadosAsignados.length > 0) {
                // Split revenue among assigned employees
                const precio = Number(cita.precioAcordado) || Number(cita.precioCliente) || 0;
                const revenuePerEmp = precio / cita.empleadosAsignados.length;

                cita.empleadosAsignados.forEach(empId => {
                    const current = statsMap.get(empId) || { count: 0, revenue: 0 };
                    statsMap.set(empId, {
                        count: current.count + 1,
                        revenue: current.revenue + revenuePerEmp
                    });
                });
            }
        });

        const result: RendimientoEmpleado[] = empleados.map(emp => {
            const stats = statsMap.get(emp.$id) || { count: 0, revenue: 0 };
            return {
                empleadoId: emp.$id,
                nombre: `${emp.nombre} ${emp.apellido}`,
                serviciosCompletados: stats.count,
                totalGenerado: stats.revenue,
                calificacionPromedio: 5.0
            };
        });

        return result.sort((a, b) => b.serviciosCompletados - a.serviciosCompletados);

    } catch (error) {
        console.error("Error obteniendo rendimiento personal:", error);
        return [];
    }
}
