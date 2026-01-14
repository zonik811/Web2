"use server";

import { databases } from "@/lib/appwrite-admin";
import { DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import { revalidatePath } from "next/cache";
import type { EmpresaConfig } from "@/types/nuevos-tipos";

/**
 * Obtener configuración de empresa (Modular Strategy)
 */
export async function obtenerConfiguracion(): Promise<EmpresaConfig | null> {
    try {
        console.log("🔄 Fetching Modular Config...");
        // Fetch all modular parts in parallel + legacy config for branding_styles
        const [heroDoc, brandingDoc, infoDoc, legacyDoc] = await Promise.all([
            databases.getDocument(DATABASE_ID, COLLECTIONS.CONFIG_HERO, 'main').catch((e) => null),
            databases.getDocument(DATABASE_ID, COLLECTIONS.CONFIG_BRANDING, 'main').catch((e) => null),
            databases.getDocument(DATABASE_ID, COLLECTIONS.EMPRESA_INFO, 'main').catch((e) => null),
            databases.getDocument(DATABASE_ID, COLLECTIONS.EMPRESA_CONFIG, 'main').catch((e) => null),
        ]);

        // Fallback to legacy if critical parts missing (First load / Migration transition)
        if (!heroDoc && !brandingDoc && !infoDoc) {
            console.log("⚠️ No modular config found. Falling back to legacy 'empresa_config'.");

            if (!legacyDoc) {
                console.log("⚠️ No config found anywhere. Returning DEFAULT.");
                return {
                    $id: 'default',
                    $collectionId: 'virtual',
                    $databaseId: 'virtual',
                    $createdAt: new Date().toISOString(),
                    $updatedAt: new Date().toISOString(),
                    $permissions: [],
                    nombre: 'Mi Empresa',
                    slogan: 'Bienvenido',
                    descripcion: 'Configuración por defecto',
                    telefono: '',
                    email: '',
                    direccion: '',
                    whatsapp: '',
                    colorPrimario: '#000000',
                    colorSecundario: '#ffffff',
                    logo: '',
                    heroBadge: '',
                    heroBadgeStyle: 'solid',
                    heroTitulo: 'Título Hero',
                    heroDescripcion: 'Descripción Hero',
                    heroImagen: '',
                    heroOverlay: 'none',
                    ctaPrimario: '',
                    ctaSecundario: '',
                    ctaDescuento: '',
                    ctaDescuentoIcono: '',
                    branding_styles: '{}',
                    statClientes: 0,
                    statServicios: 0,
                    horarioDias: '',
                } as any;
            }
            return legacyDoc as any;
        }

        // Construct Adapter Object (Mapping new DB schema to old Types)
        const config: any = {
            $id: 'modular_composite',
            $collectionId: 'mixed',
            $databaseId: DATABASE_ID,
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],

            // INFO
            nombre: infoDoc?.nombre || 'Mi Empresa',
            slogan: heroDoc?.titulo || '', // Mapping Hero Title to Slogan usually
            descripcion: heroDoc?.descripcion || '',
            telefono: parseJson(infoDoc?.contact_info)?.telefono || '',
            email: parseJson(infoDoc?.contact_info)?.email || '',
            direccion: parseJson(infoDoc?.contact_info)?.direccion || '',
            whatsapp: parseJson(infoDoc?.contact_info)?.whatsapp || '',
            colorPrimario: brandingDoc?.primary_color || '#000000',
            colorSecundario: brandingDoc?.secondary_color || '#ffffff',
            logo: infoDoc?.logo_url || '',

            // STATS - Parse from stats_data JSON
            statClientes: parseJson(infoDoc?.stats_data)?.clientes || 0,
            statServicios: parseJson(infoDoc?.stats_data)?.servicios || 0,
            statProfesionales: parseJson(infoDoc?.stats_data)?.profesionales || 0,
            statSatisfaccion: parseJson(infoDoc?.stats_data)?.satisfaccion || '',

            // HERO
            heroBadge: heroDoc?.badge_text || '',
            heroBadgeStyle: heroDoc?.badge_style || 'solid',
            heroTitulo: heroDoc?.titulo || '',
            heroDescripcion: heroDoc?.descripcion || '',
            heroImagen: heroDoc?.imagen_fondo || '',
            heroOverlay: heroDoc?.overlay_type || 'none',

            // CTAs (Parse JSONs)
            ctaPrimario: parseJson(heroDoc?.cta_primary)?.text || '',
            ctaSecundario: parseJson(heroDoc?.cta_secondary)?.text || '',
            ctaDescuento: parseJson(heroDoc?.cta_discount)?.text || '',
            ctaDescuentoIcono: parseJson(heroDoc?.cta_discount)?.icon || '',

            // Footer CTA (Parse from cta_footer)
            ctaFinalTitulo: parseJson(heroDoc?.cta_footer)?.titulo || '',
            ctaFinalSubtitulo: parseJson(heroDoc?.cta_footer)?.subtitulo || '',
            ctaFinalImagen: parseJson(heroDoc?.cta_footer)?.imagen || '',
        };

        console.log('📊 Loaded stats from DB:', {
            raw_stats_data: infoDoc?.stats_data,
            parsed: parseJson(infoDoc?.stats_data),
            final: {
                statClientes: config.statClientes,
                statServicios: config.statServicios,
                statProfesionales: config.statProfesionales,
                statSatisfaccion: config.statSatisfaccion
            }
        });

        // BRANDING EXTENDED - Load from CONFIG_BRANDING.styles_json
        let brandingStyles: any = {};

        // Priority 1: CONFIG_BRANDING.styles_json (new field you just created!)
        if (brandingDoc?.styles_json) {
            try {
                brandingStyles = JSON.parse(brandingDoc.styles_json);
                console.log('✅ Loaded styles from CONFIG_BRANDING.styles_json:', brandingStyles);
            } catch (e) {
                console.error('Error parsing CONFIG_BRANDING.styles_json:', e);
            }
        }
        // Fallback to legacy if exists
        else if (legacyDoc?.branding_styles) {
            try {
                brandingStyles = JSON.parse(legacyDoc.branding_styles);
                console.log('✅ Loaded branding_styles from legacy:', brandingStyles);
            } catch (e) {
                console.error('Error parsing legacy branding_styles:', e);
            }
        }

        // Build branding_styles by merging CONFIG_BRANDING fields with styles_json
        config.branding_styles = JSON.stringify({
            buttonStyle: brandingDoc?.button_style_id || brandingStyles.buttonStyle || 'modern',
            buttonAnimation: brandingDoc?.button_anim_id || brandingStyles.buttonAnimation || 'none',
            fontStyle: brandingDoc?.font_heading || brandingStyles.fontStyle || 'sans',
            heroLayout: heroDoc?.layout_mode || brandingStyles.heroLayout || 'center',
            heroOverlay: heroDoc?.overlay_type || brandingStyles.heroOverlay || 'none',
            heroBadgeStyle: heroDoc?.badge_style || brandingStyles.heroBadgeStyle || 'solid',
            catalogCardStyle: brandingStyles.catalogCardStyle || '',
            ctaBadgeStyle: brandingStyles.ctaBadgeStyle || '',
            catalogGridCols: brandingStyles.catalogGridCols || '3',
            catalogShowImages: brandingStyles.catalogShowImages || 'yes',
            catalogLimit: brandingStyles.catalogLimit || '6',
            ctaFinalButtonPrimary: brandingStyles.ctaFinalButtonPrimary || '',
            ctaFinalButtonSecondary: brandingStyles.ctaFinalButtonSecondary || '',
            teamCardStyle: brandingStyles.teamCardStyle || '',
            testimonialCardStyle: brandingStyles.testimonialCardStyle || '',
        });

        // Default empty fields for legacy compatibility
        config.horarioDias = '';

        return config as EmpresaConfig;
    } catch (error) {
        console.error("Error obteniendo configuración:", error);
        // Returning default instead of null to prevent crash
        return {
            $id: 'default_error',
            $collectionId: 'virtual',
            $databaseId: 'virtual',
            $createdAt: new Date().toISOString(),
            $updatedAt: new Date().toISOString(),
            $permissions: [],
            nombre: 'Error Config',
            slogan: 'Error al cargar',
            descripcion: 'Ocurrió un error cargando la configuración',
            colorPrimario: '#ff0000',
            branding_styles: '{}'
        } as any;
    }
}

