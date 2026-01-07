"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { account } from "@/lib/appwrite";
import { Models } from "appwrite";

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            await account.createEmailPasswordSession(email, password);
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
        } catch (error: any) {
            console.error("Error en logout:", error);
            throw new Error(error.message || "Error al cerrar sesión");
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
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
