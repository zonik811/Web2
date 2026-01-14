import { Client, Databases } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const COLLECTIONS = {
    PRODUCTOS: "productos", // Using the ID confirmed by existence
    COMPRAS: "compras"
};

async function createAttributeIfNotExists(collectionId: string, type: 'string' | 'integer' | 'double' | 'boolean', key: string, size?: number, required: boolean = false, defaultValue?: any) {
    try {
        console.log(`Intentando crear atributo '${key}' en ${collectionId}...`);
        switch (type) {
            case 'string':
                await databases.createStringAttribute(DATABASE_ID, collectionId, key, size || 255, required, defaultValue);
                break;
            case 'integer':
                await databases.createIntegerAttribute(DATABASE_ID, collectionId, key, required, 0, 999999999, defaultValue);
                break;
            case 'double':
                await databases.createFloatAttribute(DATABASE_ID, collectionId, key, required, undefined, undefined, defaultValue);
                break;
            case 'boolean':
                await databases.createBooleanAttribute(DATABASE_ID, collectionId, key, required, defaultValue);
                break;
        }
        console.log(`✅ Atributo '${key}' creado exitosamente.`);
    } catch (error: any) {
        if (error.code === 409) {
            console.log(`ℹ️ Atributo '${key}' ya existe.`);
        } else {
            console.error(`❌ Error creando '${key}':`, error.message);
        }
    }
}

async function main() {
    console.log("--- Actualizando Esquema de Base de Datos ---");

    // 1. Productos: Agregar campos nuevos que faltaban
    await createAttributeIfNotExists(COLLECTIONS.PRODUCTOS, 'integer', 'stock_actual', undefined, false, 0);
    await createAttributeIfNotExists(COLLECTIONS.PRODUCTOS, 'double', 'precio_venta', undefined, false, 0.0);
    await createAttributeIfNotExists(COLLECTIONS.PRODUCTOS, 'double', 'precio_compra', undefined, false, 0.0);
    await createAttributeIfNotExists(COLLECTIONS.PRODUCTOS, 'string', 'categoria_id', 50, false, "general");
    await createAttributeIfNotExists(COLLECTIONS.PRODUCTOS, 'string', 'codigo_barras', 50, false, null);
    await createAttributeIfNotExists(COLLECTIONS.PRODUCTOS, 'string', 'sku', 50, false, null);

    // Store fields
    await createAttributeIfNotExists(COLLECTIONS.PRODUCTOS, 'boolean', 'visible_en_tienda', undefined, false, false);
    await createAttributeIfNotExists(COLLECTIONS.PRODUCTOS, 'boolean', 'tiene_descuento', undefined, false, false);
    await createAttributeIfNotExists(COLLECTIONS.PRODUCTOS, 'integer', 'porcentaje_descuento', undefined, false, 0);
    await createAttributeIfNotExists(COLLECTIONS.PRODUCTOS, 'double', 'precio_promocional', undefined, false, 0.0);

    // 2. Compras: Asegurar campos
    await createAttributeIfNotExists(COLLECTIONS.COMPRAS, 'double', 'subtotal', undefined, false, 0.0);
    await createAttributeIfNotExists(COLLECTIONS.COMPRAS, 'double', 'iva', undefined, false, 0.0);
    // detalles_items vs items: create detalles_items just in case
    await createAttributeIfNotExists(COLLECTIONS.COMPRAS, 'string', 'detalles_items', 5000, false, "[]");

    console.log("--- Finalizado. Esperando propagación de índices... ---");
}

main();
