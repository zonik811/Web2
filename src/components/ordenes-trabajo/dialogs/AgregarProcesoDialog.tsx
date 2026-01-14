"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { CrearOtProcesoInput } from "@/types";
import { crearProceso } from "@/lib/actions/ot-procesos";

interface AgregarProcesoDialogProps {
    ordenId: string;
    empleados?: any[];
    onProcesoCreated: () => void;
}

export function AgregarProcesoDialog({
    ordenId,
    empleados = [],
    onProcesoCreated
}: AgregarProcesoDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<CrearOtProcesoInput>>({
        ordenTrabajoId: ordenId,
        nombre: "",
        descripcion: "",
        orden: 1,
        tecnicoResponsableId: "",
        horasEstimadas: 0
    });


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const processData = {
                ...formData,
                ordenTrabajoId: ordenId,
                nombre: formData.nombre!,
                descripcion: formData.descripcion!,
                orden: formData.orden || 1,
                tecnicoResponsableId: formData.tecnicoResponsableId!,
                horasEstimadas: formData.horasEstimadas || 0,
            } as CrearOtProcesoInput;

            const result = await crearProceso(processData);

            if (result.success) {
                // Limpiar y cerrar
                setFormData({
                    ordenTrabajoId: ordenId,
                    nombre: "",
                    descripcion: "",
                    orden: 1,
                    tecnicoResponsableId: "",
                    horasEstimadas: 0,
                    tecnicoAuxiliarId: ""
                });
                setOpen(false);
                onProcesoCreated();
            } else {
                alert("Error al crear proceso: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error inesperado al crear proceso");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Agregar Proceso
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Nuevo Proceso</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre del Proceso *</Label>
                        <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Ej: Revisión de motor"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción *</Label>
                        <Textarea
                            id="descripcion"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            placeholder="Detalle del trabajo a realizar"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="orden">Orden de Ejecución</Label>
                            <Input
                                id="orden"
                                type="number"
                                value={formData.orden}
                                onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) })}
                                min="1"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="horas">Horas Estimadas *</Label>
                            <Input
                                id="horas"
                                type="number"
                                step="0.5"
                                value={formData.horasEstimadas}
                                onChange={(e) => setFormData({ ...formData, horasEstimadas: parseFloat(e.target.value) })}
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tecnico">Técnico Responsable *</Label>
                        <Select
                            value={formData.tecnicoResponsableId}
                            onValueChange={(value) => setFormData({ ...formData, tecnicoResponsableId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar técnico" />
                            </SelectTrigger>
                            <SelectContent>
                                {empleados.length === 0 ? (
                                    <SelectItem value="temp">Sin empleados</SelectItem>
                                ) : (
                                    empleados.map((emp) => (
                                        <SelectItem key={emp.$id} value={emp.$id}>
                                            {emp.nombre} {emp.apellido}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="auxiliar">Técnico Auxiliar (Opcional)</Label>
                        <Select
                            value={formData.tecnicoAuxiliarId || "none"}
                            onValueChange={(value) => setFormData({ ...formData, tecnicoAuxiliarId: value === "none" ? "" : value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Sin auxiliar" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sin auxiliar</SelectItem>
                                {empleados.map((emp) => (
                                    <SelectItem key={emp.$id} value={emp.$id}>
                                        {emp.nombre} {emp.apellido}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creando..." : "Crear Proceso"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
