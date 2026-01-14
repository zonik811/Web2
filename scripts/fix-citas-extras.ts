
import { Client, Databases } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const CITAS_COLLECTION_ID = "citas";

async function repairCitasSchema() {
    try {
        console.log("🛠️ Iniciando reparación de schema Citas (Extras)...");

        // 1. Agregar detallesAdicionales (String, largo, opcional)
        try {
            console.log("Agregando atributo 'detallesAdicionales'...");
            // createStringAttribute(databaseId, collectionId, key, size, required, default, array)
            await databases.createStringAttribute(DATABASE_ID, CITAS_COLLECTION_ID, "detallesAdicionales", 1000, false, undefined);
            console.log("✅ Atributo 'detallesAdicionales' creado.");
        } catch (error: any) {
            if (error.code === 409) {
                console.log("⚠️ El atributo 'detallesAdicionales' ya existe.");
            } else {
                console.error("❌ Error creando 'detallesAdicionales':", error);
            }
        }

        // 2. Agregar notasInternas (String, largo, opcional) - Proactivo
        try {
            console.log("Agregando atributo 'notasInternas'...");
            await databases.createStringAttribute(DATABASE_ID, CITAS_COLLECTION_ID, "notasInternas", 1000, false, undefined);
            console.log("✅ Atributo 'notasInternas' creado.");
        } catch (error: any) {
            if (error.code === 409) {
                console.log("⚠️ El atributo 'notasInternas' ya existe.");
            } else {
                console.error("❌ Error creando 'notasInternas':", error);
            }
        }

        console.log("✅ Reparación finalizada.");
    } catch (error) {
        console.error("❌ Error general en reparación:", error);
    }
}

repairCitasSchema();
