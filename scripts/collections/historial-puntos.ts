import { Databases, Permission, Role } from 'node-appwrite';

export async function createHistorialPuntos(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Historial Puntos');

    const collection = await databases.createCollection(
        databaseId,
        'historial_puntos',
        'Historial Puntos',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'clienteId', 100, true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'puntos', true);
    await databases.createStringAttribute(databaseId, collection.$id, 'motivo', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'referenciaId', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fecha', 10, true);

    console.log('✅ Historial Puntos creada');
    return collection;
}
