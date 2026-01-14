/**
 * Script para crear todas las colecciones de Órdenes de Trabajo en Appwrite
 * Ejecutar con: node scripts/setup-ot-collections.js
 */

const sdk = require('node-appwrite');

// Configuración
const client = new sdk.Client();
const databases = new sdk.Databases(client);

client
    .setEndpoint('https://nyc.cloud.appwrite.io/v1')
    .setProject('6961464c000755a12232')
    .setKey('standard_e6bd013a55aeda7aa2bd038874de9594bca921b3c57a1fc0ded8e32fa1373f4a4b92c56011b6e9e661036f87d82e462dd3298f7e6c450da2ab7e0e6de13f20ee96eb8e1cbd020099f00e667d10605496e8c5696a48dc822f9f2c56ae00df8e98f1a0079b48ec0544a600ae58775dec285787758f6d721176af8f96d14b37c180');

const DATABASE_ID = '69614665000e9d2785fa';

// Colecciones a crear
const collections = [
    {
        id: 'vehiculos',
        name: 'Vehiculos',
        attributes: [
            { key: 'clienteId', type: 'string', size: 255, required: true },
            { key: 'marca', type: 'string', size: 100, required: true },
            { key: 'modelo', type: 'string', size: 100, required: true },
            { key: 'ano', type: 'integer', required: true },  // Cambiado de "año" a "ano" por limitación Appwrite
            { key: 'placa', type: 'string', size: 20, required: true },
            { key: 'vin', type: 'string', size: 50, required: false },
            { key: 'tipoVehiculo', type: 'enum', elements: ['CAMION', 'PICKUP', 'BUS', 'OTRO'], required: true },
            { key: 'tipoCombustible', type: 'enum', elements: ['DIESEL', 'GASOLINA', 'HIBRIDO'], required: true },
            { key: 'kilometraje', type: 'integer', required: true },
            { key: 'color', type: 'string', size: 50, required: false },
            { key: 'observaciones', type: 'string', size: 1000, required: false },
            { key: 'activo', type: 'boolean', required: true, default: true },
            { key: 'createdAt', type: 'datetime', required: true },
            { key: 'updatedAt', type: 'datetime', required: true },
        ]
    },
    {
        id: 'ordenes_trabajo',
        name: 'Ordenes de Trabajo',
        attributes: [
            { key: 'numeroOrden', type: 'string', size: 50, required: true },
            { key: 'clienteId', type: 'string', size: 255, required: true },
            { key: 'vehiculoId', type: 'string', size: 255, required: true },
            { key: 'fechaIngreso', type: 'datetime', required: true },
            { key: 'fechaEstimadaEntrega', type: 'datetime', required: true },
            { key: 'fechaRealEntrega', type: 'datetime', required: false },
            { key: 'estado', type: 'enum', elements: ['COTIZANDO', 'ACEPTADA', 'EN_PROCESO', 'COMPLETADA', 'ENTREGADA', 'CANCELADA'], required: true },
            { key: 'prioridad', type: 'enum', elements: ['NORMAL', 'URGENTE'], required: true },
            { key: 'motivoIngreso', type: 'string', size: 1000, required: true },
            { key: 'diagnosticoInicial', type: 'string', size: 2000, required: false },
            { key: 'cotizacionAprobada', type: 'boolean', required: true, default: false },
            { key: 'fechaCotizacion', type: 'datetime', required: false },
            { key: 'fechaAprobacion', type: 'datetime', required: false },
            { key: 'subtotal', type: 'float', required: true, default: 0 },
            { key: 'aplicarIva', type: 'boolean', required: true, default: true },
            { key: 'porcentajeIva', type: 'float', required: true, default: 19 },
            { key: 'impuestos', type: 'float', required: true, default: 0 },
            { key: 'total', type: 'float', required: true, default: 0 },
            { key: 'tieneGarantia', type: 'boolean', required: true, default: false },
            { key: 'diasGarantia', type: 'integer', required: false },
            { key: 'fechaVencimientoGarantia', type: 'datetime', required: false },
            { key: 'createdAt', type: 'datetime', required: true },
            { key: 'updatedAt', type: 'datetime', required: true },
        ]
    },
    {
        id: 'ot_procesos',
        name: 'OT Procesos',
        attributes: [
            { key: 'ordenTrabajoId', type: 'string', size: 255, required: true },
            { key: 'nombre', type: 'string', size: 200, required: true },
            { key: 'descripcion', type: 'string', size: 1000, required: true },
            { key: 'orden', type: 'integer', required: true },
            { key: 'estado', type: 'enum', elements: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'CANCELADO'], required: true },
            { key: 'tecnicoResponsableId', type: 'string', size: 255, required: true },
            { key: 'tecnicoAuxiliarId', type: 'string', size: 255, required: false },
            { key: 'fechaInicio', type: 'datetime', required: false },
            { key: 'fechaFin', type: 'datetime', required: false },
            { key: 'horasEstimadas', type: 'float', required: true },
            { key: 'horasReales', type: 'float', required: false },
            { key: 'costoManoObra', type: 'float', required: true, default: 0 },
            { key: 'createdAt', type: 'datetime', required: true },
            { key: 'updatedAt', type: 'datetime', required: true },
        ]
    },
    {
        id: 'ot_actividades',
        name: 'OT Actividades',
        attributes: [
            { key: 'procesoId', type: 'string', size: 255, required: true },
            { key: 'ordenTrabajoId', type: 'string', size: 255, required: true },
            { key: 'descripcion', type: 'string', size: 500, required: true },
            { key: 'notas', type: 'string', size: 2000, required: false },
            { key: 'empleadoId', type: 'string', size: 255, required: true },
            { key: 'fechaHora', type: 'datetime', required: true },
            { key: 'horasTrabajadas', type: 'float', required: true },
            { key: 'imagenes', type: 'string', size: 10000, required: false, array: true },
            { key: 'createdAt', type: 'datetime', required: true },
        ]
    },
    {
        id: 'ot_repuestos',
        name: 'OT Repuestos',
        attributes: [
            { key: 'ordenTrabajoId', type: 'string', size: 255, required: true },
            { key: 'procesoId', type: 'string', size: 255, required: true },
            { key: 'repuestoId', type: 'string', size: 255, required: true },
            { key: 'nombreRepuesto', type: 'string', size: 200, required: true },
            { key: 'cantidad', type: 'integer', required: true },
            { key: 'precioUnitario', type: 'float', required: true },
            { key: 'subtotal', type: 'float', required: true },
            { key: 'empleadoQueSolicito', type: 'string', size: 255, required: true },
            { key: 'fechaUso', type: 'datetime', required: true },
            { key: 'createdAt', type: 'datetime', required: true },
        ]
    },
    {
        id: 'ot_pruebas',
        name: 'OT Pruebas',
        attributes: [
            { key: 'procesoId', type: 'string', size: 255, required: true },
            { key: 'ordenTrabajoId', type: 'string', size: 255, required: true },
            { key: 'tipoPrueba', type: 'string', size: 200, required: true },
            { key: 'resultado', type: 'enum', elements: ['APROBADA', 'FALLIDA', 'PENDIENTE'], required: true },
            { key: 'observaciones', type: 'string', size: 2000, required: true },
            { key: 'imagenes', type: 'string', size: 10000, required: false, array: true },
            { key: 'videos', type: 'string', size: 10000, required: false, array: true },
            { key: 'tecnicoId', type: 'string', size: 255, required: true },
            { key: 'fechaHora', type: 'datetime', required: true },
            { key: 'createdAt', type: 'datetime', required: true },
        ]
    },
    {
        id: 'ot_checklist_vehiculo',
        name: 'OT Checklist Vehiculo',
        attributes: [
            { key: 'ordenTrabajoId', type: 'string', size: 255, required: true },
            { key: 'tipo', type: 'enum', elements: ['RECEPCION', 'ENTREGA'], required: true },
            { key: 'estadoLlantas', type: 'string', size: 200, required: true },
            { key: 'nivelCombustible', type: 'integer', required: true },
            { key: 'kilometraje', type: 'integer', required: true },
            { key: 'rayonesNotados', type: 'string', size: 1000, required: true },
            { key: 'objetosValor', type: 'string', size: 500, required: true },
            { key: 'estadoCarroceria', type: 'string', size: 500, required: true },
            { key: 'estadoInterior', type: 'string', size: 500, required: true },
            { key: 'lucesOperativas', type: 'boolean', required: true },
            { key: 'frenosOperativos', type: 'boolean', required: true },
            { key: 'observacionesGenerales', type: 'string', size: 2000, required: false },
            { key: 'fotosVehiculo', type: 'string', size: 10000, required: true, array: true },
            { key: 'firmaClienteUrl', type: 'string', size: 500, required: false },
            { key: 'nombreClienteFirma', type: 'string', size: 200, required: true },
            { key: 'empleadoInspectorId', type: 'string', size: 255, required: true },
            { key: 'fechaHora', type: 'datetime', required: true },
            { key: 'createdAt', type: 'datetime', required: true },
        ]
    },
    {
        id: 'ot_autorizaciones',
        name: 'OT Autorizaciones',
        attributes: [
            { key: 'ordenTrabajoId', type: 'string', size: 255, required: true },
            { key: 'procesoId', type: 'string', size: 255, required: false },
            { key: 'descripcionProblema', type: 'string', size: 1000, required: true },
            { key: 'trabajoAdicionalRequerido', type: 'string', size: 1000, required: true },
            { key: 'urgente', type: 'boolean', required: true },
            { key: 'costoEstimadoRepuestos', type: 'float', required: true },
            { key: 'costoEstimadoManoObra', type: 'float', required: true },
            { key: 'costoTotal', type: 'float', required: true },
            { key: 'estado', type: 'enum', elements: ['PENDIENTE', 'APROBADA', 'RECHAZADA'], required: true },
            { key: 'solicitadoPor', type: 'string', size: 255, required: true },
            { key: 'fechaSolicitud', type: 'datetime', required: true },
            { key: 'fechaRespuesta', type: 'datetime', required: false },
            { key: 'respuestaPor', type: 'string', size: 200, required: false },
            { key: 'motivoRechazo', type: 'string', size: 500, required: false },
            { key: 'fotosProblema', type: 'string', size: 10000, required: false, array: true },
            { key: 'createdAt', type: 'datetime', required: true },
            { key: 'updatedAt', type: 'datetime', required: true },
        ]
    },
    {
        id: 'ot_solicitudes_repuestos',
        name: 'OT Solicitudes Repuestos',
        attributes: [
            { key: 'ordenTrabajoId', type: 'string', size: 255, required: true },
            { key: 'procesoId', type: 'string', size: 255, required: true },
            { key: 'nombreRepuesto', type: 'string', size: 200, required: true },
            { key: 'codigoReferencia', type: 'string', size: 100, required: false },
            { key: 'descripcion', type: 'string', size: 500, required: true },
            { key: 'cantidad', type: 'integer', required: true },
            { key: 'urgente', type: 'boolean', required: true },
            { key: 'estado', type: 'enum', elements: ['SOLICITADO', 'PEDIDO', 'RECIBIDO', 'CANCELADO'], required: true },
            { key: 'proveedorId', type: 'string', size: 255, required: false },
            { key: 'nombreProveedor', type: 'string', size: 200, required: false },
            { key: 'costoEstimado', type: 'float', required: false },
            { key: 'costoReal', type: 'float', required: false },
            { key: 'fechaSolicitud', type: 'datetime', required: true },
            { key: 'fechaPedido', type: 'datetime', required: false },
            { key: 'fechaRecepcion', type: 'datetime', required: false },
            { key: 'fechaEstimadaLlegada', type: 'datetime', required: false },
            { key: 'solicitadoPor', type: 'string', size: 255, required: true },
            { key: 'pedidoPor', type: 'string', size: 255, required: false },
            { key: 'observaciones', type: 'string', size: 1000, required: false },
            { key: 'createdAt', type: 'datetime', required: true },
            { key: 'updatedAt', type: 'datetime', required: true },
        ]
    },
    {
        id: 'ot_plantillas_procesos',
        name: 'OT Plantillas Procesos',
        attributes: [
            { key: 'nombre', type: 'string', size: 200, required: true },
            { key: 'descripcion', type: 'string', size: 1000, required: true },
            { key: 'procesos', type: 'string', size: 50000, required: true }, // JSON string
            { key: 'costoEstimadoTotal', type: 'float', required: true },
            { key: 'vecesUsada', type: 'integer', required: true, default: 0 },
            { key: 'activa', type: 'boolean', required: true, default: true },
            { key: 'createdBy', type: 'string', size: 255, required: true },
            { key: 'createdAt', type: 'datetime', required: true },
            { key: 'updatedAt', type: 'datetime', required: true },
        ]
    },
];

