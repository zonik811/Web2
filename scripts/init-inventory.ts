import { Client, Databases, Permission, Role } from "node-appwrite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

const COLLECTIONS = {
    PROVEEDORES: "proveedores",
    PRODUCTOS: "productos",
    MOVIMIENTOS: "movimientos_inventario",
    COMPRAS: "compras"
};

async function createCollection(key: string, name: string) {
    try {
        await databases.getCollection(DATABASE_ID, key);
        console.log(`Colección ${name} ya existe.`);
    } catch (error) {
        console.log(`Creando colección: ${name}...`);
        await databases.createCollection(DATABASE_ID, key, name, [
            Permission.read(Role.any()),
            Permission.write(Role.label("admin")),
            Permission.update(Role.label("admin")),
            Permission.delete(Role.label("admin")),
        ]);
        console.log(`✅ Colección ${name} creada.`);
    }
}

async function createAttribute(collectionId: string, type: 'string' | 'integer' | 'double' | 'boolean' | 'datetime' | 'email' | 'url', key: string, size?: number, required: boolean = false, array: boolean = false, defaultValue?: any) {
    try {
        // Check availability logic is complex via API, usually we just try-catch create
        // Simplification: We blindly try to create. If it fails with 409, it exists.
        switch (type) {
            case 'string':
                if (array) await databases.createStringAttribute(DATABASE_ID, collectionId, key, size || 255, required, undefined, true);
                else await databases.createStringAttribute(DATABASE_ID, collectionId, key, size || 255, required, defaultValue);
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
            case 'datetime':
                await databases.createDatetimeAttribute(DATABASE_ID, collectionId, key, required, defaultValue);
                break;
            case 'email':
                await databases.createEmailAttribute(DATABASE_ID, collectionId, key, required, defaultValue);
                break;
            case 'url':
                if (array) await databases.createUrlAttribute(DATABASE_ID, collectionId, key, required, undefined, true);
                else await databases.createUrlAttribute(DATABASE_ID, collectionId, key, required, defaultValue);
                break;
        }
        console.log(`   + Atributo ${key} ok.`);
    } catch (error: any) {
        if (error.code === 409) {
            // Exists
        } else {
            console.error(`   x Error atributo ${key} en ${collectionId}:`, error.message);
        }
    }
}

async function main() {
    console.log("Iniciando Setup de Inventario...");

    // 1. PROVEEDORES
    await createCollection(COLLECTIONS.PROVEEDORES, "Proveedores");
    await createAttribute(COLLECTIONS.PROVEEDORES, 'string', 'nombre', 200, true);
    await createAttribute(COLLECTIONS.PROVEEDORES, 'string', 'nit_rut', 50, false);
    await createAttribute(COLLECTIONS.PROVEEDORES, 'string', 'telefono', 50, false);
    await createAttribute(COLLECTIONS.PROVEEDORES, 'email', 'email', undefined, false);
    await createAttribute(COLLECTIONS.PROVEEDORES, 'string', 'direccion', 255, false);
    await createAttribute(COLLECTIONS.PROVEEDORES, 'string', 'nombre_contacto', 150, false);
    await createAttribute(COLLECTIONS.PROVEEDORES, 'boolean', 'activo', undefined, false, false, true);

    // 2. PRODUCTOS
    await createCollection(COLLECTIONS.PRODUCTOS, "Productos");
    await createAttribute(COLLECTIONS.PRODUCTOS, 'string', 'nombre', 200, true);
    await createAttribute(COLLECTIONS.PRODUCTOS, 'string', 'descripcion', 1000, false);
    await createAttribute(COLLECTIONS.PRODUCTOS, 'string', 'sku', 50, false);
    await createAttribute(COLLECTIONS.PRODUCTOS, 'string', 'codigo_barras', 50, false); // Para scanner
    await createAttribute(COLLECTIONS.PRODUCTOS, 'double', 'precio_compra', undefined, true); // Costo
    await createAttribute(COLLECTIONS.PRODUCTOS, 'double', 'precio_venta', undefined, true); // PVP
    await createAttribute(COLLECTIONS.PRODUCTOS, 'integer', 'stock_actual', undefined, true, false, 0);
    await createAttribute(COLLECTIONS.PRODUCTOS, 'integer', 'stock_minimo', undefined, false, false, 5);
    await createAttribute(COLLECTIONS.PRODUCTOS, 'string', 'categoria_id', 50, false);
    await createAttribute(COLLECTIONS.PRODUCTOS, 'string', 'proveedor_id', 50, false);
    // Store Fields
    await createAttribute(COLLECTIONS.PRODUCTOS, 'boolean', 'visible_en_tienda', undefined, false, false, false);
    await createAttribute(COLLECTIONS.PRODUCTOS, 'boolean', 'tiene_descuento', undefined, false, false, false);
    await createAttribute(COLLECTIONS.PRODUCTOS, 'integer', 'porcentaje_descuento', undefined, false, false, 0);
    await createAttribute(COLLECTIONS.PRODUCTOS, 'double', 'precio_promocional', undefined, false);
    await createAttribute(COLLECTIONS.PRODUCTOS, 'url', 'imagenes', undefined, false, true);

    // 3. MOVIMIENTOS (Kardex)
    await createCollection(COLLECTIONS.MOVIMIENTOS, "Movimientos Inventario");
    await createAttribute(COLLECTIONS.MOVIMIENTOS, 'string', 'producto_id', 50, true);
    await createAttribute(COLLECTIONS.MOVIMIENTOS, 'string', 'tipo', 20, true); // venta, compra, ajuste
    await createAttribute(COLLECTIONS.MOVIMIENTOS, 'integer', 'cantidad', undefined, true);
    await createAttribute(COLLECTIONS.MOVIMIENTOS, 'string', 'motivo', 255, false);
    await createAttribute(COLLECTIONS.MOVIMIENTOS, 'datetime', 'fecha', undefined, true);
    await createAttribute(COLLECTIONS.MOVIMIENTOS, 'string', 'usuario_id', 50, false);

    // 4. COMPRAS
    await createCollection(COLLECTIONS.COMPRAS, "Compras Proveedores");
    await createAttribute(COLLECTIONS.COMPRAS, 'string', 'proveedor_id', 50, true);
    await createAttribute(COLLECTIONS.COMPRAS, 'datetime', 'fecha_compra', undefined, true);
    await createAttribute(COLLECTIONS.COMPRAS, 'double', 'total', undefined, true);
    await createAttribute(COLLECTIONS.COMPRAS, 'string', 'estado_pago', 20, true);
    await createAttribute(COLLECTIONS.COMPRAS, 'string', 'factura_referencia', 50, false);
    await createAttribute(COLLECTIONS.COMPRAS, 'url', 'comprobante_url', undefined, false);
    await createAttribute(COLLECTIONS.COMPRAS, 'string', 'detalles_items', 5000, false); // JSON Stringified

    console.log("✅ Setup de Inventario Completado.");
}

main();
