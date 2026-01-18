
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
    console.log("Checking 'horas_extras' and 'dias_festivos' schema...");

    // --- HORAS EXTRAS ---
    try {
        console.log("--- Collection: horas_extras ---");

        // empleadoId
        try {
            await databases.createStringAttribute(DATABASE_ID, 'horas_extras', 'empleadoId', 50, true);
            console.log("Created 'empleadoId'");
        } catch (e: any) { console.log("Info 'empleadoId':", e.message); }

        // fecha
        try {
            await databases.createStringAttribute(DATABASE_ID, 'horas_extras', 'fecha', 20, true);
            console.log("Created 'fecha'");
        } catch (e: any) { console.log("Info 'fecha':", e.message); }

        // horaInicio
        try {
            await databases.createStringAttribute(DATABASE_ID, 'horas_extras', 'horaInicio', 10, true);
            console.log("Created 'horaInicio'");
        } catch (e: any) { console.log("Info 'horaInicio':", e.message); }

        // horaFin
        try {
            await databases.createStringAttribute(DATABASE_ID, 'horas_extras', 'horaFin', 10, true);
            console.log("Created 'horaFin'");
        } catch (e: any) { console.log("Info 'horaFin':", e.message); }

        // cantidadHoras
        try {
            await databases.createFloatAttribute(DATABASE_ID, 'horas_extras', 'cantidadHoras', true);
            console.log("Created 'cantidadHoras'");
        } catch (e: any) { console.log("Info 'cantidadHoras':", e.message); }

        // tipo: DIURNA, NOCTURNA, DOMINICAL, FESTIVA
        try {
            await databases.createStringAttribute(DATABASE_ID, 'horas_extras', 'tipo', 20, true);
            console.log("Created 'tipo'");
        } catch (e: any) { console.log("Info 'tipo':", e.message); }

        // multiplicador
        try {
            await databases.createFloatAttribute(DATABASE_ID, 'horas_extras', 'multiplicador', false);
            console.log("Created 'multiplicador'");
        } catch (e: any) { console.log("Info 'multiplicador':", e.message); }

        // horasEquivalentes
        try {
            await databases.createFloatAttribute(DATABASE_ID, 'horas_extras', 'horasEquivalentes', false);
            console.log("Created 'horasEquivalentes'");
        } catch (e: any) { console.log("Info 'horasEquivalentes':", e.message); }

        // motivo
        try {
            await databases.createStringAttribute(DATABASE_ID, 'horas_extras', 'motivo', 500, false);
            console.log("Created 'motivo'");
        } catch (e: any) { console.log("Info 'motivo':", e.message); }

        // estado: PENDIENTE, APROBADO, RECHAZADO
        try {
            await databases.createStringAttribute(DATABASE_ID, 'horas_extras', 'estado', 20, false, 'PENDIENTE');
            console.log("Created 'estado'");
        } catch (e: any) { console.log("Info 'estado':", e.message); }

        // aprobadoPor
        try {
            await databases.createStringAttribute(DATABASE_ID, 'horas_extras', 'aprobadoPor', 50, false);
            console.log("Created 'aprobadoPor'");
        } catch (e: any) { console.log("Info 'aprobadoPor':", e.message); }

        await new Promise(r => setTimeout(r, 1000));

        // Index
        try {
            await databases.createIndex(DATABASE_ID, 'horas_extras', 'idx_extra_fecha', 'key', ['fecha'], ['DESC']);
            console.log("Created index 'idx_extra_fecha'");
        } catch (e: any) { console.log("Info index:", e.message); }

        try {
            await databases.createIndex(DATABASE_ID, 'horas_extras', 'idx_extra_estado', 'key', ['estado'], ['ASC']);
            console.log("Created index 'idx_extra_estado'");
        } catch (e: any) { console.log("Info index:", e.message); }

    } catch (error: any) {
        console.error("Error processing horas_extras:", error);
    }

    // --- DIAS FESTIVOS ---
    try {
        console.log("--- Collection: dias_festivos ---");

        // fecha
        try {
            await databases.createStringAttribute(DATABASE_ID, 'dias_festivos', 'fecha', 20, true);
            console.log("Created 'fecha'");
        } catch (e: any) { console.log("Info 'fecha':", e.message); }

        // nombre
        try {
            await databases.createStringAttribute(DATABASE_ID, 'dias_festivos', 'nombre', 100, true);
            console.log("Created 'nombre'");
        } catch (e: any) { console.log("Info 'nombre':", e.message); }

        // esIrrenunciable
        try {
            await databases.createBooleanAttribute(DATABASE_ID, 'dias_festivos', 'esIrrenunciable', false, false);
            console.log("Created 'esIrrenunciable'");
        } catch (e: any) { console.log("Info 'esIrrenunciable':", e.message); }

        // multiplicador
        try {
            await databases.createFloatAttribute(DATABASE_ID, 'dias_festivos', 'multiplicador', false, 1.75);
            console.log("Created 'multiplicador'");
        } catch (e: any) { console.log("Info 'multiplicador':", e.message); }

        await new Promise(r => setTimeout(r, 1000));

        // Index
        try {
            await databases.createIndex(DATABASE_ID, 'dias_festivos', 'idx_festivo_fecha', 'key', ['fecha'], ['ASC']);
            console.log("Created index 'idx_festivo_fecha'");
        } catch (e: any) { console.log("Info index:", e.message); }

    } catch (error: any) {
        console.error("Error processing dias_festivos:", error);
    }
}

main();
