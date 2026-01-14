"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";
import type { EstadoOrdenTrabajo } from "@/types";

interface CambiarEstadoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    estadoActual: EstadoOrdenTrabajo;
    estadoNuevo: EstadoOrdenTrabajo;
    validationResult?: { valid: boolean; message?: string };
    onConfirm: (observaciones: string) => Promise<void>;
}

const ESTADO_LABELS: Record<EstadoOrdenTrabajo, string> = {
    COTIZANDO: "Cotizando",
    ACEPTADA: "Aceptada",
    EN_PROCESO: "En Proceso",
    POR_PAGAR: "Por Pagar",
    COMPLETADA: "Completada",
    ENTREGADA: "Entregada",
    CANCELADA: "Cancelada"
};

const ESTADO_COLORS: Record<EstadoOrdenTrabajo, string> = {
    COTIZANDO: "bg-blue-100 text-blue-800",
    ACEPTADA: "bg-green-100 text-green-800",
    EN_PROCESO: "bg-yellow-100 text-yellow-800",
    POR_PAGAR: "bg-orange-100 text-orange-800",
    COMPLETADA: "bg-purple-100 text-purple-800",
    ENTREGADA: "bg-gray-100 text-gray-800",
    CANCELADA: "bg-red-100 text-red-800"
};

export function CambiarEstadoDialog({
    open,
    onOpenChange,
    estadoActual,
    estadoNuevo,
    validationResult,
    onConfirm
}: CambiarEstadoDialogProps) {
    const [observaciones, setObservaciones] = useState("");
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm(observaciones);
            setObservaciones("");
            onOpenChange(false);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const canProceed = !validationResult || validationResult.valid;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Cambiar Estado de Orden</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Estado transition visual */}
                    <div className="flex items-center justify-center gap-3 py-4">
                        <Badge className={ESTADO_COLORS[estadoActual]}>
                            {ESTADO_LABELS[estadoActual]}
                        </Badge>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                        <Badge className={ESTADO_COLORS[estadoNuevo]}>
                            {ESTADO_LABELS[estadoNuevo]}
                        </Badge>
                    </div>

                    {/* Validation result */}
                    {validationResult && !validationResult.valid && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                {validationResult.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    {validationResult && validationResult.valid && (
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                La orden cumple con todos los requisitos para avanzar al siguiente estado.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Observaciones */}
                    <div className="space-y-2">
                        <Label htmlFor="observaciones">
                            Observaciones {!canProceed ? "" : "(opcional)"}
                        </Label>
                        <Textarea
                            id="observaciones"
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            placeholder="Notas sobre este cambio de estado..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} disabled={!canProceed || loading}>
                        {loading ? "Cambiando..." : "Confirmar Cambio"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
