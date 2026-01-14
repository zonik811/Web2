
import { databases } from "../src/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "../src/lib/appwrite";
import { Query } from "node-appwrite";
import * as fs from "fs";

async function inspect() {
    console.log("Inspecting Products Collection...");
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PRODUCTOS,
            [Query.limit(1)]
        );

        if (response.documents.length > 0) {
            const doc = response.documents[0];
            console.log("Found Document ID:", doc.$id);
            console.log("Keys:", Object.keys(doc));
            console.log("Full Document:", JSON.stringify(doc, null, 2));

            fs.writeFileSync("product_dump.json", JSON.stringify(doc, null, 2));
            console.log("Dump saved to product_dump.json");
        } else {
            console.log("No products found.");
        }
    } catch (error) {
        console.error("Error inspecting products:", error);
    }
}

inspect();
