const { Client, Databases, Permission, Role } = require('node-appwrite');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_NAME = 'pago_compras';

async function createPagoComprasCollection() {
    try {
        console.log(`Checking if collection ${COLLECTION_NAME} exists...`);

        try {
            await databases.getCollection(DATABASE_ID, COLLECTION_NAME);
            console.log(`Collection ${COLLECTION_NAME} already exists.`);
        } catch (error) {
            console.log(`Creating collection ${COLLECTION_NAME}...`);
            await databases.createCollection(
                DATABASE_ID,
                COLLECTION_NAME,
                COLLECTION_NAME,
                [
                    Permission.read(Role.any()),
                    Permission.write(Role.any()), // Adjust as needed for security
                    Permission.update(Role.any()),
                    Permission.delete(Role.any()),
                ]
            );
            console.log(`Collection ${COLLECTION_NAME} created.`);
        }

        console.log(`Creating attributes for ${COLLECTION_NAME}...`);

        // Attribute definitions
        const attributes = [
            { key: 'compra_id', type: 'string', size: 50, required: true },
            { key: 'monto', type: 'double', required: true },
            { key: 'fecha_pago', type: 'datetime', required: true },
            { key: 'metodo_pago', type: 'string', size: 50, required: true },
            { key: 'referencia', type: 'string', size: 100, required: false },
            { key: 'notas', type: 'string', size: 1000, required: false },
        ];

        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(DATABASE_ID, COLLECTION_NAME, attr.key, attr.size, attr.required);
                } else if (attr.type === 'double') {
                    await databases.createFloatAttribute(DATABASE_ID, COLLECTION_NAME, attr.key, attr.required);
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(DATABASE_ID, COLLECTION_NAME, attr.key, attr.required);
                }
                console.log(`Attribute ${attr.key} created.`);
            } catch (error) {
                // Ignore if attribute already exists
                if (error.code === 409) {
                    console.log(`Attribute ${attr.key} already exists.`);
                } else {
                    console.error(`Error creating attribute ${attr.key}:`, error);
                }
            }
            // Small delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('Done.');

    } catch (error) {
        console.error('Error:', error);
    }
}

createPagoComprasCollection();
