
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
        console.log("🛠️ Iniciando reparación de schema Citas (pagadoPorCliente)...");

        // 1. Agregar atributo pagadoPorCliente (Boolean)
        // required: false, default: false
        try {
            console.log("Agregando atributo 'pagadoPorCliente'...");
            await databases.createBooleanAttribute(DATABASE_ID, CITAS_COLLECTION_ID, "pagadoPorCliente", false, false);
            console.log("✅ Atributo 'pagadoPorCliente' creado.");
        } catch (error: any) {
            if (error.code === 409) {
                console.log("⚠️ El atributo 'pagadoPorCliente' ya existe.");
            } else {
                console.error("❌ Error creando 'pagadoPorCliente':", error);
            }
        }

        console.log("✅ Reparación finalizada.");
    } catch (error) {
        console.error("❌ Error general en reparación:", error);
    }
}

repairCitasSchema();
