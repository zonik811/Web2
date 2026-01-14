"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, AlertCircle } from "lucide-react";
import { crearFactura } from "@/lib/actions/facturas";

interface GenerarFacturaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ordenId: string;
    subtotal: number;
    impuestos: number;
    total: number;
    onFacturaGenerada: () => void;
}

export function GenerarFacturaDialog({
    open,
    onOpenChange,
    ordenId,
    subtotal,
    impuestos,
    total,
    onFacturaGenerada
}: GenerarFacturaDialogProps) {
    const [loading, setLoading] = useState(false);
    const [terminosPago, setTerminosPago] = useState("Pago inmediato");
    const [observaciones, setObservaciones] = useState("");

    const handleGenerar = async () => {
        setLoading(true);

        try {
            const result = await crearFactura({
                ordenTrabajoId: ordenId,
                subtotal,
                impuestos,
                total,
                terminosPago,
                observaciones
            });

            if (result.success) {
                onFacturaGenerada();
                onOpenChange(false);
                setTerminosPago("Pago inmediato");
                setObservaciones("");
            } else {
                alert("Error: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Generar Factura</DialogTitle>
                    <DialogDescription>
                        Se generará una factura con el número automático para esta orden
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            <div className="space-y-1">
                                <p><strong>Resumen de Costos:</strong></p>
                                <p>Subtotal: ${subtotal.toLocaleString()}</p>
                                <p>IVA: ${impuestos.toLocaleString()}</p>
                                <p className="font-bold">Total: ${total.toLocaleString()}</p>
                            </div>
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                        <Label htmlFor="terminosPago">Términos de Pago</Label>
                        <Input
                            id="terminosPago"
                            value={terminosPago}
                            onChange={e => setTerminosPago(e.target.value)}
                            placeholder="Ej: Pago inmediato, 30 días, etc."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Textarea
                            id="observaciones"
                            value={observaciones}
                            onChange={e => setObservaciones(e.target.value)}
                            placeholder="Notas adicionales para la factura..."
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleGenerar} disabled={loading}>
                        <FileText className="h-4 w-4 mr-2" />
                        {loading ? "Generando..." : "Generar Factura"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
