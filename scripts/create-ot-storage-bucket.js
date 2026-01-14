/**
 * Script para crear el bucket de Storage para imágenes de órdenes de trabajo
 * Ejecutar con: node scripts/create-ot-storage-bucket.js
 */

const sdk = require('node-appwrite');

const client = new sdk.Client();
const storage = new sdk.Storage(client);

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6961464c000755a12232')
    .setKey('standard_e6bd013a55aeda7aa2bd038874de9594bca921b3c57a1fc0ded8e32fa1373f4a4b92c56011b6e9e661036f87d82e462dd3298f7e6c450da2ab7e0e6de13f20ee96eb8e1cbd020099f00e667d10605496e8c5696a48dc822f9f2c56ae00df8e98f1a0079b48ec0544a600ae58775dec285787758f6d721176af8f96d14b37c180');

async function crearBucket() {
    console.log('📦 Creando bucket para imágenes de órdenes de trabajo...\n');

    try {
        const bucket = await storage.createBucket(
            'ordenes_trabajo_images',
            'Ordenes de Trabajo - Imagenes',
            [
                sdk.Permission.read(sdk.Role.any()),
                sdk.Permission.create(sdk.Role.users()),
                sdk.Permission.update(sdk.Role.users()),
                sdk.Permission.delete(sdk.Role.users()),
            ],
            false, // fileSecurity
            true,  // enabled
            10485760, // maxFileSize (10MB)
            ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'], // allowedFileExtensions
            'none', // compression
            false, // encryption
            true   // antivirus
        );

        console.log('✅ Bucket creado exitosamente!');
        console.log(`   ID: ${bucket.$id}`);
        console.log(`   Nombre: ${bucket.name}`);
        console.log('\n📝 Agrega este ID a tu archivo .env.local:');
        console.log(`   NEXT_PUBLIC_OT_IMAGES_BUCKET_ID="${bucket.$id}"`);

    } catch (error) {
        if (error.code === 409) {
            console.log('⚠️  El bucket ya existe');
            console.log('   Continúa con el ID: ordenes_trabajo_images');
        } else {
            console.error('❌ Error creando bucket:', error.message);
        }
    }
}

crearBucket().catch(console.error);
