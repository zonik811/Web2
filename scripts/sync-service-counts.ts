
import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

const databases = new Databases(client);
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const EMPLEADOS_COLLECTION_ID = 'empleados';
const CITAS_COLLECTION_ID = 'citas';

async function recalcularServiciosEmpleado(empleadoId: string, nombre: string) {
    console.log(`🔄 Procesando: ${nombre} (${empleadoId})`);

    // Contar citas completadas
    const citasCompletadas = await databases.listDocuments(
        DATABASE_ID,
        CITAS_COLLECTION_ID,
        [
            Query.equal('estado', 'completada'),
            Query.contains('empleadosAsignados', empleadoId)
        ]
    );

    const count = citasCompletadas.total;

    // Actualizar empleado
    await databases.updateDocument(
        DATABASE_ID,
        EMPLEADOS_COLLECTION_ID,
        empleadoId,
        { totalServicios: count }
    );

    console.log(`✅ Actualizado: ${count} servicios`);
}

async function main() {
    console.log('🚀 Iniciando sincronización de contadores de servicios...');

    try {
        let hasMore = true;
        let offset = 0;

        while (hasMore) {
            const empleados = await databases.listDocuments(
                DATABASE_ID,
                EMPLEADOS_COLLECTION_ID,
                [Query.limit(25), Query.offset(offset)]
            );

            if (empleados.documents.length === 0) {
                hasMore = false;
                break;
            }

            for (const empleado of empleados.documents) {
                await recalcularServiciosEmpleado(empleado.$id, empleado.nombre);
            }

            offset += 25;
        }

        console.log('✨ Sincronización completada exitosamente.');

    } catch (error) {
        console.error('❌ Error fatal:', error);
    }
}

main();
