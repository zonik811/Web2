import { Databases, Permission, Role } from 'node-appwrite';

export async function createAsistencias(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Asistencias');

    const collection = await databases.createCollection(
        databaseId,
        'asistencias',
        'Asistencias',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Atributos principales
    await databases.createStringAttribute(databaseId, collection.$id, 'empleadoId', 100, true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'tipo', ['ENTRADA', 'SALIDA'], true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaHora', 30, true); // ISO datetime

    // GPS (opcional - para futuro si admin marca desde móvil)
    await databases.createFloatAttribute(databaseId, collection.$id, 'latitud', false);
    await databases.createFloatAttribute(databaseId, collection.$id, 'longitud', false);

    // Control
    await databases.createStringAttribute(databaseId, collection.$id, 'marcadoPorAdminId', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'notas', 500, false);

    // Crear índices
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createIndex(databaseId, collection.$id, 'idx_empleadoId', 'key', ['empleadoId']);
    await databases.createIndex(databaseId, collection.$id, 'idx_fechaHora', 'key', ['fechaHora']);

    console.log('✅ Asistencias creada con índices');
    return collection;
}
