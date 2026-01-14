
import { Client, Databases } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'empresa_config';

async function listAttributes() {
    try {
        console.log(`Checking attributes for collection: ${COLLECTION_ID} in DB: ${DATABASE_ID}`);
        const response = await databases.listAttributes(DATABASE_ID, COLLECTION_ID);

        console.log("\nExisting Attributes:");
        response.attributes.forEach((attr: any) => {
            console.log(`- ${attr.key} (${attr.type}) [Status: ${attr.status}]`);
        });

        const missing = ['landing_equipo', 'landing_testimonios', 'branding_colors'].filter(
            key => !response.attributes.find((a: any) => a.key === key)
        );

        if (missing.length > 0) {
            console.log("\n❌ MISSING ATTRIBUTES:", missing);
        } else {
            console.log("\n✅ All critical attributes present!");
        }

    } catch (error) {
        console.error("Error listing attributes:", error);
    }
}

listAttributes();
