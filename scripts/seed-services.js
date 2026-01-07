const { Client, Databases, ID } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('695e8be5003357919803')
    .setKey('standard_ddd48759fd28e61a5f38817bd6ca59324a3b94bb7128d42564c9fee3b24a37e450aa7c94ef2bed84256e6ee0ef95efc188eb92f9f1ca23dc9b4d8abc03437c15f30f501e884fd58450466df8684a11e5728adfbabe75fce1f2ac2b8bda5d6a8f130c37d4af02380b5644b700a664a693641cb9b25f910bed3a3d227dfcbf4a1f');

const databases = new Databases(client);
const DATABASE_ID = '695e8da400267ef69bae';

// Servicios de ejemplo (ajustados a los atributos que creaste)
const serviciosEjemplo = [
    {
        nombre: 'Limpieza Residencial Básica',
        slug: 'limpieza-residencial-basica',
        descripcion: 'Servicio completo de limpieza para casas y apartamentos. Incluye limpieza de pisos, baños, cocina, habitaciones y áreas comunes. Personal capacitado con productos profesionales.',
        descripcionCorta: 'Limpieza completa para tu hogar',
        categoria: 'residencial',
        precioBase: 50000,
        unidadPrecio: 'servicio',
        duracionEstimada: 180,
        caracteristicas: ['Limpieza de pisos', 'Baños completos', 'Cocina', 'Habitaciones', 'Áreas comunes'],
        requierePersonal: 1,
    },
    {
        nombre: 'Limpieza de Oficinas',
        slug: 'limpieza-oficinas',
        descripcion: 'Servicio especializado para espacios comerciales y oficinas. Limpieza de escritorios, áreas comunes, baños, cocinas y mantenimiento general.',
        descripcionCorta: 'Mantén tu oficina impecable',
        categoria: 'comercial',
        precioBase: 80000,
        unidadPrecio: 'servicio',
        duracionEstimada: 240,
        caracteristicas: ['Escritorios y mobiliario', 'Baños', 'Áreas comunes', 'Pisos', 'Ventanas'],
        requierePersonal: 2,
    },
    {
        nombre: 'Limpieza Profunda',
        slug: 'limpieza-profunda',
        descripcion: 'Limpieza exhaustiva y detallada de todos los espacios. Incluye limpieza detrás de muebles, electrodomésticos, ventanas, techos y áreas de difícil acceso.',
        descripcionCorta: 'Limpieza exhaustiva y detallada',
        categoria: 'especializado',
        precioBase: 150000,
        unidadPrecio: 'servicio',
        duracionEstimada: 360,
        caracteristicas: ['Limpieza detrás de muebles', 'Electrodomésticos', 'Ventanas completas', 'Techos y paredes', 'Áreas difíciles'],
        requierePersonal: 2,
    },
];

async function crearServiciosEjemplo() {
    console.log('🧹 Creando servicios de ejemplo en Appwrite...\n');

    try {
        for (const servicio of serviciosEjemplo) {
            console.log(`📝 Creando: ${servicio.nombre}`);

            await databases.createDocument(
                DATABASE_ID,
                'servicios',
                ID.unique(),
                servicio
            );

            console.log(`   ✅ Creado exitosamente\n`);
        }

        console.log('🎉 ¡Todos los servicios de ejemplo han sido creados!\n');
        console.log('💡 Próximos pasos:');
        console.log('   1. Crea un usuario admin en Appwrite Auth (Email + Password)');
        console.log('   2. Accede a http://localhost:3000/login');
        console.log('   3. ¡Empieza a usar la aplicación!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 404) {
            console.error('\n⚠️  La colección "servicios" no existe o el ID es incorrecto.');
        } else if (error.code === 401) {
            console.error('\n⚠️  API Key inválida o sin permisos.');
        } else {
            console.error('\n💡 Verifica que todos los atributos requeridos estén presentes.');
        }
        process.exit(1);
    }
}

crearServiciosEjemplo();
