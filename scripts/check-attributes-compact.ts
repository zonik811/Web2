
import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases, Query } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'empresa_config';

async function main() {
    try {
        const response = await databases.listAttributes(DATABASE_ID, COLLECTION_ID, [
            Query.limit(100)
        ]);

        console.log(`\nCOUNT: ${response.total}`);
        console.log("KEYS:");
        response.attributes.map((a: any) => console.log(a.key));

    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

main();
