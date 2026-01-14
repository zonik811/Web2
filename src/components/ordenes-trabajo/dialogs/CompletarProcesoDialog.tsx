"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import { completarProceso } from "@/lib/actions/ot-procesos";

interface CompletarProcesoDialogProps {
    procesoId: string;
    horasEstimadas: number;
    horasRegistradas?: number;
    tarifaSugerida?: number;
    onProcesoCompletado: () => void;
}

export function CompletarProcesoDialog({
    procesoId,
    horasEstimadas,
    horasRegistradas = 0,
    tarifaSugerida = 50000,
    onProcesoCompletado
}: CompletarProcesoDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    // Sugerir el mayor entre lo estimado y lo ya registrado
    const [horasReales, setHorasReales] = useState(Math.max(horasEstimadas, horasRegistradas));
    const [costoHora, setCostoHora] = useState(tarifaSugerida);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await completarProceso(procesoId, horasReales, costoHora);

            if (result.success) {
                setOpen(false);
                onProcesoCompletado();
            } else {
                alert("Error al completar proceso: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 ml-auto">
                    <CheckCircle className="h-4 w-4" />
                    Completar
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Completar Proceso</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mb-4">
                        Confirma las horas reales y la tarifa para calcular el costo de mano de obra final.
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="horasReales">Horas Reales *</Label>
                            <Input
                                id="horasReales"
                                type="number"
                                step="0.5"
                                value={horasReales}
                                onChange={(e) => setHorasReales(parseFloat(e.target.value))}
                                min="0.5"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Estimado: {horasEstimadas}h
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="costoHora">Tarifa por Hora *</Label>
                            <Input
                                id="costoHora"
                                type="number"
                                step="500"
                                value={costoHora}
                                onChange={(e) => setCostoHora(parseFloat(e.target.value) || 0)}
                                min="0"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Base sugerida
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Costo Mano de Obra (Calculado)</Label>
                        <div className="text-xl font-bold text-slate-700">
                            ${(horasReales * costoHora).toLocaleString('es-CO')}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Completando..." : "✅ Completar Finalizar"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
