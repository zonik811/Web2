import { Databases, Permission, Role } from 'node-appwrite';

export async function createCitas(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Citas');

    const collection = await databases.createCollection(
        databaseId,
        'citas',
        'Citas',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'servicioId', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'categoriaSeleccionada', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'clienteId', 100, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'clienteNombre', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'clienteTelefono', 20, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'clienteEmail', 100, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'direccion', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'ciudad', 100, true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'tipoPropiedad', ['casa', 'apartamento', 'oficina', 'local'], true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'metrosCuadrados', false);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'habitaciones', false);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'banos', false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fechaCita', 10, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'horaCita', 5, true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'duracionEstimada', true);
    await databases.createStringAttribute(databaseId, collection.$id, 'empleadosAsignados', 5000, false, undefined, true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'horasTrabajadas', false);
    await databases.createEnumAttribute(databaseId, collection.$id, 'estado', ['pendiente', 'confirmada', 'en-progreso', 'completada', 'cancelada'], true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'precioCliente', true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'precioAcordado', true);
    await databases.createEnumAttribute(databaseId, collection.$id, 'metodoPago', ['efectivo', 'transferencia', 'nequi', 'bancolombia', 'por_cobrar'], true);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'pagadoPorCliente', false);
    await databases.createStringAttribute(databaseId, collection.$id, 'detallesAdicionales', 5000, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'notasInternas', 5000, false);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'calificacionCliente', false);
    await databases.createStringAttribute(databaseId, collection.$id, 'resenaCliente', 5000, false);
    await databases.createDatetimeAttribute(databaseId, collection.$id, 'completedAt', false);

    console.log('✅ Citas creada');
    return collection;
}
