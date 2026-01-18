
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
    console.log("Checking 'compensatorios' schema...");

    try {
        // empleadoId
        try {
            console.log("Creating 'empleadoId'...");
            await databases.createStringAttribute(DATABASE_ID, 'compensatorios', 'empleadoId', 50, true);
            console.log("Created 'empleadoId'");
        } catch (e: any) {
            console.log("Error creating 'empleadoId':", e.message);
        }

        // fechaGanado
        try {
            console.log("Creating 'fechaGanado'...");
            // ISO Date string
            await databases.createStringAttribute(DATABASE_ID, 'compensatorios', 'fechaGanado', 50, true);
            console.log("Created 'fechaGanado'");
        } catch (e: any) {
            console.log("Error creating 'fechaGanado':", e.message);
        }

        // diasGanados (float)
        try {
            console.log("Creating 'diasGanados'...");
            await databases.createFloatAttribute(DATABASE_ID, 'compensatorios', 'diasGanados', true);
            console.log("Created 'diasGanados'");
        } catch (e: any) {
            console.log("Error creating 'diasGanados':", e.message);
        }

        // estado
        try {
            console.log("Creating 'estado'...");
            // Enum: DISPONIBLE, USADO, VENCIDO
            await databases.createStringAttribute(DATABASE_ID, 'compensatorios', 'estado', 20, false, 'DISPONIBLE');
            console.log("Created 'estado'");
        } catch (e: any) {
            console.log("Error creating 'estado':", e.message);
        }

        // fechaVencimiento
        try {
            console.log("Creating 'fechaVencimiento'...");
            await databases.createStringAttribute(DATABASE_ID, 'compensatorios', 'fechaVencimiento', 50, false);
            console.log("Created 'fechaVencimiento'");
        } catch (e: any) {
            console.log("Error creating 'fechaVencimiento':", e.message);
        }

        // motivo
        try {
            console.log("Creating 'motivo'...");
            await databases.createStringAttribute(DATABASE_ID, 'compensatorios', 'motivo', 500, false);
            console.log("Created 'motivo'");
        } catch (e: any) {
            console.log("Error creating 'motivo':", e.message);
        }

        // fechaUso (opcional)
        try {
            console.log("Creating 'fechaUso'...");
            await databases.createStringAttribute(DATABASE_ID, 'compensatorios', 'fechaUso', 50, false);
            console.log("Created 'fechaUso'");
        } catch (e: any) {
            console.log("Error creating 'fechaUso':", e.message);
        }

        // Wait for attributes 
        await new Promise(r => setTimeout(r, 2000));

        // Index
        try {
            console.log("Creating index 'idx_comp_venc'...");
            await databases.createIndex(DATABASE_ID, 'compensatorios', 'idx_comp_venc', 'key', ['fechaVencimiento'], ['DESC']);
            console.log("Created index 'idx_comp_venc'");
        } catch (e: any) {
            console.log("Error creating index 'idx_comp_venc':", e.message);
        }

    } catch (error: any) {
        console.error("Fatal error:", error);
    }
}

main();
