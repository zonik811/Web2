"use client";

import { useState } from "react";
import { Car, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { VehiculoForm } from "./VehiculoForm";
import type { Vehiculo, CrearVehiculoInput } from "@/types";
import { crearVehiculo } from "@/lib/actions/vehiculos";

interface VehiculoSelectorProps {
    clienteId: string;
    vehiculos: Vehiculo[];
    vehiculoSeleccionado?: Vehiculo | null;
    onVehiculoSelect: (vehiculo: Vehiculo | null) => void;
    onVehiculoCreated?: (vehiculo: Vehiculo) => void;
}

export function VehiculoSelector({
    clienteId,
    vehiculos: initialVehiculos,
    vehiculoSeleccionado,
    onVehiculoSelect,
    onVehiculoCreated
}: VehiculoSelectorProps) {
    const [openNewVehicle, setOpenNewVehicle] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    // Local state for vehicles to immediately show newly created ones
    const [vehiculos, setVehiculos] = useState<Vehiculo[]>(initialVehiculos);

    // Sync prop changes if needed (e.g. if parent refetches)
    // useEffect(() => { setVehiculos(initialVehiculos) }, [initialVehiculos]); 
    // Usually better to let parent manage list, but for simplicity we can just call callback

    const handleCreateVehiculo = async (data: CrearVehiculoInput) => {
        setIsCreating(true);
        try {
            const result = await crearVehiculo(data);
            if (result.success && result.data) {
                // Update local list
                setVehiculos([...vehiculos, result.data]);
                // Select it
                onVehiculoSelect(result.data);
                // Notify parent
                onVehiculoCreated?.(result.data);
                // Close modal
                setOpenNewVehicle(false);
            } else {
                alert("Error al crear vehículo: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Error al crear vehículo");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header / Actions */}
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">
                    Vehículos registrados ({vehiculos.length})
                </span>
                <Dialog open={openNewVehicle} onOpenChange={setOpenNewVehicle}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 border-dashed">
                            <Plus className="h-4 w-4" />
                            Nuevo Vehículo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Registrar Nuevo Vehículo</DialogTitle>
                        </DialogHeader>
                        <VehiculoForm
                            clienteId={clienteId}
                            onSubmit={handleCreateVehiculo}
                            onCancel={() => setOpenNewVehicle(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            {/* List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vehiculos.map((vehiculo) => {
                    const isSelected = vehiculoSeleccionado?.$id === vehiculo.$id;
                    return (
                        <div
                            key={vehiculo.$id}
                            onClick={() => onVehiculoSelect(vehiculo)}
                            className={`
                                relative cursor-pointer rounded-xl p-4 border-2 transition-all duration-200
                                ${isSelected
                                    ? "border-primary bg-primary/5 shadow-md"
                                    : "border-slate-100 bg-white hover:border-primary/30 hover:shadow-sm"
                                }
                            `}
                        >
                            {isSelected && (
                                <div className="absolute top-2 right-2 h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white shadow-sm">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-primary/20 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                                    <Car className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 leading-tight">
                                        {vehiculo.marca} {vehiculo.modelo}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                            {vehiculo.placa}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {vehiculo.ano}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {vehiculos.length === 0 && (
                    <div className="col-span-full py-8 text-center border-2 border-dashed rounded-xl border-slate-200 bg-slate-50/50">
                        <Car className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 font-medium">No hay vehículos registrados</p>
                        <p className="text-xs text-slate-400">Agrega uno nuevo para continuar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
