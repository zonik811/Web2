"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Search,
    Car,
    MoreHorizontal,
    Edit,
    Trash2,
    Fuel,
    Gauge,
    Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

export default function VehiculosPageClient() {
    const router = useRouter();
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch] = useDebounce(searchTerm, 300);

    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingVehiculo, setEditingVehiculo] = useState<Vehiculo | null>(null);

    // Initial load & Search
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
                // Optimistic update
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
            case 'DIESEL': return 'text-blue-600 bg-blue-50';
            case 'GASOLINA': return 'text-green-600 bg-green-50';
            case 'HIBRIDO': return 'text-purple-600 bg-purple-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vehículos</h1>
                    <p className="text-slate-500 mt-1">Gestión completa de la flota vehicular</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 transition-all hover:scale-105">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Vehículo
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por placa, marca, modelo..."
                        className="pl-9 border-slate-200 bg-slate-50 focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-[300px]">Vehículo</TableHead>
                            <TableHead>Placa</TableHead>
                            <TableHead>Detalles</TableHead>
                            <TableHead>Kilometraje</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><div className="h-12 w-48 bg-slate-100 rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-6 w-20 bg-slate-100 rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-6 w-32 bg-slate-100 rounded animate-pulse" /></TableCell>
                                    <TableCell><div className="h-6 w-24 bg-slate-100 rounded animate-pulse" /></TableCell>
                                    <TableCell className="text-right"><div className="h-8 w-8 bg-slate-100 rounded-full inline-block animate-pulse" /></TableCell>
                                </TableRow>
                            ))
                        ) : vehiculos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                    No se encontraron vehículos.
                                </TableCell>
                            </TableRow>
                        ) : (
                            vehiculos.map((vehiculo) => (
                                <TableRow key={vehiculo.$id} className="hover:bg-slate-50/50 transition-colors">
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                                <Car className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{vehiculo.marca} {vehiculo.modelo}</p>
                                                <p className="text-sm text-slate-500">{vehiculo.ano}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono bg-slate-50 text-slate-700 border-slate-200">
                                            {vehiculo.placa}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs w-fit ${getFuelColor(vehiculo.tipoCombustible)}`}>
                                                <Fuel className="h-3 w-3" /> {vehiculo.tipoCombustible}
                                            </span>
                                            {vehiculo.color && (
                                                <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                                                    <Palette className="h-3 w-3" /> {vehiculo.color}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-slate-600 font-mono text-sm">
                                            <Gauge className="h-4 w-4 text-slate-400" />
                                            {vehiculo.kilometraje.toLocaleString()} km
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Abrir menú</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingVehiculo(vehiculo)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Editar
                                                </DropdownMenuItem>
                                                {/* <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Eliminar
                                                </DropdownMenuItem> */}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal Crear */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Registrar Nuevo Vehículo</DialogTitle>
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
                        <DialogTitle>Editar Vehículo</DialogTitle>
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
