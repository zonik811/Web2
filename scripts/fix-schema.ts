
import { Client, Databases, AttributeType } from "node-appwrite";
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

if (!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || !process.env.APPWRITE_API_KEY) {
    console.error("Error: Missing endpoint or API Key");
    process.exit(1);
}

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY); // Must be the API Key, not Project ID

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// IDs from your appwrite.ts config (Hardcoded map based on common usage in this project)
const COLLECTIONS = {
    SERVICIOS: 'servicios',
    CATEGORIAS: 'categorias'
};

async function fixSchema() {
    console.log("Checking schemas...");

    // 1. Fix 'servicios' - Add missing attributes
    console.log(`Checking collection '${COLLECTIONS.SERVICIOS}'...`);

    const serviciosAttrs = [
        { key: 'caracteristicas', type: 'string', size: 255, array: true },
        { key: 'requierePersonal', type: 'integer', required: true, min: 1 },
        { key: 'descripcionCorta', type: 'string', size: 255, required: false },
        { key: 'duracionEstimada', type: 'integer', required: true },
        { key: 'precioBase', type: 'double', required: true },
        { key: 'unidadPrecio', type: 'string', size: 50, required: true },
        { key: 'categoria', type: 'string', size: 100, required: true },
        { key: 'imagen', type: 'string', size: 255, required: false },
        { key: 'activo', type: 'boolean', required: false, default: true }
    ];

    for (const attr of serviciosAttrs) {
        try {
            if (attr.key === 'caracteristicas') {
                await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.SERVICIOS, attr.key, attr.size!, false, undefined, true);
            } else if (attr.type === 'integer') {
                // Integer creation signature: databaseId, collectionId, key, required, min, max, default
                await databases.createIntegerAttribute(DATABASE_ID, COLLECTIONS.SERVICIOS, attr.key, attr.required!, 0, 1000000, undefined);
            } else if (attr.type === 'string') {
                await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.SERVICIOS, attr.key, attr.size!, attr.required, undefined, false);
            } else if (attr.type === 'double') {
                await databases.createFloatAttribute(DATABASE_ID, COLLECTIONS.SERVICIOS, attr.key, attr.required!, undefined, undefined, undefined);
            } else if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.SERVICIOS, attr.key, attr.required!, attr.default, false);
            }
            console.log(`✅ Added '${attr.key}' to 'servicios'`);
        } catch (e: any) {
            if (e.code === 409) {
                console.log(`ℹ️ '${attr.key}' already exists in 'servicios'`);
            } else {
                console.error(`❌ Error adding '${attr.key}':`, e.message);
            }
        }
    }

    // 2. Ensuring 'categorias' collection exists and has attributes
    console.log(`Checking collection '${COLLECTIONS.CATEGORIAS}'...`);
    // Note: We assume the collection itself exists. If not, we'd need createCollection. 
    // Here we focus on attributes.

    const catAttributes = [
        { key: 'nombre', type: 'string', size: 100, required: true },
        { key: 'slug', type: 'string', size: 100, required: true },
        { key: 'descripcion', type: 'string', size: 500, required: false },
        { key: 'activo', type: 'boolean', required: false, default: true }
    ];

    for (const attr of catAttributes) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(DATABASE_ID, COLLECTIONS.CATEGORIAS, attr.key, attr.size!, attr.required, undefined, false);
            } else if (attr.type === 'boolean') {
                await databases.createBooleanAttribute(DATABASE_ID, COLLECTIONS.CATEGORIAS, attr.key, attr.required, attr.default, false);
            }
            console.log(`✅ Added '${attr.key}' to 'categorias'`);
        } catch (e: any) {
            if (e.code === 409) {
                console.log(`ℹ️ '${attr.key}' already exists in 'categorias'`);
            } else {
                console.error(`❌ Error adding '${attr.key}' to 'categorias':`, e.message);
            }
        }
    }
}

fixSchema();