/**
 * Actualizar configuración de empresa (Modular Strategy)
 */
export async function actualizarConfiguracion(data: Partial<EmpresaConfig>): Promise<{ success: boolean; error?: string }> {
    try {
        const cleanData = data as any;
        const promises = [];

        // --- 1. Update INFO Collection ---
        if (cleanData.nombre || cleanData.email || cleanData.telefono || cleanData.whatsapp || cleanData.logo ||
            cleanData.statClientes || cleanData.statServicios || cleanData.statProfesionales || cleanData.statSatisfaccion) {
            const infoPayload: any = {
                nombre: cleanData.nombre,
                // descripcion goes to HERO collection, not here
                contact_info: JSON.stringify({
                    email: cleanData.email,
                    telefono: cleanData.telefono,
                    whatsapp: cleanData.whatsapp,
                    direccion: cleanData.direccion
                }),
                // Stats data
                stats_data: JSON.stringify({
                    clientes: cleanData.statClientes,
                    servicios: cleanData.statServicios,
                    profesionales: cleanData.statProfesionales,
                    satisfaccion: cleanData.statSatisfaccion
                })
            };
            console.log('💾 Saving stats:', {
                clientes: cleanData.statClientes,
                servicios: cleanData.statServicios,
                profesionales: cleanData.statProfesionales,
                satisfaccion: cleanData.statSatisfaccion
            });
            // Try Update, catch if not exists (should exist from migration)
            promises.push(
                databases.updateDocument(DATABASE_ID, COLLECTIONS.EMPRESA_INFO, 'main', infoPayload)
                    .catch(() => databases.createDocument(DATABASE_ID, COLLECTIONS.EMPRESA_INFO, 'main', infoPayload))
            );
        }

        // --- 2. Update HERO Collection ---
        if (cleanData.heroTitulo || cleanData.heroBadge || cleanData.heroImagen || cleanData.ctaPrimario) {
            let brandingStyles = {};
            try { brandingStyles = JSON.parse(cleanData.branding_styles || '{}'); } catch { }

            const heroPayload: any = {
                titulo: cleanData.heroTitulo || cleanData.slogan,
                descripcion: cleanData.heroDescripcion || cleanData.descripcion,
                badge_text: cleanData.heroBadge,
                // If branding_styles has specific hero keys, use them, else fallback to top-level
                badge_style: (brandingStyles as any).heroBadgeStyle || cleanData.heroBadgeStyle,
                overlay_type: (brandingStyles as any).heroOverlay || cleanData.heroOverlay,
                layout_mode: (brandingStyles as any).heroLayout,
                imagen_fondo: cleanData.heroImagen,
                cta_primary: JSON.stringify({ text: cleanData.ctaPrimario, url: '/agendar' }),
                cta_secondary: JSON.stringify({ text: cleanData.ctaSecundario, url: '/#servicios' }),
                cta_discount: JSON.stringify({ text: cleanData.ctaDescuento, icon: cleanData.ctaDescuentoIcono }),
                cta_footer: JSON.stringify({
                    titulo: cleanData.ctaFinalTitulo,
                    subtitulo: cleanData.ctaFinalSubtitulo,
                    imagen: cleanData.ctaFinalImagen
                })
            };

            // Clean undefined
            Object.keys(heroPayload).forEach(key => heroPayload[key] === undefined && delete heroPayload[key]);

            promises.push(
                databases.updateDocument(DATABASE_ID, COLLECTIONS.CONFIG_HERO, 'main', heroPayload)
                    .catch(err => {
                        console.log("Hero update error (maybe create?)", err);
                        return databases.createDocument(DATABASE_ID, COLLECTIONS.CONFIG_HERO, 'main', heroPayload);
                    })
            );
        }

        // --- 3. Update BRANDING Collection ---
        if (cleanData.colorPrimario || cleanData.branding_styles) {
            let styles = {};
            try { styles = JSON.parse(cleanData.branding_styles || '{}'); } catch { }

            const brandingPayload: any = {
                primary_color: cleanData.colorPrimario,
                secondary_color: cleanData.colorSecundario,
                font_heading: (styles as any).fontStyle,
                button_style_id: (styles as any).buttonStyle,
                button_anim_id: (styles as any).buttonAnimation,
                // Save complete styles JSON (catalog settings, etc.)
                styles_json: cleanData.branding_styles
            };

            Object.keys(brandingPayload).forEach(key => brandingPayload[key] === undefined && delete brandingPayload[key]);

            promises.push(
                databases.updateDocument(DATABASE_ID, COLLECTIONS.CONFIG_BRANDING, 'main', brandingPayload)
                    .catch(() => databases.createDocument(DATABASE_ID, COLLECTIONS.CONFIG_BRANDING, 'main', brandingPayload))
            );
        }

        // Catalog styles now persist via CONFIG_BRANDING.styles_json field! ✅

        await Promise.all(promises);
        revalidatePath('/');
        return { success: true };

    } catch (error: any) {
        console.error("Error actualizando modular:", error);
        return { success: false, error: error.message };
    }
}

function parseJson(str: any) {
    if (typeof str !== 'string') return {};
    try { return JSON.parse(str); } catch { return {}; }
}
