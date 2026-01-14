import { ID, Permission, Role, Databases } from 'node-appwrite';

export async function createPedidosCatalogo(databases: Databases, databaseId: string) {
    console.log('📦 Creando: Pedidos del Catálogo');

    const collection = await databases.createCollection(
        databaseId,
        'pedidos_catalogo',
        'Pedidos del Catálogo',
        [Permission.read(Role.any()), Permission.write(Role.users())]
    );

    await new Promise(resolve => setTimeout(resolve, 500));

    // Identificación
    await databases.createStringAttribute(databaseId, collection.$id, 'numero_pedido', 50, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'fecha_creacion', 50, true);

    // Cliente
    await databases.createStringAttribute(databaseId, collection.$id, 'cliente_id', 50, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'cliente_nombre', 200, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'cliente_telefono', 20, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'cliente_email', 100, false);

    // Items (JSON array)
    await databases.createStringAttribute(databaseId, collection.$id, 'items', 50000, true);

    // Totales
    await databases.createFloatAttribute(databaseId, collection.$id, 'subtotal', true);
    await databases.createFloatAttribute(databaseId, collection.$id, 'descuento', true, 0);
    await databases.createFloatAttribute(databaseId, collection.$id, 'iva', false);
    await databases.createFloatAttribute(databaseId, collection.$id, 'total', true);

    // Estado
    await databases.createEnumAttribute(
        databaseId,
        collection.$id,
        'estado',
        ['creado', 'confirmado', 'pagado', 'enviado', 'completado', 'cancelado'],
        true
    );

    // Fechas de seguimiento
    await databases.createStringAttribute(databaseId, collection.$id, 'fecha_confirmacion', 50, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fecha_pago', 50, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fecha_envio', 50, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'fecha_completado', 50, false);

    // Pagos
    await databases.createStringAttribute(databaseId, collection.$id, 'metodo_pago_id', 50, false);
    await databases.createFloatAttribute(databaseId, collection.$id, 'monto_pagado', true, 0);
    await databases.createFloatAttribute(databaseId, collection.$id, 'saldo_pendiente', true);

    // Detalles
    await databases.createStringAttribute(databaseId, collection.$id, 'notas', 2000, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'mensaje_cliente', 2000, false);
    await databases.createStringAttribute(databaseId, collection.$id, 'direccion_envio', 500, false);

    // Tracking
    await databases.createStringAttribute(databaseId, collection.$id, 'creado_por', 50, true);
    await databases.createStringAttribute(databaseId, collection.$id, 'modificado_por', 50, false);
    await databases.createBooleanAttribute(databaseId, collection.$id, 'stock_descontado', true, false);

    console.log('✅ Pedidos del Catálogo creada');
    return collection;
}
