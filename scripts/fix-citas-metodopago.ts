
import { Client, Databases, Permission, Role } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const CITAS_COLLECTION_ID = "citas"; // Verificamos que sea "citas" o "appointments"

async function repairCitasSchema() {
    try {
        console.log("🛠️ Iniciando reparación de schema Citas...");

        // 1. Agregar atributo metodoPago (String)
        try {
            console.log("Agregando atributo 'metodoPago'...");
            await databases.createStringAttribute(DATABASE_ID, CITAS_COLLECTION_ID, "metodoPago", 50, false);
            console.log("✅ Atributo 'metodoPago' creado.");
        } catch (error: any) {
            if (error.code === 409) {
                console.log("⚠️ El atributo 'metodoPago' ya existe.");
            } else {
                console.error("❌ Error creando 'metodoPago':", error);
            }
        }

        console.log("✅ Reparación finalizada.");
    } catch (error) {
        console.error("❌ Error general en reparación:", error);
    }
}

repairCitasSchema();
