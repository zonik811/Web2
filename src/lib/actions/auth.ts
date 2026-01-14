"use server";

import { account, databases } from "@/lib/appwrite-server";
import { ID } from "node-appwrite";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;

// Registrar nuevo cliente
export async function registrarCliente(data: {
    nombre: string;
    telefono: string;
    email: string;
    password: string;
    direccion: string;
    ciudad: string;
}): Promise<{ success: boolean; userId?: string; message: string }> {
    try {
        // 1. Crear cuenta en Appwrite
        const user = await account.create(
            ID.unique(),
            data.email,
            data.password,
            data.nombre
        );

        // 2. Crear documento en colección clientes
        await databases.createDocument(
            DATABASE_ID,
            'clientes',
            user.$id,
            {
                nombre: data.nombre,
                telefono: data.telefono,
                email: data.email,
                direccion: data.direccion,
                ciudad: data.ciudad,
                tipoCliente: 'residencial' // default
            }
        );

        // 3. Crear user_profile con rol "cliente"
        await databases.createDocument(
            DATABASE_ID,
            'user_profile',
            ID.unique(),
            {
                userId: user.$id,
                rol: 'cliente',
                nombre: data.nombre
            }
        );

        // 4. Crear sesión (login automático)
        await account.createEmailPasswordSession(data.email, data.password);

        return {
            success: true,
            userId: user.$id,
            message: '¡Registro exitoso! Bienvenido'
        };
    } catch (error: any) {
        console.error('Error en registro:', error);
        return {
            success: false,
            message: error.message || 'Error en el registro'
        };
    }
}

// Login
export async function login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
        await account.createEmailPasswordSession(email, password);
        return {
            success: true,
            message: 'Login exitoso'
        };
    } catch (error: any) {
        console.error('Error en login:', error);
        return {
            success: false,
            message: 'Email o contraseña incorrectos'
        };
    }
}

// Logout
export async function logout(): Promise<{ success: boolean; message: string }> {
    try {
        await account.deleteSession('current');
        return {
            success: true,
            message: 'Sesión cerrada'
        };
    } catch (error: any) {
        console.error('Error en logout:', error);
        return {
            success: false,
            message: error.message || 'Error cerrando sesión'
        };
    }
}

// Obtener usuario actual
export async function getCurrentUser() {
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        return null;
    }
}

// Verificar si usuario está logueado
export async function isAuthenticated(): Promise<boolean> {
    try {
        await account.get();
        return true;
    } catch {
        return false;
    }
}
