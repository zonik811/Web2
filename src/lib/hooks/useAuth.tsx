"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { account } from "@/lib/appwrite";
import { Models } from "appwrite";

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    profile: any | null;
    role: "admin" | "client" | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [role, setRole] = useState<"admin" | "client" | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);

            // Buscar perfil en user_profile usando API route
            try {
                const response = await fetch('/api/user-profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: currentUser.$id })
                });

                if (response.ok) {
                    const userProfile = await response.json();

                    if (userProfile && userProfile.rol) {


                        // Asignar rol desde user_profile
                        if (userProfile.rol === 'admin') {

                            setRole("admin");
                            setProfile(userProfile);
                        } else if (userProfile.rol === 'cliente') {

                            setRole("client"); // Use "client" to match type definition
                            setProfile(userProfile);
                        } else {
                            console.warn(`Rol desconocido: ${userProfile.rol}`);
                            setRole(null);
                            setProfile(null);
                        }

                        return; // Salir después de encontrar perfil
                    }
                }
            } catch (error) {

            }

            // Fallback: Si no hay perfil en user_profile, usuario sin rol
            console.warn(`Usuario ${currentUser.email} no tiene perfil en user_profile`);
            setRole(null);
            setProfile(null);

        } catch (error) {
            setUser(null);
            setRole(null);
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            // Primero intentar cerrar cualquier sesión activa
            try {
                await account.deleteSession("current");

            } catch (error) {
                // No hay sesión activa, continuar

            }

            // Crear nueva sesión
            await account.createEmailPasswordSession(email, password);


            // Verificar autenticación y rol
            await checkAuth();
        } catch (error: any) {
            console.error("Error en login:", error);
            throw new Error(error.message || "Error al iniciar sesión");
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession("current");
            setUser(null);
            setRole(null);
            setProfile(null);
        } catch (error: any) {
            console.error("Error en logout:", error);
            throw new Error(error.message || "Error al cerrar sesión");
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, profile, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth debe ser usado dentro de AuthProvider");
    }
    return context;
}
