
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

async function listAttributes() {
    try {
        console.log("Listing attributes for Citas...");
        const response = await databases.listAttributes(DATABASE_ID, CITAS_COLLECTION_ID);
        response.attributes.forEach((attr: any) => {
            console.log(`- ${attr.key} (${attr.type}) Required: ${attr.required}, Default: ${attr.default}`);
        });
    } catch (error) {
        console.error("Error listing attributes:", error);
    }
}

listAttributes();
