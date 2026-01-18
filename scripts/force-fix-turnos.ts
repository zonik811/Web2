
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
    console.log("Checking 'turnos' schema...");

    try {
        console.log("--- Collection: turnos ---");

        // nombre
        try {
            await databases.createStringAttribute(DATABASE_ID, 'turnos', 'nombre', 50, true);
            console.log("Created 'nombre'");
        } catch (e: any) { console.log("Info 'nombre':", e.message); }

        // horaEntrada
        try {
            await databases.createStringAttribute(DATABASE_ID, 'turnos', 'horaEntrada', 10, true);
            console.log("Created 'horaEntrada'");
        } catch (e: any) { console.log("Info 'horaEntrada':", e.message); }

        // horaSalida
        try {
            await databases.createStringAttribute(DATABASE_ID, 'turnos', 'horaSalida', 10, true);
            console.log("Created 'horaSalida'");
        } catch (e: any) { console.log("Info 'horaSalida':", e.message); }

        // color
        try {
            await databases.createStringAttribute(DATABASE_ID, 'turnos', 'color', 20, false, '#3b82f6');
            console.log("Created 'color'");
        } catch (e: any) { console.log("Info 'color':", e.message); }

        // activo
        try {
            await databases.createBooleanAttribute(DATABASE_ID, 'turnos', 'activo', true, true);
            console.log("Created 'activo'");
        } catch (e: any) { console.log("Info 'activo':", e.message); }

        console.log("--- Collection: asignacion_turnos ---");

        // empleadoId
        try {
            await databases.createStringAttribute(DATABASE_ID, 'asignacion_turnos', 'empleadoId', 50, true);
            console.log("Created 'empleadoId'");
        } catch (e: any) { console.log("Info 'empleadoId':", e.message); }

        // turnoId
        try {
            await databases.createStringAttribute(DATABASE_ID, 'asignacion_turnos', 'turnoId', 50, true);
            console.log("Created 'turnoId'");
        } catch (e: any) { console.log("Info 'turnoId':", e.message); }

        // fechaInicio
        try {
            await databases.createStringAttribute(DATABASE_ID, 'asignacion_turnos', 'fechaInicio', 20, true);
            console.log("Created 'fechaInicio'");
        } catch (e: any) { console.log("Info 'fechaInicio':", e.message); }

        // fechaFin
        try {
            await databases.createStringAttribute(DATABASE_ID, 'asignacion_turnos', 'fechaFin', 20, true);
            console.log("Created 'fechaFin'");
        } catch (e: any) { console.log("Info 'fechaFin':", e.message); }

        // notas
        try {
            await databases.createStringAttribute(DATABASE_ID, 'asignacion_turnos', 'notas', 500, false);
            console.log("Created 'notas'");
        } catch (e: any) { console.log("Info 'notas':", e.message); }

        await new Promise(r => setTimeout(r, 1000));

        // Indexes
        try {
            await databases.createIndex(DATABASE_ID, 'asignacion_turnos', 'idx_asig_emp_fecha', 'key', ['empleadoId', 'fechaInicio'], ['ASC', 'DESC']);
            console.log("Created index 'idx_asig_emp_fecha'");
        } catch (e: any) { console.log("Info index:", e.message); }

        try {
            await databases.createIndex(DATABASE_ID, 'asignacion_turnos', 'idx_asig_rango', 'key', ['fechaInicio', 'fechaFin'], ['ASC', 'ASC']);
            console.log("Created index 'idx_asig_rango'");
        } catch (e: any) { console.log("Info index:", e.message); }

    } catch (error: any) {
        console.error("Error processing turnos:", error);
    }
}

main();
