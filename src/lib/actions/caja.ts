"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { ID, Query } from "node-appwrite";
import { TurnoCaja, MovimientoCaja } from "@/types/caja";
import { revalidatePath } from "next/cache";

// ==========================================
// GESTIÓN DE TURNOS (SESIONES)
// ==========================================

/**
 * Get the currently active cash register session (any user)
 * Assumes only ONE cash register should be open at a time
 */
export async function obtenerTurnoActivo(userId?: string): Promise<TurnoCaja | null> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.TURNOS_CAJA,
            [
                Query.equal("estado", "abierta"),
                Query.limit(1),
                Query.orderDesc("$createdAt")
            ]
        );

        if (response.documents.length > 0) {
            return response.documents[0] as unknown as TurnoCaja;
        }
        return null;
    } catch (error) {
        console.error("Error obteniendo turno activo:", error);
        return null;
    }
}

export async function abrirCaja(userId: string, userName: string, baseInicial: number) {
    try {
        // 1. Check if already open
        const active = await obtenerTurnoActivo(userId);
        if (active) {
            return { success: false, error: "Ya tienes un turno abierto." };
        }

        // 2. Create Turno
        const turnoData = {
            usuario_id: userId,
            usuario_nombre: userName,
            fecha_apertura: new Date().toISOString(),
            base_inicial: baseInicial,
            total_ventas_efectivo: 0,
            total_ventas_tarjeta: 0,
            total_ventas_transferencia: 0,
            estado: "abierta",
        };

        const turno = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.TURNOS_CAJA,
            ID.unique(),
            turnoData
        );

        // 3. Register 'Base' as the first movement (Ingreso)
        if (baseInicial > 0) {
            await registrarMovimientoCaja({
                turno_id: turno.$id,
                tipo: 'ingreso',
                monto: baseInicial,
                descripcion: 'Base Inicial de Caja',
                metodo_pago: 'efectivo',
                usuario_id: userId,
                fecha: new Date().toISOString()
            });
        }

        revalidatePath("/admin/ventas/pos");
        return { success: true, turnoId: turno.$id };
    } catch (error) {
        console.error("Error abriendo caja:", error);
        return { success: false, error: "Error al abrir la caja." };
    }
}

export async function cerrarCaja(
    turnoId: string,
    cierreUserId: string,
    valoresDeclarados: { efectivo: number; tarjetas: number },
    observaciones?: string
) {
    try {
        // 1. Get current stats to calculate difference
        const turno = await databases.getDocument(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, turnoId) as unknown as TurnoCaja;

        if (turno.estado === 'cerrada') return { success: false, error: "Este turno ya está cerrado." };

        // Calculate expected (System) vs Declared
        // Note: In a real system you'd sum up 'Movimientos' here to be 100% sure, 
        // but we'll trust the accumulated fields for now or re-calculate.
        // Let's re-calculate from movements for safety.

        const movimientos = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.MOVIMIENTOS_CAJA,
            [Query.equal("turno_id", turnoId), Query.limit(5000)]
        );

        // Calculate System Totals
        let sistemaEfectivo = 0;
        let sistemaTarjetas = 0;

        // Base inicial is usually counted in 'sistemaEfectivo' if we treated it as an 'ingreso' movement
        // We did that in abrirCaja, so simple sum should work.

        movimientos.documents.forEach((mov: any) => {
            if (mov.metodo_pago === 'efectivo') {
                if (mov.tipo === 'ingreso' || mov.tipo === 'venta') sistemaEfectivo += mov.monto;
                if (mov.tipo === 'retiro') sistemaEfectivo -= mov.monto;
            } else {
                // Tarjetas / Transferencias
                if (mov.tipo === 'venta') sistemaTarjetas += mov.monto;
            }
        });

        const diferencia = valoresDeclarados.efectivo - sistemaEfectivo;

        // 2. Update Turno
        await databases.updateDocument(
            DATABASE_ID,
            COLLECTIONS.TURNOS_CAJA,
            turnoId,
            {
                fecha_cierre: new Date().toISOString(),
                usuario_cierre_id: cierreUserId,
                estado: "cerrada",
                total_ventas_efectivo: sistemaEfectivo,
                total_ventas_tarjeta: sistemaTarjetas
            }
        );

        revalidatePath("/admin/ventas/pos");
        return { success: true };

    } catch (error) {
        console.error("Error cerrando caja:", error);
        return { success: false, error: "Error al cerrar la caja." };
    }
}

// ==========================================
// MOVIMIENTOS
// ==========================================

export async function registrarMovimientoCaja(data: Omit<MovimientoCaja, keyof Models.Document>) {
    try {
        await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.MOVIMIENTOS_CAJA,
            ID.unique(),
            data
        );
        return { success: true };
    } catch (error) {
        console.error("Error registrando movimiento caja:", error);
        return { success: false, error };
    }
}

export async function obtenerResumenTurno(turnoId: string) {
    // Helper to get quick stats for the UI before closing
    const movimientos = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MOVIMIENTOS_CAJA,
        [Query.equal("turno_id", turnoId), Query.limit(5000)]
    );

    let totalEfectivo = 0;
    let totalVentas = 0;

    movimientos.documents.forEach((mov: any) => {
        if (mov.tipo === 'venta') {
            totalVentas += mov.monto;
        }
        if (mov.metodo_pago === 'efectivo') {
            if (mov.tipo === 'ingreso' || mov.tipo === 'venta') totalEfectivo += mov.monto;
            if (mov.tipo === 'retiro') totalEfectivo -= mov.monto;
        }
    });

    return { totalEfectivo, totalVentas };
}
