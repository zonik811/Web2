import {
    obtenerMejoresClientes,
    obtenerRendimientoPersonal,
    obtenerResumenFinanciero
} from "../src/lib/actions/reportes";
import { databases } from "../src/lib/appwrite";
import { COLLECTIONS, DATABASE_ID } from "../src/lib/appwrite";

async function main() {
    console.log("=== Debugging Reportes ===");
    const startDate = new Date(2025, 0, 1); // Jan 1st 2025
    const endDate = new Date(2026, 11, 31); // Dec 31st 2026 (cover wide range)

    console.log(`Rango de fechas: ${startDate.toISOString()} - ${endDate.toISOString()}`);

    // 1. Debug Citas Raw Structure
    console.log("\n--- Comprobando Estructura de Citas (Raw) ---");
    try {
        const citasRaw = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.CITAS,
            []
        );
        if (citasRaw.documents.length > 0) {
            const sample = citasRaw.documents[0];
            console.log("Muestra de Cita:");
            console.log(JSON.stringify({
                id: sample.$id,
                precioAcordado: sample.precioAcordado,
                typeOfPrecio: typeof sample.precioAcordado,
                empleadosAsignados: sample.empleadosAsignados,
                typeOfEmpleados: Array.isArray(sample.empleadosAsignados) ? 'array' : typeof sample.empleadosAsignados,
                clienteNombre: sample.clienteNombre,
                clienteTelefono: sample.clienteTelefono,
                fechaCita: sample.fechaCita,
                estado: sample.estado
            }, null, 2));
        } else {
            console.log("No hay citas en la base de datos.");
        }
    } catch (e) {
        console.error("Error fetching raw citas:", e);
    }

    // 2. Debug Mejores Clientes
    console.log("\n--- Debug Mejores Clientes ---");
    try {
        const mejoresClientes = await obtenerMejoresClientes(startDate, endDate);
        console.log("Resultado:", JSON.stringify(mejoresClientes, null, 2));
    } catch (e) {
        console.error("Error en obtenerMejoresClientes:", e);
    }

    // 3. Debug Rendimiento Personal
    console.log("\n--- Debug Rendimiento Personal ---");
    try {
        // Mocking obtenerEmpleados dependency if needed or assuming it works
        // Note: This runs in node context, might fail if 'obtenerEmpleados' uses something client-side restricted but it says 'use server'
        const rendimiento = await obtenerRendimientoPersonal(startDate, endDate);
        console.log("Resultado:", JSON.stringify(rendimiento.slice(0, 3), null, 2));
    } catch (e) {
        console.error("Error en obtenerRendimientoPersonal:", e);
    }
}

main();
