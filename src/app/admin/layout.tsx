"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
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

    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/login");
                return;
            }

            // 1. Basic Access Control (User must be logged in and have a role)
            if (!["admin", "cajero", "tecnico"].includes(role || "")) {
                router.push("/portal/dashboard");
                return;
            }

            // 2. Protect Configuration Routes (Strict Admin Only)
            if (pathname?.startsWith("/admin/configuracion") && role !== "admin") {
                router.push("/admin");
                return;
            }

            // 3. Redirect Role-Specific Dashboards (on user land on root /admin)
            if (pathname === "/admin") {
                if (role === "tecnico") {
                    router.push("/admin/ordenes-trabajo");
                    return;
                }
                if (role === "cajero") {
                    router.push("/admin/ventas/pos");
                    return;
                }
            }

            // 4. Strict Route Protection for Cajero
            if (role === "cajero" && !pathname?.startsWith("/admin/ventas/pos")) {
                router.push("/admin/ventas/pos");
                return;
            }

            // 5. Strict Route Protection for Tecnico
            if (role === "tecnico" && !pathname?.startsWith("/admin/ordenes-trabajo") && !pathname?.startsWith("/admin/vehiculos") && !pathname?.startsWith("/admin/citas")) {
                // Allow /admin/ordenes-trabajo, /admin/vehiculos, /admin/citas
                router.push("/admin/ordenes-trabajo");
                return;
            }
        }
    }, [user, role, loading, router, pathname]);

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
            <aside className="hidden lg:block w-80 border-r border-gray-200">
                <Sidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="w-full p-4 lg:p-6 pt-16 lg:pt-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
