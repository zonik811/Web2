
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
    console.log("Checking 'banco_horas' schema...");

    try {
        console.log("--- Collection: banco_horas ---");

        // empleadoId
        try {
            await databases.createStringAttribute(DATABASE_ID, 'banco_horas', 'empleadoId', 50, true);
            console.log("Created 'empleadoId'");
        } catch (e: any) { console.log("Info 'empleadoId':", e.message); }

        // fecha
        try {
            await databases.createStringAttribute(DATABASE_ID, 'banco_horas', 'fecha', 20, true);
            console.log("Created 'fecha'");
        } catch (e: any) { console.log("Info 'fecha':", e.message); }

        // tipo: DEUDA, ABONO
        try {
            await databases.createStringAttribute(DATABASE_ID, 'banco_horas', 'tipo', 20, true);
            console.log("Created 'tipo'");
        } catch (e: any) { console.log("Info 'tipo':", e.message); }

        // origen: RETARDO, AJUSTE_MANUAL, etc.
        try {
            await databases.createStringAttribute(DATABASE_ID, 'banco_horas', 'origen', 50, true);
            console.log("Created 'origen'");
        } catch (e: any) { console.log("Info 'origen':", e.message); }

        // cantidadMinutos (integer)
        try {
            await databases.createIntegerAttribute(DATABASE_ID, 'banco_horas', 'cantidadMinutos', true);
            console.log("Created 'cantidadMinutos'");
        } catch (e: any) { console.log("Info 'cantidadMinutos':", e.message); }

        // notas
        try {
            await databases.createStringAttribute(DATABASE_ID, 'banco_horas', 'notas', 500, false);
            console.log("Created 'notas'");
        } catch (e: any) { console.log("Info 'notas':", e.message); }

        await new Promise(r => setTimeout(r, 1000));

        // Index
        try {
            await databases.createIndex(DATABASE_ID, 'banco_horas', 'idx_banco_emp_fecha', 'key', ['empleadoId', 'fecha'], ['ASC', 'DESC']);
            console.log("Created index 'idx_banco_emp_fecha'");
        } catch (e: any) { console.log("Info index:", e.message); }

    } catch (error: any) {
        console.error("Error processing banco_horas:", error);
    }
}

main();
