"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { obtenerConfiguracion } from '@/lib/actions/configuracion';
import type { EmpresaConfig } from '@/types/nuevos-tipos';

interface CompanyContextType {
    config: EmpresaConfig | null;
    loading: boolean;
    error: string | null;
    reload: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<EmpresaConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadConfig = async () => {
        try {
            setLoading(true);
            setError(null);

            // Usar Server Action que contiene la lógica de "Adapter" para JSON fields
            const data = await obtenerConfiguracion();

            if (data) {
                setConfig(data);
            } else {
                throw new Error('No se pudo cargar la configuración');
            }
        } catch (err: any) {
            console.error('Error cargando configuración:', err);
            setError(err.message || 'Error cargando configuración de empresa');

            // Configuración por defecto
            setConfig({
                $id: 'main',
                $createdAt: '',
                $updatedAt: '',
                $permissions: [],
                $databaseId: '',
                $collectionId: '',
                $sequence: 0,
                nombre: 'DieselParts',
                telefono: '+57 3223238781',
                email: 'contacto@dieselparts.com.co',
                colorPrimario: '#1E40AF',
                colorSecundario: '#F59E0B'
            } as EmpresaConfig);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfig();
    }, []);

    return (
        <CompanyContext.Provider value={{ config, loading, error, reload: loadConfig }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany() {
    const context = useContext(CompanyContext);
    if (context === undefined) {
        throw new Error('useCompany debe usarse dentro de CompanyProvider');
    }
    return context;
}
