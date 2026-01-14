/**
 * Script para agregar TODOS los campos faltantes a la colección ordenes_trabajo
 * Ejecutar con: node scripts/add-cotizacion-field.js
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
const COLLECTION_ID = 'ordenes_trabajo';

async function agregarCamposFaltantes() {
    console.log('🚀 Agregando TODOS los campos faltantes a ordenes_trabajo...\n');

    const campos = [
        // Cotización
        {
            key: 'cotizacionAprobada',
            type: 'boolean',
            required: false,
            default: false
        },
        {
            key: 'fechaCotizacion',
            type: 'datetime',
            required: false
        },
        {
            key: 'fechaAprobacion',
            type: 'datetime',
            required: false
        },
        // Costos
        {
            key: 'subtotal',
            type: 'float',
            required: false,
            default: 0
        },
        {
            key: 'aplicarIva',
            type: 'boolean',
            required: false,
            default: true
        },
        {
            key: 'porcentajeIva',
            type: 'float',
            required: false,
            default: 19
        },
        {
            key: 'impuestos',
            type: 'float',
            required: false,
            default: 0
        },
        {
            key: 'total',
            type: 'float',
            required: false,
            default: 0
        },
        // Garantía
        {
            key: 'tieneGarantia',
            type: 'boolean',
            required: false,
            default: false
        },
        {
            key: 'diasGarantia',
            type: 'integer',
            required: false
        },
        {
            key: 'fechaVencimientoGarantia',
            type: 'datetime',
            required: false
        }
    ];

    for (const campo of campos) {
        try {
            console.log(`➕ Agregando campo: ${campo.key} (${campo.type})...`);

            if (campo.type === 'boolean') {
                await databases.createBooleanAttribute(
                    DATABASE_ID,
                    COLLECTION_ID,
                    campo.key,
                    campo.required,
                    campo.default
                );
            } else if (campo.type === 'datetime') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    COLLECTION_ID,
                    campo.key,
                    campo.required
                );
            }

            console.log(`✅ Campo ${campo.key} agregado exitosamente\n`);

            // Esperar un poco entre campos
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            if (error.code === 409) {
                console.log(`⚠️  El campo ${campo.key} ya existe\n`);
            } else {
                console.error(`❌ Error agregando campo ${campo.key}:`, error.message, '\n');
            }
        }
    }

    console.log('✅ ¡Proceso completado!');
}

agregarCamposFaltantes().catch(console.error);
