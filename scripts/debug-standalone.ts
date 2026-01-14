
import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try to load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

// CORRECT VARIABLE NAME according to src/lib/appwrite.ts
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

const COLLECTIONS = {
    CITAS: 'citas',
    GASTOS: 'gastos',
    EMPLEADOS: 'empleados'
};

if (!ENDPOINT || !PROJECT_ID || !API_KEY || !DATABASE_ID) {
    console.error("Missing/Invalid Variables:", {
        ENDPOINT,
        PROJECT_ID,
        API_KEY: API_KEY ? 'Set' : 'Missing',
        DATABASE_ID
    });
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function main() {
    console.log("\n=== DIAGNOSTICO DE DATOS v2 ===");
    console.log(`Endpoint: ${ENDPOINT}`);
    console.log(`Project: ${PROJECT_ID}`);
    console.log(`Database: ${DATABASE_ID}`);

    try {
        const citas = await databases.listDocuments(DATABASE_ID, COLLECTIONS.CITAS, [
            Query.limit(5),
            Query.equal('estado', 'completada')
        ]);

        console.log(`\nCitas completadas encontradas: ${citas.total}`);

        if (citas.documents.length > 0) {
            const first = citas.documents[0];
            console.log("\n--- Estructura de Cita Real ---");
            console.log(JSON.stringify(first, null, 2)); // Dump full object to see all fields

            // Validate 'precioAcordado'
            console.log("\n--- Validación de Campos Clave ---");
            console.log(`precioAcordado: ${first.precioAcordado} (Type: ${typeof first.precioAcordado})`);
            console.log(`empleadosAsignados: ${JSON.stringify(first.empleadosAsignados)} (Type: ${typeof first.empleadosAsignados}, IsArray: ${Array.isArray(first.empleadosAsignados)})`);
        }
    } catch (error) {
        console.error("Error Appwrite:", error.message);
        if (error.code) console.error("Code:", error.code);
        if (error.type) console.error("Type:", error.type);
    }
}

main();
