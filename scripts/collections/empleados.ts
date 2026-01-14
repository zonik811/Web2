import { Databases, Permission, Role } from 'node-appwrite';

export async function createEmpleados(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Empleados');

    const collection = await databases.createCollection(
        databaseId,
        'empleados',
        'Empleados',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'nombre', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'apellido', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'documento', 50, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'telefono', 20, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'email', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'direccion', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaNacimiento', 10, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaContratacion', 10, true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'cargo', ['limpiador', 'supervisor', 'especialista'], true);
    await databases.createStringAttribute(databaseId, collection.$id, 'especialidades', 5000, false, undefined, true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'tarifaPorHora', true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'modalidadPago', ['hora', 'servicio', 'fijo_mensual'], true);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);
    await databases.createStringAttribute(databaseId, collection.$id, 'foto', 100, false);
    await databases.createFloatAttribute(databaseId, collection.$id, 'calificacionPromedio', false);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'totalServicios', false);

    console.log('✅ Empleados creada');
    return collection;
}
