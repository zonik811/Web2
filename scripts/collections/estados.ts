import { Databases, Permission, Role } from 'node-appwrite';

export async function createEstados(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Estados');

    const collection = await databases.createCollection(
        databaseId,
        'estados',
        'Estados',
        [Permission.read(Role.any()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'codigo', 50, true); // 'pendiente', 'confirmada', etc.
    await databases.createStringAttribute(databaseId, collection.$id, 'tipo', 50, true); // 'cita', 'orden', 'pago', 'compra'
    await databases.createStringAttribute(databaseId, collection.$id, 'descripcion', 300, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'color', 20, false); // Color hex para UI
    await databases.createStringAttribute(databaseId, collection.$id, 'icono', 50, false);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'orden', false);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'esFinal', false); // Si es estado final (completada, cancelada)
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);

    console.log('✅ Estados creada');
    return collection;
}
