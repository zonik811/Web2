"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    ArrowLeft,
    Save,
    User,
    Briefcase,
    MapPin,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    Loader2,
    Check,
    Star,
    Award
} from "lucide-react";
import Link from "next/link";
import { crearEmpleado } from "@/lib/actions/empleados";
import { ModalidadPago, CargoEmpleado } from "@/types";
import { toast } from "@/lib/hooks/use-toast";
import { obtenerCargos } from "@/lib/actions/parametricas";
import { obtenerCategorias, type Categoria } from "@/lib/actions/categorias";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function NuevoEmpleadoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // Datos dinámicos
    const [cargosDisponibles, setCargosDisponibles] = useState<any[]>([]);
    const [categoriasDisponibles, setCategoriasDisponibles] = useState<Categoria[]>([]);

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        documento: "",
        telefono: "",
        email: "",
        direccion: "",
        fechaNacimiento: "",
        fechaContratacion: new Date().toISOString().split("T")[0],
        cargo: "",
        especialidades: [] as string[],
        tarifaPorHora: 15000,
        modalidadPago: "hora" as ModalidadPago,
    });

    useEffect(() => {
        const loadParametricas = async () => {
            try {
                const [cargos, categorias] = await Promise.all([
                    obtenerCargos(),
                    obtenerCategorias()
                ]);
                setCargosDisponibles(cargos);
                setCategoriasDisponibles(categorias);

                // Set default cargo if available and none selected
                if (cargos.length > 0 && !formData.cargo) {
                    setFormData(prev => ({ ...prev, cargo: cargos[0].nombre }));
                }
            } catch (error) {
                console.error("Error cargando paramétricas:", error);
                toast({ title: "Error", description: "No se pudieron cargar los datos paramétricos", variant: "destructive" });
            } finally {
                setLoadingData(false);
            }
        };

        loadParametricas();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.cargo) {
            toast({ title: "Error", description: "Debes seleccionar un cargo", variant: "destructive" });
            setLoading(false);
            return;
        }

        try {
            const payload = {
                ...formData,
                cargo: formData.cargo as CargoEmpleado
            };
            const response = await crearEmpleado(payload);

            if (response.success) {
                toast({ title: "Exito", description: "Empleado creado correctamente", className: "bg-green-50 border-green-200" });
                router.push("/admin/personal");
            } else {
                toast({ title: "Error", description: response.error || "Error al crear empleado", variant: "destructive" });
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Error inesperado", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const toggleEspecialidad = (especialidadNombre: string) => {
        setFormData((prev) => ({
            ...prev,
            especialidades: prev.especialidades.includes(especialidadNombre)
                ? prev.especialidades.filter((e) => e !== especialidadNombre)
                : [...prev.especialidades, especialidadNombre],
        }));
    };

    if (loadingData) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 text-lg">Cargando formulario...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 py-8 animate-in fade-in duration-500 p-6">
            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-6">
                <Link href="/admin/personal">
                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="h-6 w-6 text-gray-700" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">Nuevo Empleado</h1>
                    <p className="text-gray-500 text-lg mt-1">Registra un nuevo miembro del equipo y asigna sus roles.</p>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-8">

                {/* Sección 1: Datos Personales */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <User className="h-5 w-5 text-blue-600" />
                        </div>
                        Información Personal
                    </h2>

                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            <div className="space-y-2">
                                <Label htmlFor="nombre" className="font-semibold">Nombre <span className="text-red-500">*</span></Label>
                                <Input
                                    id="nombre"
                                    placeholder="Ej. Juan"
                                    required
                                    className="h-11"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="apellido" className="font-semibold">Apellido <span className="text-red-500">*</span></Label>
                                <Input
                                    id="apellido"
                                    placeholder="Ej. Pérez"
                                    required
                                    className="h-11"
                                    value={formData.apellido}
                                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="documento" className="font-semibold">Documento <span className="text-red-500">*</span></Label>
                                <Input
                                    id="documento"
                                    placeholder="Cédula o ID"
                                    required
                                    className="h-11"
                                    value={formData.documento}
                                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="telefono" className="font-semibold">Teléfono <span className="text-red-500">*</span></Label>
                                <Input
                                    id="telefono"
                                    type="tel"
                                    placeholder="300 123 4567"
                                    required
                                    className="h-11"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="email" className="font-semibold">Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    required
                                    className="h-11"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="direccion" className="font-semibold">Dirección <span className="text-red-500">*</span></Label>
                                <Input
                                    id="direccion"
                                    placeholder="Dirección completa"
                                    required
                                    className="h-11"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fechaNacimiento" className="font-semibold">Fecha de Nacimiento <span className="text-red-500">*</span></Label>
                                <Input
                                    id="fechaNacimiento"
                                    type="date"
                                    required
                                    className="h-11"
                                    value={formData.fechaNacimiento}
                                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fechaContratacion" className="font-semibold">Fecha de Contratación <span className="text-red-500">*</span></Label>
                                <Input
                                    id="fechaContratacion"
                                    type="date"
                                    required
                                    className="h-11"
                                    value={formData.fechaContratacion}
                                    onChange={(e) => setFormData({ ...formData, fechaContratacion: e.target.value })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sección 2: Datos Laborales */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <div className="bg-indigo-100 p-2 rounded-lg">
                            <Briefcase className="h-5 w-5 text-indigo-600" />
                        </div>
                        Información Laboral
                    </h2>

                    <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6 space-y-8">

                            {/* Selector de Cargo */}
                            <div className="space-y-3">
                                <Label htmlFor="cargo" className="text-base font-semibold">Cargo <span className="text-red-500">*</span></Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {cargosDisponibles.map((cargo) => (
                                        <div
                                            key={cargo.$id}
                                            onClick={() => setFormData({ ...formData, cargo: cargo.nombre })}
                                            className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${formData.cargo === cargo.nombre
                                                ? "border-blue-600 bg-blue-50/50"
                                                : "border-gray-200 hover:border-blue-300 bg-white"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className={`font-bold text-lg ${formData.cargo === cargo.nombre ? "text-blue-700" : "text-gray-800"}`}>
                                                        {cargo.nombre}
                                                    </h3>
                                                    {cargo.descripcion && (
                                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cargo.descripcion}</p>
                                                    )}
                                                </div>
                                                {formData.cargo === cargo.nombre && (
                                                    <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <Check className="h-4 w-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {cargosDisponibles.length === 0 && (
                                        <div className="col-span-full p-8 text-center border-2 border-dashed border-gray-300 rounded-xl">
                                            <p className="text-gray-500">No hay cargos configurados. Ve a Paramétricas para crearlos.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Selector de Especialidades */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold flex items-center gap-2">
                                    Especialidades (Categorías de Servicios)
                                    <span className="text-xs font-normal text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                                        Selecciona múltiples
                                    </span>
                                </Label>
                                <p className="text-xs text-gray-500">
                                    Selecciona las categorías de servicios en las que este empleado es especialista. Esto ayudará a asignar automáticamente empleados a citas según el tipo de servicio.
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {categoriasDisponibles.map((cat) => {
                                        const isSelected = formData.especialidades.includes(cat.nombre);
                                        return (
                                            <div
                                                key={cat.$id}
                                                onClick={() => toggleEspecialidad(cat.nombre)}
                                                className={`cursor-pointer group relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${isSelected
                                                    ? "border-emerald-500 bg-emerald-50/30"
                                                    : "border-gray-100 hover:border-emerald-200 bg-white hover:bg-gray-50"
                                                    }`}
                                            >
                                                <Award className={`h-8 w-8 mb-2 ${isSelected ? "text-emerald-600" : "text-gray-400"} group-hover:scale-110 transition-transform duration-200`} />
                                                <span className={`text-sm font-semibold text-center ${isSelected ? "text-emerald-700" : "text-gray-600"}`}>
                                                    {cat.nombre}
                                                </span>
                                                {isSelected && (
                                                    <div className="absolute top-2 right-2 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm">
                                                        <Check className="h-3 w-3 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {categoriasDisponibles.length === 0 && (
                                    <div className="p-4 text-center border-2 border-dashed border-gray-300 rounded-xl">
                                        <p className="text-gray-500">No hay categorías de servicios. Ve a Servicios para crear categorías primero.</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                <div className="space-y-3">
                                    <Label htmlFor="tarifaPorHora" className="font-semibold">Tarifa por Hora <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-2.5 bg-gray-100 p-1 rounded-md">
                                            <DollarSign className="h-4 w-4 text-gray-600" />
                                        </div>
                                        <Input
                                            id="tarifaPorHora"
                                            type="number"
                                            required
                                            min="0"
                                            className="pl-12 h-12 text-lg font-semibold"
                                            value={formData.tarifaPorHora}
                                            onChange={(e) => setFormData({ ...formData, tarifaPorHora: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="modalidadPago" className="font-semibold">Modalidad de Pago <span className="text-red-500">*</span></Label>
                                    <Select
                                        value={formData.modalidadPago}
                                        onValueChange={(value) => setFormData({ ...formData, modalidadPago: value as ModalidadPago })}
                                    >
                                        <SelectTrigger className="h-12">
                                            <SelectValue placeholder="Selecciona modalidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hora">Por Hora</SelectItem>
                                            <SelectItem value="servicio">Por Servicio</SelectItem>
                                            <SelectItem value="fijo_mensual">Fijo Mensual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end items-center gap-4 pt-6 border-t sticky bottom-0 bg-white/95 backdrop-blur py-4 z-10">
                    <Link href="/admin/personal">
                        <Button type="button" variant="outline" disabled={loading} className="h-12 px-8 text-base hover:bg-gray-100">
                            Cancelar
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="h-12 px-10 text-base min-w-[200px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5 mr-2" />
                                Guardar Empleado
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
