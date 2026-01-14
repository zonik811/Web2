import { Databases, Permission, Role } from 'node-appwrite';

export async function createGastos(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Gastos');

    const collection = await databases.createCollection(
        databaseId,
        'gastos',
        'Gastos',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'categoria', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'concepto', 200, true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'monto', true);
    await databases.createStringAttribute(databaseId, collection.$id, 'metodoPago', 50, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'proveedor', 200, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fecha', 10, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'notas', 5000, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'creadoPor', 100, false);

    console.log('✅ Gastos creada');
    return collection;
}
