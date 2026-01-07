"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { crearEmpleado } from "@/lib/actions/empleados";
import { CargoEmpleado, ModalidadPago } from "@/types";

export default function NuevoEmpleadoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        documento: "",
        telefono: "",
        email: "",
        direccion: "",
        fechaNacimiento: "",
        fechaContratacion: new Date().toISOString().split("T")[0],
        cargo: "limpiador" as CargoEmpleado,
        especialidades: [] as string[],
        tarifaPorHora: 15000,
        modalidadPago: "hora" as ModalidadPago,
    });

    const especialidadesDisponibles = [
        "limpieza_basica",
        "limpieza_profunda",
        "ventanas",
        "oficinas",
        "post_construccion",
        "organizacion",
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await crearEmpleado(formData);

            if (response.success) {
                router.push("/admin/personal");
            } else {
                setError(response.error || "Error al crear empleado");
            }
        } catch (err: any) {
            setError(err.message || "Error al crear empleado");
        } finally {
            setLoading(false);
        }
    };

    const toggleEspecialidad = (especialidad: string) => {
        setFormData((prev) => ({
            ...prev,
            especialidades: prev.especialidades.includes(especialidad)
                ? prev.especialidades.filter((e) => e !== especialidad)
                : [...prev.especialidades, especialidad],
        }));
    };

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header */}
            <div className="flex items-center space-x-4">
                <Link href="/admin/personal">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Nuevo Empleado</h1>
                    <p className="text-gray-600 mt-1">Registra un nuevo miembro del equipo</p>
                </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Información Personal */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Personal</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombre">Nombre *</Label>
                                    <Input
                                        id="nombre"
                                        required
                                        value={formData.nombre}
                                        onChange={(e) =>
                                            setFormData({ ...formData, nombre: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apellido">Apellido *</Label>
                                    <Input
                                        id="apellido"
                                        required
                                        value={formData.apellido}
                                        onChange={(e) =>
                                            setFormData({ ...formData, apellido: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="documento">Documento *</Label>
                                    <Input
                                        id="documento"
                                        required
                                        value={formData.documento}
                                        onChange={(e) =>
                                            setFormData({ ...formData, documento: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefono">Teléfono *</Label>
                                    <Input
                                        id="telefono"
                                        required
                                        type="tel"
                                        value={formData.telefono}
                                        onChange={(e) =>
                                            setFormData({ ...formData, telefono: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="direccion">Dirección *</Label>
                                <Input
                                    id="direccion"
                                    required
                                    value={formData.direccion}
                                    onChange={(e) =>
                                        setFormData({ ...formData, direccion: e.target.value })
                                    }
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fechaNacimiento">Fecha de Nacimiento *</Label>
                                    <Input
                                        id="fechaNacimiento"
                                        type="date"
                                        required
                                        value={formData.fechaNacimiento}
                                        onChange={(e) =>
                                            setFormData({ ...formData, fechaNacimiento: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fechaContratacion">Fecha de Contratación *</Label>
                                    <Input
                                        id="fechaContratacion"
                                        type="date"
                                        required
                                        value={formData.fechaContratacion}
                                        onChange={(e) =>
                                            setFormData({ ...formData, fechaContratacion: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información Laboral */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Laboral</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="cargo">Cargo *</Label>
                                <select
                                    id="cargo"
                                    required
                                    value={formData.cargo}
                                    onChange={(e) =>
                                        setFormData({ ...formData, cargo: e.target.value as CargoEmpleado })
                                    }
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="limpiador">Limpiador</option>
                                    <option value="supervisor">Supervisor</option>
                                    <option value="especialista">Especialista</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>Especialidades *</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {especialidadesDisponibles.map((esp) => (
                                        <label key={esp} className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.especialidades.includes(esp)}
                                                onChange={() => toggleEspecialidad(esp)}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm">{esp.replace(/_/g, " ")}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="tarifaPorHora">Tarifa por Hora *</Label>
                                    <Input
                                        id="tarifaPorHora"
                                        type="number"
                                        required
                                        min="1000"
                                        value={formData.tarifaPorHora}
                                        onChange={(e) =>
                                            setFormData({ ...formData, tarifaPorHora: Number(e.target.value) })
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="modalidadPago">Modalidad de Pago *</Label>
                                    <select
                                        id="modalidadPago"
                                        required
                                        value={formData.modalidadPago}
                                        onChange={(e) =>
                                            setFormData({ ...formData, modalidadPago: e.target.value as ModalidadPago })
                                        }
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        <option value="hora">Por Hora</option>
                                        <option value="servicio">Por Servicio</option>
                                        <option value="fijo_mensual">Fijo Mensual</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error */}
                    {error && (
                        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive">{error}</p>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-4">
                        <Link href="/admin/personal">
                            <Button type="button" variant="outline" disabled={loading}>
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                "Guardando..."
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Empleado
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