async function createCollection(collectionData) {
    try {
        console.log(`\n📦 Creando colección: ${collectionData.name} (${collectionData.id})`);

        // Crear la colección
        const collection = await databases.createCollection(
            DATABASE_ID,
            collectionData.id,
            collectionData.name,
            [
                sdk.Permission.read(sdk.Role.any()),
                sdk.Permission.create(sdk.Role.users()),
                sdk.Permission.update(sdk.Role.users()),
                sdk.Permission.delete(sdk.Role.users()),
            ]
        );

        console.log(`✅ Colección creada: ${collection.name}`);

        // Crear atributos
        for (const attr of collectionData.attributes) {
            try {
                console.log(`  ➕ Creando atributo: ${attr.key} (${attr.type})`);

                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        DATABASE_ID,
                        collectionData.id,
                        attr.key,
                        attr.size,
                        attr.required,
                        attr.default,
                        attr.array || false
                    );
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        DATABASE_ID,
                        collectionData.id,
                        attr.key,
                        attr.required,
                        attr.min,
                        attr.max,
                        attr.default,
                        attr.array || false
                    );
                } else if (attr.type === 'float') {
                    await databases.createFloatAttribute(
                        DATABASE_ID,
                        collectionData.id,
                        attr.key,
                        attr.required,
                        attr.min,
                        attr.max,
                        attr.default,
                        attr.array || false
                    );
                } else if (attr.type === 'boolean') {
                    await databases.createBooleanAttribute(
                        DATABASE_ID,
                        collectionData.id,
                        attr.key,
                        attr.required,
                        attr.default,
                        attr.array || false
                    );
                } else if (attr.type === 'datetime') {
                    await databases.createDatetimeAttribute(
                        DATABASE_ID,
                        collectionData.id,
                        attr.key,
                        attr.required,
                        attr.default,
                        attr.array || false
                    );
                } else if (attr.type === 'enum') {
                    await databases.createEnumAttribute(
                        DATABASE_ID,
                        collectionData.id,
                        attr.key,
                        attr.elements,
                        attr.required,
                        attr.default,
                        attr.array || false
                    );
                }

                console.log(`  ✅ Atributo creado: ${attr.key}`);

                // Esperar un poco entre atributos para evitar rate limits
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`  ❌ Error creando atributo ${attr.key}:`, error.message);
            }
        }

        console.log(`✅ Colección ${collectionData.name} completada\n`);
        return collection;

    } catch (error) {
        if (error.code === 409) {
            console.log(`⚠️  La colección ${collectionData.name} ya existe\n`);
        } else {
            console.error(`❌ Error creando colección ${collectionData.name}:`, error.message);
        }
    }
}

async function main() {
    console.log('🚀 Iniciando creación de colecciones de Órdenes de Trabajo...\n');
    console.log(`📊 Total de colecciones a crear: ${collections.length}\n`);

    for (const collectionData of collections) {
        await createCollection(collectionData);
        // Esperar entre colecciones
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n🎉 ¡Proceso completado!');
    console.log('\n📋 Resumen:');
    console.log(`   - vehiculos`);
    console.log(`   - ordenes_trabajo`);
    console.log(`   - ot_procesos`);
    console.log(`   - ot_actividades`);
    console.log(`   - ot_repuestos`);
    console.log(`   - ot_pruebas`);
    console.log(`   - ot_checklist_vehiculo`);
    console.log(`   - ot_autorizaciones`);
    console.log(`   - ot_solicitudes_repuestos`);
    console.log(`   - ot_plantillas_procesos`);
    console.log('\n✅ Todas las colecciones fueron creadas exitosamente!');
}

main().catch(console.error);
