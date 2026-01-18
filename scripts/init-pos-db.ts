import { Client, Databases } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "")
    .setKey(process.env.APPWRITE_API_KEY || "");

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const COLLECTIONS = {
    TURNOS_CAJA: "turnos_caja",
    MOVIMIENTOS_CAJA: "movimientos_caja"
};

async function createTurnosCajaCollection() {
    try {
        console.log(`Checking collection ${COLLECTIONS.TURNOS_CAJA}...`);
        try {
            await databases.getCollection(DATABASE_ID, COLLECTIONS.TURNOS_CAJA);
            console.log("Collection already exists.");
        } catch (e) {
            console.log("Creating collection...");
            await databases.createCollection(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "Turnos de Caja");

            console.log("Creating attributes...");
            await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "usuario_id", 50, true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "usuario_nombre", 100, true);
            await databases.createDatetimeAttribute(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "fecha_apertura", true);
            await databases.createDatetimeAttribute(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "fecha_cierre", false);
            await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "base_inicial", true);
            await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "total_ventas_efectivo", false, 0);
            await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "total_ventas_tarjeta", false, 0);
            await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "total_ventas_transferencia", false, 0);
            await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "estado", 20, true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "usuario_cierre_id", 50, false);
            await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.TURNOS_CAJA, "diferencia", false);

            console.log("Collection and attributes created!");
        }
    } catch (e) {
        console.error("Error creating Turnos collection:", e);
    }
}

async function createMovimientosCajaCollection() {
    try {
        console.log(`Checking collection ${COLLECTIONS.MOVIMIENTOS_CAJA}...`);
        try {
            await databases.getCollection(DATABASE_ID, COLLECTIONS.MOVIMIENTOS_CAJA);
            console.log("Collection already exists.");
        } catch (e) {
            console.log("Creating collection...");
            await databases.createCollection(DATABASE_ID, COLLECTIONS.MOVIMIENTOS_CAJA, "Movimientos de Caja");

            console.log("Creating attributes...");
            await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.MOVIMIENTOS_CAJA, "turno_id", 50, true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.MOVIMIENTOS_CAJA, "tipo", 20, true);
            await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.MOVIMIENTOS_CAJA, "monto", true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.MOVIMIENTOS_CAJA, "descripcion", 255, true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.MOVIMIENTOS_CAJA, "metodo_pago", 20, false);
            await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.MOVIMIENTOS_CAJA, "referencia_id", 50, false);
            await databases.createDatetimeAttribute(DATABASE_ID, COLLECTIONS.MOVIMIENTOS_CAJA, "fecha", true);
            await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.MOVIMIENTOS_CAJA, "usuario_id", 50, true);

            console.log("Collection and attributes created!");
        }
    } catch (e) {
        console.error("Error creating Movimientos collection:", e);
    }
}

async function main() {
    if (!DATABASE_ID) {
        console.error("DATABASE_ID not set in environment.");
        return;
    }
    await createTurnosCajaCollection();
    await createMovimientosCajaCollection();
    console.log("Done.");
}

main();
