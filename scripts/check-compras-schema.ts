import { Client, Databases } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
// We suspect the ID is 'compras' based on previous context, or maybe 'compra'
const COLLECTION_ID = "compras";

async function main() {
    try {
        console.log(`Chequeando esquema de ${COLLECTION_ID}...`);
        const collection = await databases.listAttributes(DATABASE_ID, COLLECTION_ID);

        console.log("--- Atributos ---");
        collection.attributes.forEach((attr: any) => {
            console.log(`- [${attr.key}] (${attr.type}) Required: ${attr.required}, Default: ${attr.default}`);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

main();
