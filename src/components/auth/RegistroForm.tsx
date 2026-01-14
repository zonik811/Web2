"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { registrarCliente } from "@/lib/actions/auth";
import Link from "next/link";
import { useCompany } from "@/context/CompanyContext";

export function RegistroForm() {
    const router = useRouter();
    const { config } = useCompany();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        nombre: "",
        telefono: "",
        email: "",
        password: "",
        direccion: "",
        ciudad: "",
        aceptaTerminos: false
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.aceptaTerminos) {
            setError("Debes aceptar los términos y condiciones");
            return;
        }

        if (formData.password.length < 8) {
            setError("La contraseña debe tener al menos 8 caracteres");
            return;
        }

        setLoading(true);

        const result = await registrarCliente({
            nombre: formData.nombre,
            telefono: formData.telefono,
            email: formData.email,
            password: formData.password,
            direccion: formData.direccion,
            ciudad: formData.ciudad
        });

        setLoading(false);

        if (result.success) {
            router.push('/tienda');
        } else {
            setError(result.message);
        }
    };

    const companyName = config?.nombre || 'AltioraClean';

    return (
        <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-md">
            <div className="text-center mb-8">
                <div className="inline-flex p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full mb-4">
                    <UserPlus className="h-12 w-12 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Únete a {companyName}</h2>
                <p className="text-slate-600">
                    Regístrate y obtén un <span className="font-bold text-emerald-600">4% OFF</span> en tu primer servicio
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border-2 border-red-200 text-red-800 px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                        id="nombre"
                        placeholder="Juan Pérez"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                        className="h-12"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                        id="telefono"
                        type="tel"
                        placeholder="300 123 4567"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        required
                        className="h-12"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="oscar@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-12"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 8 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={8}
                        className="h-12 pr-12"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5 text-slate-400" />
                        ) : (
                            <Eye className="h-5 w-5 text-slate-400" />
                        )}
                    </Button>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="direccion">Dirección Principal *</Label>
                <Input
                    id="direccion"
                    placeholder="Calle 123 #45-67"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    required
                    className="h-12"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad *</Label>
                <Select
                    value={formData.ciudad}
                    onValueChange={(value) => setFormData({ ...formData, ciudad: value })}
                    required
                >
                    <SelectTrigger className="h-12 bg-white">
                        <SelectValue placeholder="Selecciona tu ciudad" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                        <SelectItem value="Mosquera">Mosquera</SelectItem>
                        <SelectItem value="Funza">Funza</SelectItem>
                        <SelectItem value="Madrid">Madrid</SelectItem>
                        <SelectItem value="Facatativá">Facatativá</SelectItem>
                        <SelectItem value="Bojacá">Bojacá</SelectItem>
                        <SelectItem value="Soacha">Soacha</SelectItem>
                        <SelectItem value="Bogotá">Bogotá</SelectItem>
                        <SelectItem value="Cota">Cota</SelectItem>
                        <SelectItem value="Chía">Chía</SelectItem>
                        <SelectItem value="Cajicá">Cajicá</SelectItem>
                        <SelectItem value="Zipaquirá">Zipaquirá</SelectItem>
                        <SelectItem value="Tabio">Tabio</SelectItem>
                        <SelectItem value="Tenjo">Tenjo</SelectItem>
                        <SelectItem value="Subachoque">Subachoque</SelectItem>
                        <SelectItem value="El Rosal">El Rosal</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id="terminos"
                    checked={formData.aceptaTerminos}
                    onCheckedChange={(checked) => setFormData({ ...formData, aceptaTerminos: checked as boolean })}
                />
                <label htmlFor="terminos" className="text-sm text-slate-600">
                    Acepto los <Link href="/terminos" className="text-emerald-600 hover:underline">términos y condiciones</Link>
                </label>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-14 text-lg font-bold shadow-xl"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Registrando...
                    </>
                ) : (
                    <>
                        <UserPlus className="mr-2 h-5 w-5" />
                        Registrarse y Obtener Descuento
                    </>
                )}
            </Button>

            <p className="text-center text-sm text-slate-600">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-emerald-600 hover:underline font-semibold">
                    Inicia Sesión
                </Link>
            </p>
        </form>
    );
}
