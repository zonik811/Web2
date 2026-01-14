import { Databases, Permission, Role } from 'node-appwrite';

export async function createUserProfile(databases: Databases, databaseId: string) {
    console.log('📋 Creando: User Profile');

    const collection = await databases.createCollection(
        databaseId,
        'user_profile',
        'User Profile',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'userId', 100, true); // Appwrite Auth User ID
    await databases.createEnumAttribute(databaseId, collection.$id, 'rol', ['admin', 'empleado', 'cliente'], true);
    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'apellido', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'telefono', 20, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'avatar', 100, false); // Storage ID
    await databases.createStringAttribute(databaseId, collection.$id, 'permisos', 5000, false, undefined, true); // Array de permisos específicos
    await databases.createStringAttribute(databaseId, collection.$id, 'departamento', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'cargo', 100, false);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);
    await databases.createStringAttribute(databaseId, collection.$id, 'ultimoAcceso', 25, false); // ISO datetime
    await databases.createStringAttribute(databaseId, collection.$id, 'configuracion', 5000, false); // JSON con preferencias del usuario

    console.log('✅ User Profile creada');
    return collection;
}
