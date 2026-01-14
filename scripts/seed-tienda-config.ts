/**
 * Script para inicializar la configuración de tienda
 * Uso: npx tsx scripts/seed-tienda-config.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { Client, Databases, ID } from 'node-appwrite';

async function seedTiendaConfig() {
    const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
    const API_KEY = process.env.APPWRITE_API_KEY!;

    const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setKey(API_KEY);

    const databases = new Databases(client);

    try {
        console.log('🌱 Inicializando configuración de tienda...');

        // Verificar si ya existe
        const { documents } = await databases.listDocuments(DATABASE_ID, 'tienda_config');

        if (documents.length > 0) {
            console.log('⚠️  Ya existe configuración de tienda');
            console.log('📝 Configuración actual:');
            console.log(`   Nombre: ${documents[0].nombre_negocio}`);
            console.log(`   WhatsApp: ${documents[0].whatsapp}`);
            console.log(`   Email: ${documents[0].email}`);
            return;
        }

        // Crear configuración por defecto
        await databases.createDocument(
            DATABASE_ID,
            'tienda_config',
            ID.unique(),
            {
                nombre_negocio: 'DieselParts',
                descripcion: 'Repuestos y partes diesel de alta calidad',
                whatsapp: '573223238781',
                email: 'contacto@altioragroup.com.co',
                logo_url: '',
                color_primario: '#9333EA',
                color_secundario: '#3B82F6',
                mensaje_bienvenida: 'Catálogo Online - DieselParts',
                mensaje_whatsapp: '¡Hola! Quiero hacer el siguiente pedido:',
                mostrar_stock: true,
                permitir_pedidos_sin_stock: false,
                moneda: 'COP',
                iva_incluido: true,
                terminos_condiciones: '',
                activo: true
            }
        );

        console.log('✅ Configuración de tienda creada exitosamente');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedTiendaConfig();
