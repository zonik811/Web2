import { Databases, Permission, Role } from 'node-appwrite';

export async function createHorariosEmpleado(databases: Databases, databaseId: string) {
    console.log('📅 Creando: Horarios Empleado');

    const collection = await databases.createCollection(
        databaseId,
        'horarios_empleado',
        'Horarios Empleado',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Empleado al que aplica
    await databases.createStringAttribute(databaseId, collection.$id, 'empleadoId', 100, true);

    // Horarios
    await databases.createStringAttribute(databaseId, collection.$id, 'horarioEntrada', 10, true); // HH:mm
    await databases.createStringAttribute(databaseId, collection.$id, 'horarioSalida', 10, true);

    // Días laborables (JSON array de strings)
    await databases.createStringAttribute(databaseId, collection.$id, 'diasLaborables', 500, false); // JSON

    // Vigencia
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaInicio', 30, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaFin', 30, false); // null = indefinido
    await databases.createBooleanAttribute(databaseId, collection.$id, 'activo', true);

    // Notas
    await databases.createStringAttribute(databaseId, collection.$id, 'notas', 500, false);

    // Índices
    await new Promise(resolve => setTimeout(resolve, 1000));
    await databases.createIndex(databaseId, collection.$id, 'idx_empleadoId', 'key', ['empleadoId']);
    await databases.createIndex(databaseId, collection.$id, 'idx_activo', 'key', ['activo']);

    console.log('✅ Horarios Empleado creada con índices');
    return collection;
}
