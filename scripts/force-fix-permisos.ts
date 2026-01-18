
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { Client, Databases } from 'node-appwrite';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !DATABASE_ID || !API_KEY) {
    console.error("Missing env vars");
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function main() {
    console.log("Checking 'permisos' schema...");

    try {
        console.log("--- Collection: permisos ---");

        // empleadoId
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'empleadoId', 50, true);
            console.log("Created 'empleadoId'");
        } catch (e: any) { console.log("Info 'empleadoId':", e.message); }

        // tipo: REMUNERADO, NO_REMUNERADO, MEDICO, etc.
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'tipo', 50, true);
            console.log("Created 'tipo'");
        } catch (e: any) { console.log("Info 'tipo':", e.message); }

        // subtipo (opcional)
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'subtipo', 100, false);
            console.log("Created 'subtipo'");
        } catch (e: any) { console.log("Info 'subtipo':", e.message); }

        // fechaInicio
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'fechaInicio', 20, true);
            console.log("Created 'fechaInicio'");
        } catch (e: any) { console.log("Info 'fechaInicio':", e.message); }

        // fechaFin
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'fechaFin', 20, true);
            console.log("Created 'fechaFin'");
        } catch (e: any) { console.log("Info 'fechaFin':", e.message); }

        // horaInicio (opcional)
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'horaInicio', 10, false);
            console.log("Created 'horaInicio'");
        } catch (e: any) { console.log("Info 'horaInicio':", e.message); }

        // horaFin (opcional)
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'horaFin', 10, false);
            console.log("Created 'horaFin'");
        } catch (e: any) { console.log("Info 'horaFin':", e.message); }

        // motivo
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'motivo', 500, true);
            console.log("Created 'motivo'");
        } catch (e: any) { console.log("Info 'motivo':", e.message); }

        // adjunto (Storage ID)
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'adjunto', 100, false);
            console.log("Created 'adjunto'");
        } catch (e: any) { console.log("Info 'adjunto':", e.message); }

        // estado: PENDIENTE, APROBADO, RECHAZADO
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'estado', 20, false, 'PENDIENTE');
            console.log("Created 'estado'");
        } catch (e: any) { console.log("Info 'estado':", e.message); }

        // aprobadoPor
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'aprobadoPor', 50, false);
            console.log("Created 'aprobadoPor'");
        } catch (e: any) { console.log("Info 'aprobadoPor':", e.message); }

        // comentarios (razón de rechazo o notas aprobación)
        try {
            await databases.createStringAttribute(DATABASE_ID, 'permisos', 'comentarios', 500, false);
            console.log("Created 'comentarios'");
        } catch (e: any) { console.log("Info 'comentarios':", e.message); }

        await new Promise(r => setTimeout(r, 1000));

        // Index
        try {
            await databases.createIndex(DATABASE_ID, 'permisos', 'idx_permiso_fecha', 'key', ['fechaInicio'], ['DESC']);
            console.log("Created index 'idx_permiso_fecha'");
        } catch (e: any) { console.log("Info index:", e.message); }

        try {
            await databases.createIndex(DATABASE_ID, 'permisos', 'idx_permiso_estado', 'key', ['estado'], ['ASC']);
            console.log("Created index 'idx_permiso_estado'");
        } catch (e: any) { console.log("Info index:", e.message); }

    } catch (error: any) {
        console.error("Error processing permisos:", error);
    }
}

main();
