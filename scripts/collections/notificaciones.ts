import { Databases, Permission, Role } from 'node-appwrite';

export async function createNotificaciones(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Notificaciones');

    const collection = await databases.createCollection(
        databaseId,
        'notificaciones',
        'Notificaciones',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'usuarioId', 100, true); // Appwrite User ID
    await databases.createEnumAttribute(databaseId, collection.$id, 'tipo', ['info', 'exito', 'advertencia', 'error'], true);
    await databases.createStringAttribute(databaseId, collection.$id, 'titulo', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'mensaje', 1000, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'icono', 50, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'url', 300, false); // URL a donde redirigir al hacer clic
    await databases.createStringAttribute(databaseId, collection.$id, 'referenciaId', 100, false); // ID de cita/orden relacionada
    await databases.createStringAttribute(databaseId, collection.$id, 'referenciaTipo', 50, false); // 'cita', 'orden', 'pago'
    await databases.createBooleanAttribute(databaseId, collection.$id, 'leida', false, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaCreacion', 25, true); // ISO datetime
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaLeida', 25, false);

    console.log('✅ Notificaciones creada');
    return collection;
}
