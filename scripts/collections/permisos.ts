import { Databases, Permission, Role } from 'node-appwrite';

export async function createPermisos(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Permisos');

    const collection = await databases.createCollection(
        databaseId,
        'permisos',
        'Permisos',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Datos del permiso
    await databases.createStringAttribute(databaseId, collection.$id, 'empleadoId', 100, true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'tipo', ['PERMISO', 'JUSTIFICACION', 'LICENCIA'], true);
    await databases.createStringAttribute(databaseId, collection.$id, 'subtipo', 100, false); // médico, personal, etc.

    // Fechas
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaInicio', 30, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaFin', 30, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'horaInicio', 10, false); // Para permisos parciales
    await databases.createStringAttribute(databaseId, collection.$id, 'horaFin', 10, false);

    // Descripción
    await databases.createStringAttribute(databaseId, collection.$id, 'motivo', 1000, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'adjunto', 100, false); // Storage ID

    // Estado y aprobación
    await databases.createEnumAttribute(databaseId, collection.$id, 'estado', ['PENDIENTE', 'APROBADO', 'RECHAZADO'], true);
    await databases.createStringAttribute(databaseId, collection.$id, 'aprobadoPor', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaAprobacion', 30, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'comentarios', 500, false);

    // Índices
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createIndex(databaseId, collection.$id, 'idx_empleadoId', 'key', ['empleadoId']);
    await databases.createIndex(databaseId, collection.$id, 'idx_estado', 'key', ['estado']);

    console.log('✅ Permisos creada con índices');
    return collection;
}
