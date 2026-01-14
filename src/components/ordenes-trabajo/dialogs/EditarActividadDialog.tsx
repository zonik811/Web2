"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "../ImageUploader";
import { Edit2 } from "lucide-react";
import { actualizarActividad } from "@/lib/actions/ot-actividades";
import type { OtActividad } from "@/types";

interface EditarActividadDialogProps {
    actividad: OtActividad;
    onActividadUpdated: () => void;
}

export function EditarActividadDialog({
    actividad,
    onActividadUpdated
}: EditarActividadDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [descripcion, setDescripcion] = useState(actividad.descripcion);
    const [notas, setNotas] = useState(actividad.notas || "");
    const [horasTrabajadas, setHorasTrabajadas] = useState(actividad.horasTrabajadas);
    const [imagenes, setImagenes] = useState<string[]>(actividad.imagenes || []);

    // Reset state when opening/changing activity
    useEffect(() => {
        if (open) {
            setDescripcion(actividad.descripcion);
            setNotas(actividad.notas || "");
            setHorasTrabajadas(actividad.horasTrabajadas);
            setImagenes(actividad.imagenes || []);
        }
    }, [open, actividad]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await actualizarActividad(actividad.$id, {
                descripcion,
                notas,
                horasTrabajadas,
                imagenes
            });

            if (result.success) {
                setOpen(false);
                onActividadUpdated();
            } else {
                alert("Error al actualizar actividad: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error inesperado al actualizar");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                    <Edit2 className="h-3 w-3" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Editar Actividad</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-descripcion">Descripción del Trabajo *</Label>
                        <Textarea
                            id="edit-descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="¿Qué se hizo?"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-notas">Notas Adicionales</Label>
                        <Textarea
                            id="edit-notas"
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Observaciones, problemas encontrados, etc."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-horas">Horas Trabajadas *</Label>
                        <Input
                            id="edit-horas"
                            type="number"
                            step="0.5"
                            value={horasTrabajadas}
                            onChange={(e) => setHorasTrabajadas(parseFloat(e.target.value))}
                            min="0"
                            required
                        />
                    </div>

                    <ImageUploader
                        maxImages={6}
                        onImagesChange={setImagenes}
                        initialImages={imagenes}
                        label="Fotos del Trabajo (Opcional)"
                    />

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
