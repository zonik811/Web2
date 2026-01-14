"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, Calendar, Clock, MapPin, User, DollarSign, FileText, CheckCircle2, Home, Sparkles, Building2, Tag } from "lucide-react";
import Link from "next/link";
import { crearCita } from "@/lib/actions/citas";
import { obtenerEmpleados } from "@/lib/actions/empleados";
import { obtenerClientes } from "@/lib/actions/clientes";
import { obtenerMetodosPago } from "@/lib/actions/parametricas";
import { obtenerCategorias, type Categoria } from "@/lib/actions/categorias";
import { obtenerServicios } from "@/lib/actions/catalogo";
import { TipoPropiedad, MetodoPago, type Empleado, type Cliente, type Servicio, CategoriaServicio } from "@/types";
import { calcularDuracionEstimada } from "@/lib/utils/precio-calculator";
import { useToast } from "@/lib/hooks/use-toast";
import { Briefcase } from "lucide-react";

export default function NuevaCitaPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [metodosPagoDisponibles, setMetodosPagoDisponibles] = useState<any[]>([]);
    const [serviciosDisponibles, setServiciosDisponibles] = useState<any[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<string>("");

    const [formData, setFormData] = useState({
        servicioId: "",
        clienteId: "",
        clienteNombre: "",
        clienteTelefono: "",
        clienteEmail: "",
        direccion: "",
        ciudad: "Bogotá",
        tipoPropiedad: "casa" as TipoPropiedad,
        metrosCuadrados: 0,
        habitaciones: 0,
        banos: 0,
        fechaCita: "",
        horaCita: "",
        empleadosAsignados: [] as string[],
        precioCliente: 50000,
        metodoPago: "efectivo" as MetodoPago,
        detallesAdicionales: "",
        notasInternas: "",
    });

    useEffect(() => {
        cargarDatos();
    }, []);

    useEffect(() => {
        if (clienteSeleccionado && clienteSeleccionado !== "nuevo") {
            const cliente = clientes.find((c) => c.$id === clienteSeleccionado);
            if (cliente) {
                setFormData((prev) => ({
                    ...prev,
                    clienteId: cliente.$id,
                    clienteNombre: cliente.nombre,
                    clienteTelefono: cliente.telefono,
                    clienteEmail: cliente.email,
                    direccion: cliente.direccion,
                    ciudad: cliente.ciudad,
                }));
            }
        } else if (clienteSeleccionado === "nuevo") {
            setFormData((prev) => ({
                ...prev,
                clienteId: "",
                clienteNombre: "",
                clienteTelefono: "",
                clienteEmail: "",
                direccion: "",
                ciudad: "Bogotá",
            }));
        }
    }, [clienteSeleccionado, clientes]);

    const cargarDatos = async () => {
        try {
            const [empleadosData, clientesData, metodosData, serviciosData, categoriasData] = await Promise.all([
                obtenerEmpleados({ activo: true }),
                obtenerClientes(),
                obtenerMetodosPago(),
                obtenerServicios(),
                obtenerCategorias()
            ]);
            setEmpleados(empleadosData);
            setClientes(clientesData);
            setMetodosPagoDisponibles(metodosData);
            setServiciosDisponibles(serviciosData);
            setCategorias(categoriasData);
        } catch (error) {
            console.error("Error cargando datos:", error);
            toast({ title: "Error", description: "No se pudieron cargar los datos iniciales", variant: "destructive" });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Determinar duración
            const selectedService = serviciosDisponibles.find(s => s.$id === formData.servicioId);
            let duracionEstimada = 60; // Default

            if (selectedService && selectedService.duracionEstimada > 0) {
                // Si el servicio tiene duración fija configurada, usarla
                duracionEstimada = selectedService.duracionEstimada;
            } else {
                // Si no, intentar calcular (útil para limpieza)
                duracionEstimada = calcularDuracionEstimada({
                    tipoPropiedad: formData.tipoPropiedad,
                    metrosCuadrados: formData.metrosCuadrados || 0,
                    habitaciones: formData.habitaciones || 0,
                    tipoServicio: "basico",
                });
            }

            const { precioCliente, ...rest } = formData;

            const response = await crearCita({
                ...formData,
                duracionEstimada,
                precioCliente: Number(formData.precioCliente),
                categoriaSeleccionada: categoriaSeleccionada || undefined
            });

            if (response.success) {
                toast({
                    title: "✨ Cita Agendada",
                    description: "La cita se ha creado exitosamente",
                    className: "bg-green-50 border-green-200"
                });
                router.push("/admin/citas");
            } else {
                toast({ title: "Error", description: response.error || "Error al crear la cita", variant: "destructive" });
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message || "Error inesperado", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const toggleEmpleado = (empleadoId: string) => {
        setFormData((prev) => ({
            ...prev,
            empleadosAsignados: prev.empleadosAsignados.includes(empleadoId)
                ? prev.empleadosAsignados.filter((id) => id !== empleadoId)
                : [...prev.empleadosAsignados, empleadoId],
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 pb-20">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header Premium */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 shadow-2xl text-white">
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-4">
                            <Link href="/admin/citas">
                                <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md transition-all">
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Nueva Cita</h1>
                                <p className="text-violet-100 mt-1">Agendar un servicio manualmente</p>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                                <Sparkles className="w-4 h-4 text-yellow-300" />
                                <span className="text-sm font-medium">Servicio Premium</span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Columna Izquierda: Detalles Principales */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 1. Cliente */}
                        <Card className="border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100/50">
                                <CardTitle className="flex items-center gap-2 text-blue-700">
                                    <User className="w-5 h-5" />
                                    Información del Cliente
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold text-gray-700">Seleccionar Cliente</Label>
                                    <div className="relative">
                                        <select
                                            value={clienteSeleccionado}
                                            onChange={(e) => setClienteSeleccionado(e.target.value)}
                                            className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        >
                                            <option value="">-- Buscar Cliente --</option>
                                            <option value="nuevo" className="font-bold text-green-600">+ Crear Nuevo Cliente</option>
                                            {clientes.map((cliente) => (
                                                <option key={cliente.$id} value={cliente.$id}>
                                                    {cliente.nombre} - {cliente.telefono}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                            <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                        </div>
                                    </div>
                                </div>

                                {(clienteSeleccionado === "nuevo" || !clienteSeleccionado) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                                        <div className="col-span-2 space-y-2">
                                            <Label htmlFor="clienteNombre">Nombre Completo *</Label>
                                            <Input
                                                id="clienteNombre"
                                                required
                                                className="h-11 bg-white"
                                                value={formData.clienteNombre}
                                                onChange={(e) => setFormData({ ...formData, clienteNombre: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="clienteTelefono">Teléfono *</Label>
                                            <Input
                                                id="clienteTelefono"
                                                type="tel"
                                                required
                                                className="h-11 bg-white"
                                                value={formData.clienteTelefono}
                                                onChange={(e) => setFormData({ ...formData, clienteTelefono: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="clienteEmail">Email *</Label>
                                            <Input
                                                id="clienteEmail"
                                                type="email"
                                                required
                                                className="h-11 bg-white"
                                                value={formData.clienteEmail}
                                                onChange={(e) => setFormData({ ...formData, clienteEmail: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 1.5 Selección de Servicio */}
                        <Card className="border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100/50">
                                <CardTitle className="flex items-center gap-2 text-purple-700">
                                    <Briefcase className="w-5 h-5" />
                                    Detalles del Servicio
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Filtrar por Categoría</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {categorias.map((cat) => {
                                                let Icon = Tag;
                                                const lower = cat.nombre.toLowerCase();
                                                if (lower.includes('residencial') || lower.includes('hogar') || lower.includes('casa')) Icon = Home;
                                                else if (lower.includes('comercial') || lower.includes('oficina') || lower.includes('edificio')) Icon = Building2;
                                                else if (lower.includes('especial') || lower.includes('unico')) Icon = Sparkles;

                                                const isSelected = categoriaSeleccionada === cat.nombre;

                                                return (
                                                    <div
                                                        key={cat.$id}
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setCategoriaSeleccionada(null);
                                                            } else {
                                                                setCategoriaSeleccionada(cat.nombre);
                                                                setFormData(prev => ({ ...prev, servicioId: "", precioCliente: 50000 }));
                                                            }
                                                        }}
                                                        className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02] ${isSelected
                                                            ? 'border-purple-600 bg-purple-50 shadow-md ring-2 ring-purple-100'
                                                            : 'border-gray-100 bg-white hover:border-purple-200 hover:shadow-sm'
                                                            }`}
                                                    >
                                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                                                        <span className={`font-semibold text-xs text-center ${isSelected ? 'text-purple-700' : 'text-gray-600'}`}>
                                                            {cat.nombre}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-semibold text-gray-700">Seleccionar Servicio *</Label>
                                        <select
                                            value={formData.servicioId}
                                            onChange={(e) => {
                                                const selectedId = e.target.value;
                                                const selectedService = serviciosDisponibles.find(s => s.$id === selectedId);

                                                setFormData(prev => ({
                                                    ...prev,
                                                    servicioId: selectedId,
                                                    precioCliente: selectedService?.precioBase || prev.precioCliente,
                                                    detallesAdicionales: (!prev.detallesAdicionales && selectedService?.descripcionCorta)
                                                        ? selectedService.descripcionCorta
                                                        : prev.detallesAdicionales
                                                }));
                                            }}
                                            required
                                            className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                        >
                                            <option value="">-- {categoriaSeleccionada ? `Servicios de ${categoriaSeleccionada}` : 'Todos los Servicios'} --</option>

                                            {serviciosDisponibles
                                                .filter(s => {
                                                    if (!categoriaSeleccionada) return true;
                                                    const cats = s.categorias || [];
                                                    return cats.includes(categoriaSeleccionada) || s.categoria === categoriaSeleccionada;
                                                })
                                                .map((servicio) => (
                                                    <option key={servicio.$id} value={servicio.$id}>
                                                        {servicio.nombre} {servicio.precioBase > 0 ? `- $${servicio.precioBase.toLocaleString()}` : ''}
                                                    </option>
                                                ))}
                                        </select>
                                        {categoriaSeleccionada && serviciosDisponibles.filter(s => (s.categorias || []).includes(categoriaSeleccionada) || s.categoria === categoriaSeleccionada).length === 0 && (
                                            <p className="text-xs text-amber-600 mt-1">No hay servicios en esta categoría.</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Ubicación */}
                        <Card className="border-0 shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
                            <CardHeader className="bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100/50">
                                <CardTitle className="flex items-center gap-2 text-emerald-700">
                                    <MapPin className="w-5 h-5" />
                                    Ubicación del Servicio
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="direccion">Dirección *</Label>
                                        <Input
                                            id="direccion"
                                            required
                                            className="h-11"
                                            value={formData.direccion}
                                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="ciudad">Ciudad *</Label>
                                        <Input
                                            id="ciudad"
                                            required
                                            className="h-11"
                                            value={formData.ciudad}
                                            onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="tipoPropiedad">Tipo de Propiedad *</Label>
                                    <div className="grid grid-cols-4 gap-3">
                                        {["casa", "apartamento", "oficina", "local"].map((tipo) => (
                                            <div
                                                key={tipo}
                                                onClick={() => setFormData({ ...formData, tipoPropiedad: tipo as TipoPropiedad })}
                                                className={`cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${formData.tipoPropiedad === tipo
                                                    ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold"
                                                    : "border-gray-100 hover:border-emerald-200 text-gray-600"
                                                    }`}
                                            >
                                                <Home className={`w-6 h-6 mx-auto mb-1 ${formData.tipoPropiedad === tipo ? "text-emerald-600" : "text-gray-400"}`} />
                                                <span className="capitalize text-sm">{tipo}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>



                                {/* Campos opcionales solo para servicios de limpieza/residencial */}
                                {(() => {
                                    const selectedService = serviciosDisponibles.find(s => s.$id === formData.servicioId);
                                    // Mostrar si es categoría residencial o comercial, o si no hay servicio seleccionado (default behavior)
                                    const showPropertyDetails = !formData.servicioId ||
                                        selectedService?.categoria === "residencial" ||
                                        selectedService?.categoria === "comercial" ||
                                        selectedService?.slug?.includes("limpieza");

                                    if (showPropertyDetails) {
                                        return (
                                            <div className="grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                                <div className="space-y-2">
                                                    <Label htmlFor="metrosCuadrados">M² <span className="text-gray-400 font-normal">(Opcional)</span></Label>
                                                    <Input
                                                        id="metrosCuadrados"
                                                        type="number"
                                                        min="0"
                                                        className="h-11"
                                                        value={formData.metrosCuadrados || ""}
                                                        onChange={(e) => setFormData({ ...formData, metrosCuadrados: Number(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="habitaciones">Habitaciones <span className="text-gray-400 font-normal">(Opcional)</span></Label>
                                                    <Input
                                                        id="habitaciones"
                                                        type="number"
                                                        min="0"
                                                        className="h-11"
                                                        value={formData.habitaciones || ""}
                                                        onChange={(e) => setFormData({ ...formData, habitaciones: Number(e.target.value) })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="banos">Baños <span className="text-gray-400 font-normal">(Opcional)</span></Label>
                                                    <Input
                                                        id="banos"
                                                        type="number"
                                                        min="0"
                                                        className="h-11"
                                                        value={formData.banos || ""}
                                                        onChange={(e) => setFormData({ ...formData, banos: Number(e.target.value) })}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna Derecha: Configuración y Pago */}
                    <div className="space-y-8">
                        {/* 3. Fecha y Tiempo */}
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-50 to-white border-b border-indigo-100/50">
                                <CardTitle className="flex items-center gap-2 text-indigo-700">
                                    <Calendar className="w-5 h-5" />
                                    Fecha y Hora
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="fechaCita">Fecha del Servicio *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="fechaCita"
                                            type="date"
                                            required
                                            className="pl-10 h-12 text-base"
                                            value={formData.fechaCita}
                                            onChange={(e) => setFormData({ ...formData, fechaCita: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="horaCita">Hora de Inicio *</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="horaCita"
                                            type="time"
                                            required
                                            className="pl-10 h-12 text-base"
                                            value={formData.horaCita}
                                            onChange={(e) => setFormData({ ...formData, horaCita: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4. Empleados */}
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b border-orange-100/50">
                                <CardTitle className="flex items-center gap-2 text-orange-700">
                                    <User className="w-5 h-5" />
                                    Asignar Personal
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-3">
                                    {(() => {
                                        // Filter employees based on selected service
                                        const selectedService = formData.servicioId
                                            ? serviciosDisponibles.find(s => s.$id === formData.servicioId)
                                            : null;

                                        const empleadosFiltrados = selectedService
                                            ? empleados.filter(empleado => {
                                                const especialidadesLower = empleado.especialidades.map(e => e.toLowerCase());
                                                const serviceNameLower = selectedService.nombre.toLowerCase();
                                                const serviceCategorias = selectedService.categorias || [selectedService.categoria];

                                                // Match if specialties include service name OR any service category
                                                return especialidadesLower.some(esp =>
                                                    esp.includes(serviceNameLower) ||
                                                    serviceNameLower.includes(esp) ||
                                                    serviceCategorias.some((cat: string) =>
                                                        esp.includes(cat.toLowerCase()) ||
                                                        cat.toLowerCase().includes(esp)
                                                    )
                                                );
                                            })
                                            : empleados;

                                        if (empleadosFiltrados.length === 0 && selectedService) {
                                            return (
                                                <div className="text-center py-8 px-4">
                                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                                                        <p className="text-sm font-medium text-amber-800">
                                                            No hay empleados especializados en "{selectedService.nombre}"
                                                        </p>
                                                        <p className="text-xs text-amber-600 mt-1">
                                                            Puedes asignar el servicio sin personal o seleccionar otro servicio
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <>
                                                {selectedService && (
                                                    <p className="text-xs text-blue-600 font-medium mb-2">
                                                        Mostrando {empleadosFiltrados.length} especialista{empleadosFiltrados.length !== 1 ? 's' : ''} para "{selectedService.nombre}"
                                                    </p>
                                                )}
                                                <div className="max-h-60 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                                    {empleadosFiltrados.map((empleado) => (
                                                        <label
                                                            key={empleado.$id}
                                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${formData.empleadosAsignados.includes(empleado.$id)
                                                                ? "bg-orange-50 border-orange-200 shadow-sm"
                                                                : "bg-white border-gray-100 hover:border-gray-200"
                                                                }`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${formData.empleadosAsignados.includes(empleado.$id)
                                                                    ? "bg-orange-500 text-white"
                                                                    : "bg-gray-100 text-gray-500"
                                                                    }`}>
                                                                    {empleado.nombre.charAt(0)}{empleado.apellido.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-sm text-gray-900">{empleado.nombre} {empleado.apellido}</p>
                                                                    <p className="text-xs text-gray-500">{empleado.cargo}</p>
                                                                </div>
                                                            </div>
                                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.empleadosAsignados.includes(empleado.$id)
                                                                ? "bg-orange-500 border-orange-500"
                                                                : "border-gray-300"
                                                                }`}>
                                                                {formData.empleadosAsignados.includes(empleado.$id) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={formData.empleadosAsignados.includes(empleado.$id)}
                                                                onChange={() => toggleEmpleado(empleado.$id)}
                                                            />
                                                        </label>
                                                    ))}
                                                </div>
                                            </>
                                        );
                                    })()}
                                    <p className="text-xs text-center text-gray-500 pt-2">
                                        {formData.empleadosAsignados.length} empleados seleccionados
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 4.5 Notas y Detalles */}
                        <Card className="border-0 shadow-lg overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-teal-50 to-white border-b border-teal-100/50">
                                <CardTitle className="flex items-center gap-2 text-teal-700">
                                    <FileText className="w-5 h-5" />
                                    Notas y Detalles
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="detallesAdicionales">Detalles Adicionales del Servicio</Label>
                                    <textarea
                                        id="detallesAdicionales"
                                        rows={3}
                                        value={formData.detallesAdicionales}
                                        onChange={(e) => setFormData({ ...formData, detallesAdicionales: e.target.value })}
                                        className="flex w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Instrucciones especiales, códigos de acceso, etc."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="notasInternas" className="text-gray-500 text-xs uppercase font-bold tracking-wider">Notas Internas (Admin)</Label>
                                    <textarea
                                        id="notasInternas"
                                        rows={2}
                                        value={formData.notasInternas}
                                        onChange={(e) => setFormData({ ...formData, notasInternas: e.target.value })}
                                        className="flex w-full rounded-xl border border-yellow-200 bg-yellow-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Solo visible para administradores"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* 5. Pago */}
                        <Card className="border-0 shadow-lg overflow-hidden bg-gray-900 text-white">
                            <CardHeader className="border-b border-gray-800">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <DollarSign className="w-5 h-5" />
                                    Detalles de Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="precioCliente" className="text-gray-300">Precio Total (COP)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                                        <Input
                                            id="precioCliente"
                                            type="number"
                                            required
                                            min="1000"
                                            className="pl-10 h-12 text-lg font-bold bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 focus:ring-emerald-500"
                                            value={formData.precioCliente}
                                            onChange={(e) => setFormData({ ...formData, precioCliente: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="metodoPago" className="text-gray-300">Método de Pago</Label>
                                    <select
                                        id="metodoPago"
                                        required
                                        value={formData.metodoPago}
                                        onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value as MetodoPago })}
                                        className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        {metodosPagoDisponibles.length > 0 ? (
                                            metodosPagoDisponibles.map((mp) => (
                                                <option key={mp.$id} value={mp.nombre}>
                                                    {mp.nombre}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="efectivo">Efectivo</option>
                                                <option value="transferencia">Transferencia Bancaria</option>
                                                <option value="nequi">Nequi</option>
                                                <option value="bancolombia">Bancolombia</option>
                                                <option value="por_cobrar">Por Cobrar (Crédito)</option>
                                            </>
                                        )}
                                    </select>
                                </div>

                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 rounded-xl"
                                    >
                                        {loading ? (
                                            "Procesando..."
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5 mr-2" />
                                                Crear Cita
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </form >
            </div >
        </div >
    );
}
