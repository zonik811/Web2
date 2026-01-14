"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "../ImageUploader";
import { Wrench } from "lucide-react";
import { crearActividad } from "@/lib/actions/ot-actividades";
import type { CrearOtActividadInput } from "@/types";

interface RegistrarActividadDialogProps {
    procesoId: string;
    ordenId: string;
    empleadoId: string;
    onActividadCreated: () => void;
}

export function RegistrarActividadDialog({
    procesoId,
    ordenId,
    empleadoId,
    onActividadCreated
}: RegistrarActividadDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [descripcion, setDescripcion] = useState("");
    const [notas, setNotas] = useState("");
    const [horasTrabajadas, setHorasTrabajadas] = useState(0);
    const [imagenes, setImagenes] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Llamar a server action
            const data: CrearOtActividadInput = {
                procesoId,
                ordenTrabajoId: ordenId,
                descripcion,
                notas,
                empleadoId,
                horasTrabajadas,
                imagenes
            };

            const result = await crearActividad(data);

            if (result.success) {
                // Limpiar y cerrar
                setDescripcion("");
                setNotas("");
                setHorasTrabajadas(0);
                setImagenes([]);
                setOpen(false);
                onActividadCreated();
            } else {
                alert("Error al crear actividad: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <Wrench className="h-4 w-4" />
                    Registrar Actividad
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Registrar Actividad</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción del Trabajo *</Label>
                        <Textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="¿Qué se hizo?"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notas">Notas Adicionales</Label>
                        <Textarea
                            id="notas"
                            value={notas}
                            onChange={(e) => setNotas(e.target.value)}
                            placeholder="Observaciones, problemas encontrados, etc."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="horas">Horas Trabajadas *</Label>
                        <Input
                            id="horas"
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
                        label="Fotos del Trabajo (Opcional)"
                    />

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Actividad"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
