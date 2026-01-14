"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn, Loader2 } from "lucide-react";
import { login } from "@/lib/actions/auth";
import Link from "next/link";
import { useCompany } from "@/context/CompanyContext";

export function LoginForm() {
    const router = useRouter();
    const { config } = useCompany();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        recordarme: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await login(formData.email, formData.password);

        setLoading(false);

        if (result.success) {
            router.push('/mi-cuenta');
        } else {
            setError(result.message);
        }
    };

    const companyName = config?.nombre || 'AltioraClean';

    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            <div className="text-center mb-8">
                <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mb-4">
                    <LogIn className="h-12 w-12 text-blue-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Iniciar Sesión</h2>
                <p className="text-slate-600">
                    Accede a tu cuenta de {companyName}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-12"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="h-12"
                />
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="recordar"
                        checked={formData.recordarme}
                        onCheckedChange={(checked) => setFormData({ ...formData, recordarme: checked as boolean })}
                    />
                    <label htmlFor="recordar" className="text-sm text-slate-600">
                        Recordarme
                    </label>
                </div>

                <Link href="/recuperar-password" className="text-sm text-blue-600 hover:underline">
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 text-lg font-bold shadow-xl"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Ingresando...
                    </>
                ) : (
                    <>
                        <LogIn className="mr-2 h-5 w-5" />
                        Iniciar Sesión
                    </>
                )}
            </Button>

            <p className="text-center text-sm text-slate-600">
                ¿No tienes cuenta?{' '}
                <Link href="/registrarse" className="text-emerald-600 hover:underline font-semibold">
                    Regístrate aquí - 4% OFF
                </Link>
            </p>
        </form>
    );
}
