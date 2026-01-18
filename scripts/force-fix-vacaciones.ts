
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
    console.log("Checking 'vacaciones' schema...");

    try {
        // anio
        try {
            console.log("Creating 'anio'...");
            await databases.createIntegerAttribute(DATABASE_ID, 'vacaciones', 'anio', true);
            console.log("Created 'anio'");
        } catch (e: any) {
            console.log("Error creating 'anio':", e.message);
        }

        // diasSolicitados
        try {
            console.log("Creating 'diasSolicitados'...");
            // Required = false to allow existing docs
            await databases.createIntegerAttribute(DATABASE_ID, 'vacaciones', 'diasSolicitados', false);
            console.log("Created 'diasSolicitados'");
        } catch (e: any) {
            console.log("Error creating 'diasSolicitados':", e.message);
        }

        // estado
        try {
            console.log("Creating 'estado'...");
            // Required = false, default 'PENDIENTE'
            await databases.createStringAttribute(DATABASE_ID, 'vacaciones', 'estado', 20, false, 'PENDIENTE');
            console.log("Created 'estado'");
        } catch (e: any) {
            console.log("Error creating 'estado':", e.message);
        }

        // motivo
        try {
            console.log("Creating 'motivo'...");
            await databases.createStringAttribute(DATABASE_ID, 'vacaciones', 'motivo', 500, false);
            console.log("Created 'motivo'");
        } catch (e: any) {
            console.log("Error creating 'motivo':", e.message);
        }

        // aprobadoPor
        try {
            console.log("Creating 'aprobadoPor'...");
            await databases.createStringAttribute(DATABASE_ID, 'vacaciones', 'aprobadoPor', 100, false);
            console.log("Created 'aprobadoPor'");
        } catch (e: any) {
            console.log("Error creating 'aprobadoPor':", e.message);
        }

        // fechaAprobacion
        try {
            console.log("Creating 'fechaAprobacion'...");
            await databases.createStringAttribute(DATABASE_ID, 'vacaciones', 'fechaAprobacion', 50, false);
            console.log("Created 'fechaAprobacion'");
        } catch (e: any) {
            console.log("Error creating 'fechaAprobacion':", e.message);
        }

        // comentariosRechazo
        try {
            console.log("Creating 'comentariosRechazo'...");
            await databases.createStringAttribute(DATABASE_ID, 'vacaciones', 'comentariosRechazo', 500, false);
            console.log("Created 'comentariosRechazo'");
        } catch (e: any) {
            console.log("Error creating 'comentariosRechazo':", e.message);
        }

        // Wait for attributes to likely be available before indexing
        await new Promise(r => setTimeout(r, 2000));

        // Index for fechaInicio if not exists
        try {
            console.log("Creating index 'idx_vac_fecha'...");
            await databases.createIndex(DATABASE_ID, 'vacaciones', 'idx_vac_fecha', 'key', ['fechaInicio'], ['DESC']);
            console.log("Created index 'idx_vac_fecha'");
        } catch (e: any) {
            console.log("Error creating index 'idx_vac_fecha':", e.message);
        }

    } catch (error: any) {
        console.error("Fatal error:", error);
    }
}

main();
