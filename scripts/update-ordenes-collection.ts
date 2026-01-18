import { Client, Databases } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = 'ordenes';

async function updateOrdenesCollection() {
    console.log('🔄 Actualizando colección ORDENES para soportar ventas POS...\n');

    try {
        // Atributos necesarios para ventas POS
        const attributesToAdd = [
            {
                key: 'turnoId',
                type: 'string',
                size: 255,
                required: false,
                description: 'ID del turno de caja (solo para ventas POS)'
            },
            {
                key: 'usuarioId',
                type: 'string',
                size: 255,
                required: false,
                description: 'ID del usuario que registró la venta'
            },
            {
                key: 'impuestos',
                type: 'double',
                required: false,
                description: 'Valor de impuestos/IVA'
            },
            {
                key: 'origen',
                type: 'string',
                size: 50,
                required: false,
                description: 'Origen de la orden: "pos", "web", "taller", etc.'
            },
            {
                key: 'clienteEmail',
                type: 'string',
                size: 255,
                required: false,
                description: 'Email del cliente'
            }
        ];

        for (const attr of attributesToAdd) {
            try {
                console.log(`⏳ Agregando atributo: ${attr.key}...`);

                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        COLLECTION_ID,
                        attr.key,
                        attr.size!,
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

                console.log(`✅ Atributo "${attr.key}" agregado exitosamente`);

                // Esperar un poco entre cada atributo para evitar errores de rate limit
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error: any) {
                if (error.code === 409) {
                    console.log(`⚠️  Atributo "${attr.key}" ya existe, continuando...`);
                } else {
                    console.error(`❌ Error agregando "${attr.key}":`, error.message);
                }
            }
        }

        console.log('\n✅ Actualización completada!');
        console.log('\n📝 Siguiente paso: Ejecuta el servidor de desarrollo y prueba una venta POS.');

    } catch (error) {
        console.error('❌ Error durante la actualización:', error);
        process.exit(1);
    }
}

updateOrdenesCollection();
