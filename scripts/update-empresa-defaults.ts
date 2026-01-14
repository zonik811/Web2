/**
 * Script para actualizar el documento main con valores default
 * USO: npx tsx scripts/update-empresa-defaults.ts
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { Client, Databases } from 'node-appwrite';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    cyan: '\x1b[36m'
};

async function main() {
    console.log(`${colors.cyan}Actualizando valores default...${colors.reset}`);

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
        await databases.updateDocument(
            DATABASE_ID,
            'empresa_config',
            'main',
            {
                // Hero
                heroBadge: '✨ #1 en Repuestos Diesel',
                ctaPrimario: 'Ver Catálogo',
                ctaSecundario: 'Contactar',
                ctaDescuento: 'Solicitar Cotización',

                // Stats
                statClientes: 50,
                statServicios: 200,
                statProfesionales: 8,
                statSatisfaccion: '98%',

                // CTA Final
                ctaFinalTitulo: '¿Listo para Encontrar tus Repuestos?',
                ctaFinalSubtitulo: 'Contáctanos hoy y obtén los mejores repuestos para tu maquinaria diesel',
                ctaFinalBoton: 'Contactar Ahora',

                // Horarios
                horarioDias: 'Lunes a Sábado',
                horarioHoras: '7:00 AM - 6:00 PM',
                disponibilidad247: false,

                // SEO
                metaDescripcion: 'Repuestos de calidad para maquinaria diesel. Filtros, bombas, turbocompresores y más.',
                keywords: 'repuestos diesel, filtros diesel, bombas inyección, turbocompresores, piezas motor diesel'
            }
        );

        console.log(`${colors.green}✅ Valores actualizados${colors.reset}\n`);
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

main();
