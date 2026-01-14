"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CrearVehiculoInput, TipoVehiculo, TipoCombustible, Cliente } from "@/types";
import { ClienteSelector } from "@/components/ordenes-trabajo/ClienteSelector";
import { obtenerCliente } from "@/lib/actions/clientes";

interface VehiculoFormProps {
    clienteId?: string; // Optional now
    initialData?: Partial<CrearVehiculoInput>; // New prop for editing
    onSubmit: (data: CrearVehiculoInput) => void;
    onCancel: () => void;
}

export function VehiculoForm({ clienteId, initialData, onSubmit, onCancel }: VehiculoFormProps) {
    const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
    const [formData, setFormData] = useState<Partial<CrearVehiculoInput>>({
        clienteId: clienteId || initialData?.clienteId || "",
        marca: initialData?.marca || "",
        modelo: initialData?.modelo || "",
        ano: initialData?.ano || new Date().getFullYear(),
        placa: initialData?.placa || "",
        tipoVehiculo: initialData?.tipoVehiculo || "CAMION",
        tipoCombustible: initialData?.tipoCombustible || "DIESEL",
        kilometraje: initialData?.kilometraje || 0,
        color: initialData?.color || "",
        observaciones: initialData?.observaciones || "",
        vin: initialData?.vin || ""
    });

    // Sync initialData changes (Fix for Edit Mode)
    useEffect(() => {
        if (initialData) {
            setFormData({
                clienteId: initialData.clienteId || "",
                marca: initialData.marca || "",
                modelo: initialData.modelo || "",
                ano: initialData.ano || new Date().getFullYear(),
                placa: initialData.placa || "",
                tipoVehiculo: initialData.tipoVehiculo || "CAMION",
                tipoCombustible: initialData.tipoCombustible || "DIESEL",
                kilometraje: initialData.kilometraje || 0,
                color: initialData.color || "",
                observaciones: initialData.observaciones || "",
                vin: initialData.vin || ""
            });
            // Trigger client fetch for edit
            if (initialData.clienteId) {
                fetchCliente(initialData.clienteId);
            }
        }
    }, [initialData]);

    const fetchCliente = async (id: string) => {
        try {
            const cliente = await obtenerCliente(id);
            if (cliente) setSelectedCliente(cliente);
        } catch (error) {
            console.error("Error fetching client for vehicle form", error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: Client is required
        const finalClienteId = clienteId || formData.clienteId || selectedCliente?.$id;

        if (!finalClienteId) {
            alert("Por favor selecciona un cliente propietario del vehículo");
            return;
        }

        if (formData.marca && formData.modelo && formData.placa) {
            onSubmit({
                ...formData,
                clienteId: finalClienteId
            } as CrearVehiculoInput);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
            {!clienteId && (
                <Card className="bg-slate-50 border-slate-200">
                    <CardHeader>
                        <CardTitle className="text-primary font-semibold text-lg">Propietario del Vehículo *</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ClienteSelector
                            clientes={[]} // Empty because we rely on search
                            clienteSeleccionado={selectedCliente}
                            onClienteSelect={(c) => {
                                setSelectedCliente(c);
                                setFormData(prev => ({ ...prev, clienteId: c?.$id }));
                            }}
                            onNuevoCliente={() => { }}
                        />
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Datos Principales</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="placa">Placa *</Label>
                        <Input
                            id="placa"
                            value={formData.placa}
                            onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                            placeholder="ABC123"
                            className="uppercase font-mono tracking-wider bg-slate-50 border-slate-300 focus:border-primary focus:ring-primary"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="marca">Marca *</Label>
                        <Input
                            id="marca"
                            value={formData.marca}
                            onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                            placeholder="Toyota"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="modelo">Modelo *</Label>
                        <Input
                            id="modelo"
                            value={formData.modelo}
                            onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                            placeholder="Hilux"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="ano">Año *</Label>
                        <Input
                            id="ano"
                            type="number"
                            value={formData.ano}
                            onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
                            min="1900"
                            max={new Date().getFullYear() + 1}
                            required
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Detalles Técnicos y Estado</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tipoVehiculo">Tipo de Vehículo *</Label>
                        <Select
                            value={formData.tipoVehiculo}
                            onValueChange={(value) => setFormData({ ...formData, tipoVehiculo: value as TipoVehiculo })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CAMION">Camión</SelectItem>
                                <SelectItem value="PICKUP">Pickup</SelectItem>
                                <SelectItem value="BUS">Bus</SelectItem>
                                <SelectItem value="OTRO">Otro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tipoCombustible">Combustible *</Label>
                        <Select
                            value={formData.tipoCombustible}
                            onValueChange={(value) => setFormData({ ...formData, tipoCombustible: value as TipoCombustible })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DIESEL">Diesel</SelectItem>
                                <SelectItem value="GASOLINA">Gasolina</SelectItem>
                                <SelectItem value="HIBRIDO">Híbrido</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="kilometraje">Kilometraje Actual *</Label>
                        <div className="relative">
                            <Input
                                id="kilometraje"
                                type="number"
                                value={formData.kilometraje}
                                onChange={(e) => setFormData({ ...formData, kilometraje: parseInt(e.target.value) })}
                                min="0"
                                required
                                className="pl-8"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">km</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input
                            id="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            placeholder="Blanco"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="vin">VIN / Número de Serie</Label>
                <Input
                    id="vin"
                    value={formData.vin || ""}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                    placeholder="Opcional"
                    className="font-mono text-sm"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Detalles adicionales, daños preexistentes, etc."
                    rows={3}
                />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    Guardar Vehículo
                </Button>
            </div>
        </form>
    );
}
