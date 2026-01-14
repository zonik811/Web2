import { Databases, Permission, Role } from 'node-appwrite';

export async function createEmpresaConfig(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Empresa Config');

    const collection = await databases.createCollection(
        databaseId,
        'empresa_config',
        'Empresa Config',
        [Permission.read(Role.any()), Permission.write(Role.users())]
    );

    // Esperar un poco para que Appwrite procese
    await new Promise(resolve => setTimeout(resolve, 500));

    // Atributos
    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'nombreCompleto', 200, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'slogan', 200, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'telefono', 20, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'email', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'direccion', 200, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'ciudad', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'pais', 50, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'colorPrimario', 7, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'colorSecundario', 7, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'logo', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'whatsapp', 20, false);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);

    console.log('✅ Empresa Config creada');
    return collection;
}
