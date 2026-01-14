"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardCheck } from "lucide-react";
import { registrarPrueba } from "@/lib/actions/ot-pruebas";
import type { CrearOtPruebaInput, ResultadoPrueba } from "@/types";

interface RegistrarPruebaDialogProps {
    procesoId: string;
    ordenId: string;
    empleadoId: string; // Técnico que registra
    onPruebaRegistrada: () => void;
}

export function RegistrarPruebaDialog({
    procesoId,
    ordenId,
    empleadoId,
    onPruebaRegistrada
}: RegistrarPruebaDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        tipoPrueba: "",
        resultado: "APROBADA" as ResultadoPrueba,
        observaciones: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data: CrearOtPruebaInput = {
                procesoId,
                ordenTrabajoId: ordenId,
                tecnicoId: empleadoId,
                tipoPrueba: formData.tipoPrueba,
                resultado: formData.resultado,
                observaciones: formData.observaciones,
                imagenes: [], // TODO: Implementar subida de imágenes
                videos: []
            };

            const result = await registrarPrueba(data);

            if (result.success) {
                setFormData({
                    tipoPrueba: "",
                    resultado: "APROBADA",
                    observaciones: ""
                });
                setOpen(false);
                onPruebaRegistrada();
            } else {
                alert("Error al registrar prueba: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    const TIPOS_PRUEBAS = [
        "Diagnóstico General",
        "Prueba de Ruta",
        "Escáner Electrónico",
        "Prueba de Compresión",
        "Inspección Visual",
        "Prueba de Frenos",
        "Prueba de Batería",
        "Otro"
    ];

    const handleTipoChange = (value: string) => {
        if (value === "Otro") {
            setFormData({ ...formData, tipoPrueba: "" });
        } else {
            setFormData({ ...formData, tipoPrueba: value });
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                    <ClipboardCheck className="h-4 w-4" />
                    Registrar Prueba
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Registrar Prueba de Calidad</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tipoPruebaSelect">Tipo de Prueba *</Label>
                        <Select
                            onValueChange={handleTipoChange}
                            defaultValue={TIPOS_PRUEBAS.includes(formData.tipoPrueba) ? formData.tipoPrueba : "Otro"}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione el tipo de prueba" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                {TIPOS_PRUEBAS.map((tipo) => (
                                    <SelectItem key={tipo} value={tipo}>
                                        {tipo}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {(!TIPOS_PRUEBAS.includes(formData.tipoPrueba) || formData.tipoPrueba === "") && (
                            <Input
                                id="tipoPrueba"
                                className="mt-2"
                                value={formData.tipoPrueba}
                                onChange={(e) => setFormData({ ...formData, tipoPrueba: e.target.value })}
                                placeholder="Especifique el tipo de prueba..."
                                required
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="resultado">Resultado *</Label>
                        <Select
                            value={formData.resultado}
                            onValueChange={(value) => setFormData({ ...formData, resultado: value as ResultadoPrueba })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione resultado" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="APROBADA">Aprobada ✅</SelectItem>
                                <SelectItem value="FALLIDA">Fallida ❌</SelectItem>
                                <SelectItem value="PENDIENTE">Pendiente ⚠️</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observaciones">Observaciones *</Label>
                        <Textarea
                            id="observaciones"
                            value={formData.observaciones}
                            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                            placeholder="Detalles del resultado..."
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Registrar Prueba"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
