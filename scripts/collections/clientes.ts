import { Databases, Permission, Role } from 'node-appwrite';

export async function createClientes(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Clientes');

    const collection = await databases.createCollection(
        databaseId,
        'clientes',
        'Clientes',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'telefono', 20, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'email', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'direccion', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'ciudad', 100, true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'tipoCliente', ['residencial', 'comercial'], true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'frecuenciaPreferida', ['unica', 'semanal', 'quincenal', 'mensual'], false);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'totalServicios', false);
    await databases.createFloatAttribute(databaseId, collection.$id, 'totalGastado', false);
    await databases.createFloatAttribute(databaseId, collection.$id, 'calificacionPromedio', false);
    await databases.createStringAttribute(databaseId, collection.$id, 'notasImportantes', 5000, false);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'puntosAcumulados', false);
    await databases.createStringAttribute(databaseId, collection.$id, 'nivelFidelidad', 20, false);

    console.log('✅ Clientes creada');
    return collection;
}
