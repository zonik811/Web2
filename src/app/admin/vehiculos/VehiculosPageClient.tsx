"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Car,
    Edit,
    Fuel,
    Gauge,
    Palette,
    Calendar,
    TrendingUp,
    Wrench
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useDebounce } from "use-debounce";
import { obtenerVehiculos, buscarVehiculos, crearVehiculo, actualizarVehiculo } from "@/lib/actions/vehiculos";
import { VehiculoForm } from "@/components/ordenes-trabajo/VehiculoForm";
import type { Vehiculo, CrearVehiculoInput } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function VehiculosPageClient() {
    const router = useRouter();
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch] = useDebounce(searchTerm, 300);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);

    useEffect(() => {
        const loadVehiculos = async () => {
            setIsLoading(true);
            try {
                let data;
                if (debouncedSearch.length > 2) {
                    data = await buscarVehiculos(debouncedSearch);
                } else {
                    data = await obtenerVehiculos();
                }
                setVehiculos(data);
            } catch (error) {
                console.error("Error loading vehicles", error);
                toast.error("Error al cargar vehículos");
            } finally {
                setIsLoading(false);
            }
        };

        loadVehiculos();
    }, [debouncedSearch]);

    const handleCreate = async (data: CrearVehiculoInput) => {
        try {
            const result = await crearVehiculo(data);
            if (result.success && result.data) {
                setVehiculos([result.data, ...vehiculos]);
                setIsCreateOpen(false);
                toast.success("Vehículo creado exitosamente");
                router.refresh();
            } else {
                toast.error(result.error || "Error al crear vehículo");
            }
        } catch (error) {
            toast.error("Error inesperado al crear");
        }
    };

    const handleUpdate = async (data: CrearVehiculoInput) => {
        if (!editingVehiculo) return;
        try {
            const result = await actualizarVehiculo(editingVehiculo.$id, data);
            if (result.success) {
                setVehiculos(vehiculos.map(v =>
                    v.$id === editingVehiculo.$id ? { ...v, ...data } as unknown as Vehiculo : v
                ));
                setEditingVehiculo(null);
                toast.success("Vehículo actualizado");
                router.refresh();
            } else {
                toast.error(result.error || "Error al actualizar");
            }
        } catch (error) {
            toast.error("Error inesperado al actualizar");
        }
    };

    const getFuelColor = (type: string) => {
        switch (type) {
            case 'DIESEL': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'GASOLINA': return 'bg-green-100 text-green-700 border-green-300';
            case 'HIBRIDO': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'ELECTRICO': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
            default: return 'bg-slate-100 text-slate-700 border-slate-300';
        }
    };

    // Calculate stats
    const stats = {
        total: vehiculos.length,
        diesel: vehiculos.filter(v => v.tipoCombustible === 'DIESEL').length,
        gasolina: vehiculos.filter(v => v.tipoCombustible === 'GASOLINA').length,
        hibrido: vehiculos.filter(v => v.tipoCombustible === 'HIBRIDO').length,
        avgKm: vehiculos.length > 0
            ? Math.round(vehiculos.reduce((sum, v) => sum + v.kilometraje, 0) / vehiculos.length)
            : 0,
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="h-16 w-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Cargando vehículos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
            {/* Epic Header */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-50/50 via-blue-50/50 to-indigo-50/50" />
                <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />

                <div className="relative px-6 pt-8 pb-12">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg">
                                    <Car className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        Gestión de Vehículos
                                    </h1>
                                    <p className="text-slate-600 font-medium mt-1">
                                        Administra la flota vehicular completa ({vehiculos.length} vehículos)
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-cyan-100 text-sm font-semibold uppercase tracking-wider">Total Flota</p>
                                                <p className="text-5xl font-black mt-2">{stats.total}</p>
                                                <p className="text-xs text-cyan-100 mt-1">Vehículos registrados</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <Car className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-100 text-sm font-semibold uppercase tracking-wider">Gasolina</p>
                                                <p className="text-5xl font-black mt-2">{stats.gasolina}</p>
                                                <p className="text-xs text-green-100 mt-1">Vehículos a gasolina</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <Fuel className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider">Diesel</p>
                                                <p className="text-5xl font-black mt-2">{stats.diesel}</p>
                                                <p className="text-xs text-blue-100 mt-1">Vehículos diesel</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <Fuel className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white hover:shadow-xl transition-shadow">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                                    <CardContent className="p-6 relative">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-orange-100 text-sm font-semibold uppercase tracking-wider">Km Promedio</p>
                                                <p className="text-4xl font-black mt-2">{stats.avgKm.toLocaleString()}</p>
                                                <p className="text-xs text-orange-100 mt-1">Kilometraje medio</p>
                                            </div>
                                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur">
                                                <Gauge className="h-8 w-8" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Action Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-3"
                        >
                            <Button
                                size="lg"
                                onClick={() => setIsCreateOpen(true)}
                                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all border-0"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                Nuevo Vehículo
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Search Bar */}
                    <Card className="shadow-lg border-slate-200 mb-6">
                        <CardContent className="p-6">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    placeholder="Buscar por placa, marca, modelo, color..."
                                    className="pl-11 h-12 bg-slate-50 border-slate-300 focus:bg-white transition-colors text-base"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vehicles Table */}
                    <Card className="shadow-xl border-slate-200">
                        {vehiculos.length === 0 && !isLoading ? (
                            <CardContent className="p-12">
                                <div className="text-center">
                                    <div className="bg-slate-50 p-6 rounded-full shadow-inner inline-block mb-4">
                                        <Car className="h-16 w-16 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">No se encontraron vehículos</h3>
                                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                        {searchTerm
                                            ? `No hay resultados para "${searchTerm}"`
                                            : "La flota está vacía. Comienza registrando un vehículo."}
                                    </p>
                                    {!searchTerm && (
                                        <Button
                                            variant="outline"
                                            className="border-slate-300 shadow-md"
                                            onClick={() => setIsCreateOpen(true)}
                                        >
                                            <Plus className="h-4 w-4 mr-2" />
                                            Registrar Primer Vehículo
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        ) : (
                            <CardContent className="p-6">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold text-slate-800">Flota Vehicular</h3>
                                    <p className="text-sm text-slate-500 mt-1">Listado completo de vehículos registrados</p>
                                </div>
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-gradient-to-r from-slate-50 to-cyan-50">
                                            <TableRow>
                                                <TableHead className="w-[300px] pl-6 py-4 font-bold text-slate-700">Vehículo</TableHead>
                                                <TableHead className="font-bold text-slate-700">Placa</TableHead>
                                                <TableHead className="font-bold text-slate-700">Detalles</TableHead>
                                                <TableHead className="font-bold text-slate-700">Kilometraje</TableHead>
                                                <TableHead className="text-right pr-6 font-bold text-slate-700">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {vehiculos.map((vehiculo, index) => (
                                                <motion.tr
                                                    key={vehiculo.$id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    className="hover:bg-cyan-50/50 transition-colors border-b border-slate-100 last:border-0 group"
                                                >
                                                    <TableCell className="pl-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                                                                <Car className="h-7 w-7" />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                                                                    {vehiculo.marca} {vehiculo.modelo}
                                                                </p>
                                                                <p className="text-sm text-slate-500 flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    Año {vehiculo.ano}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-mono font-bold text-base bg-slate-50 text-slate-700 border-slate-300 px-3 py-1.5">
                                                            {vehiculo.placa}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-2">
                                                            <Badge className={`inline-flex items-center gap-1.5 w-fit font-semibold ${getFuelColor(vehiculo.tipoCombustible)}`}>
                                                                <Fuel className="h-3 w-3" />
                                                                {vehiculo.tipoCombustible}
                                                            </Badge>
                                                            {vehiculo.color && (
                                                                <span className="inline-flex items-center gap-1.5 text-slate-600 text-sm">
                                                                    <Palette className="h-3 w-3" />
                                                                    {vehiculo.color}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-2 bg-orange-100 rounded-lg">
                                                                <Gauge className="h-4 w-4 text-orange-600" />
                                                            </div>
                                                            <span className="text-slate-900 font-mono font-semibold">
                                                                {vehiculo.kilometraje.toLocaleString()} km
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => setEditingVehiculo(vehiculo)}
                                                            className="h-10 w-10 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-full transition-all shadow-sm"
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </Button>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>

            {/* Modal Crear */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            Registrar Nuevo Vehículo
                        </DialogTitle>
                    </DialogHeader>
                    <VehiculoForm
                        onSubmit={handleCreate}
                        onCancel={() => setIsCreateOpen(false)}
                    />
                </DialogContent>
            </Dialog>

            {/* Modal Editar */}
            <Dialog open={!!editingVehiculo} onOpenChange={(open) => !open && setEditingVehiculo(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                            Editar Vehículo
                        </DialogTitle>
                    </DialogHeader>
                    {editingVehiculo && (
                        <VehiculoForm
                            clienteId={editingVehiculo.clienteId}
                            initialData={editingVehiculo}
                            onSubmit={handleUpdate}
                            onCancel={() => setEditingVehiculo(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
