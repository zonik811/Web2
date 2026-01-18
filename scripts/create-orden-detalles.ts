import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'orden_detalles';

async function createOrdenDetallesCollection() {
    console.log('🔄 Creando colección ORDEN_DETALLES para análisis de ventas...\n');

    try {
        // Create collection
        console.log('⏳ Creando colección...');
        await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'Orden Detalles',
            undefined,
            false // document security disabled
        );
        console.log('✅ Colección creada exitosamente\n');

        // Wait a bit
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Create attributes
        const attributes = [
            { key: 'ordenId', type: 'string', size: 255, required: true, desc: 'ID de la orden padre' },
            { key: 'productoId', type: 'string', size: 255, required: true, desc: 'ID del producto' },
            { key: 'productoNombre', type: 'string', size: 255, required: true, desc: 'Nombre del producto' },
            { key: 'cantidad', type: 'integer', required: true, desc: 'Cantidad vendida' },
            { key: 'precioUnitario', type: 'double', required: true, desc: 'Precio unitario al momento de la venta' },
            { key: 'subtotal', type: 'double', required: true, desc: 'Subtotal de esta línea (cantidad * precio)' }
        ];

        console.log('⏳ Creando atributos...');
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.size!,
                        attr.required
                    );
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.required
                    );
                } else if (attr.type === 'double') {
                    await databases.createFloatAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.required
                    );
                }
                console.log(`  ✅ ${attr.key}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error: any) {
                if (error.code === 409) {
                    console.log(`  ⚠️  ${attr.key} ya existe`);
                } else {
                    throw error;
                }
            }
        }

        // Create index for ordenId
        console.log('\n⏳ Creando índice por ordenId...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
            await databases.createIndex(
                DATABASE_ID,
                COLLECTION_ID,
                'ordenId_idx',
                'key',
                ['ordenId'],
                ['ASC']
            );
            console.log('✅ Índice creado');
        } catch (error: any) {
            if (error.code === 409) {
                console.log('⚠️  Índice ya existe');
            } else {
                console.log('⚠️  No se pudo crear índice (no crítico)');
            }
        }

        console.log('\n✅ Colección ORDEN_DETALLES lista para usar!');
        console.log('📊 Ahora podrás hacer análisis detallados de productos vendidos.');

    } catch (error: any) {
        if (error.code === 409) {
            console.log('⚠️  La colección ya existe. Intentando agregar atributos faltantes...\n');

            // Try to add missing attributes
            const attributes = [
                { key: 'ordenId', type: 'string', size: 255, required: true },
                { key: 'productoId', type: 'string', size: 255, required: true },
                { key: 'productoNombre', type: 'string', size: 255, required: true },
                { key: 'cantidad', type: 'integer', required: true },
                { key: 'precioUnitario', type: 'double', required: true },
                { key: 'subtotal', type: 'double', required: true }
            ];

            for (const attr of attributes) {
                try {
                    if (attr.type === 'string') {
                        await databases.createStringAttribute(
                            DATABASE_ID,
                            COLLECTION_ID,
                            attr.key,
                            attr.size!,
                            attr.required
                        );
                    } else if (attr.type === 'integer') {
                        await databases.createIntegerAttribute(
                            DATABASE_ID,
                            COLLECTION_ID,
                            attr.key,
                            attr.required
                        );
                    } else if (attr.type === 'double') {
                        await databases.createFloatAttribute(
                            DATABASE_ID,
                            COLLECTION_ID,
                            attr.key,
                            attr.required
                        );
                    }
                    console.log(`✅ Agregado: ${attr.key}`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (e: any) {
                    if (e.code === 409) {
                        console.log(`⚠️  ${attr.key} ya existe`);
                    } else {
                        console.error(`❌ Error con ${attr.key}:`, e.message);
                    }
                }
            }
        } else {
            console.error('❌ Error:', error);
            process.exit(1);
        }
    }
}

createOrdenDetallesCollection();
