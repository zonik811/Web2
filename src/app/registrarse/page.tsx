"use client";

import { RegistroForm } from "@/components/auth/RegistroForm";
import { CompanyProvider } from "@/context/CompanyContext";

export default function RegistrarsePage() {
    return (
        <CompanyProvider>
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-8">
                <div className="w-full max-w-2xl">
                    <RegistroForm />
                </div>
            </div>
        </CompanyProvider>
    );
}
