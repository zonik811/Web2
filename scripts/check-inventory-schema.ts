
import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'movimientos_inventario';

async function checkSchema() {
    console.log('🔍 Inspeccionando colección:', COLLECTION_ID);
    try {
        const { attributes } = await databases.listAttributes(DATABASE_ID, COLLECTION_ID);
        console.log('📋 Atributos encontrados:');
        attributes.forEach((attr: any) => {
            console.log(`- ${attr.key} (${attr.type}) Required: ${attr.required}`);
        });
    } catch (error) {
        console.error('❌ Error listando atributos:', error);
    }
}

checkSchema();
