
import { Client, Databases, Query } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

async function inspectCitas() {
    console.log("--- Inspeccionando CITAS ---");
    try {
        const citas = await databases.listDocuments(
            DATABASE_ID,
            'citas',
            [Query.limit(20), Query.orderDesc("$createdAt")]
        );


        console.log(`Total Citas found: ${citas.total}`);
        if (citas.documents.length > 0) {
            console.log("Full First Doc:", JSON.stringify(citas.documents[0], null, 2));
            citas.documents.forEach((doc: any) => {
                // Print all potential price fields
                console.log(`ID: ${doc.$id} | Estado: ${doc.estado} | Precio: ${doc.precio} | Costo: ${doc.costo} | Valor: ${doc.valor} | Total: ${doc.total}`);
            });
        } else {

            console.log("No citas found.");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

inspectCitas();
