import { Databases, Permission, Role, ID } from 'node-appwrite';

export async function createConfiguracionAsistencia(databases: Databases, databaseId: string) {
    console.log('📋 Creando: Configuración Asistencia');

    const collection = await databases.createCollection(
        databaseId,
        'configuracion_asistencia',
        'Configuración Asistencia',
        [Permission.read(Role.users()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    await databases.createStringAttribute(databaseId, collection.$id, 'horarioEntrada', 10, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'horarioSalida', 10, true);
    await databases.createIntegerAttribute(databaseId, collection.$id, 'minutosTolerancia', true);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'requiereJustificacion', false);

    console.log('✅ Configuración Asistencia creada');

    // Crear documento inicial con valores por defecto
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
        await databases.createDocument(
            databaseId,
            collection.$id,
            'config', // ID fijo
            {
                horarioEntrada: '08:00',
                horarioSalida: '18:00',
                minutosTolerancia: 15,
                requiereJustificacion: false
            }
        );
        console.log('✅ Documento de configuración inicial creado');
    } catch (error: any) {
        console.log('ℹ️  Documento de config ya existe o error:', error.message);
    }

    return collection;
}
