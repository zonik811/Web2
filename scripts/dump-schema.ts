import { Client, Databases } from "node-appwrite";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const COLLECTIONS = ["productos", "compras"];

async function main() {
    let output = "=== APPWRITE SCHEMA DUMP ===\n\n";

    for (const id of COLLECTIONS) {
        output += `Collection: ${id}\n`;
        output += "----------------------------------------\n";
        try {
            const response = await databases.listAttributes(DATABASE_ID, id);
            response.attributes.forEach((attr: any) => {
                output += `Key: ${attr.key}\n`;
                output += `Type: ${attr.type}\n`;
                output += `Required: ${attr.required}\n`;
                output += `Default: ${attr.default}\n`;
                output += `Array: ${attr.array}\n`;
                output += "...\n";
            });
        } catch (e: any) {
            output += `Error fetching schema: ${e.message}\n`;
        }
        output += "\n\n";
    }

    fs.writeFileSync("schema_dump.txt", output);
    console.log("Schema dumped to schema_dump.txt");
}

main();
