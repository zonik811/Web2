"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileSidebar } from "@/components/layout/MobileSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, role, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
            } else if (role !== "admin") {
                router.push("/portal/dashboard");
            }
        }
    }, [user, role, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Don't render anything while redirecting
    }

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Header / Trigger */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <MobileSidebar />
            </div>

            {/* Sidebar Desktop */}
            <aside className="hidden lg:block w-64 border-r border-gray-200">
                <Sidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-6 max-w-7xl pt-16 lg:pt-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
