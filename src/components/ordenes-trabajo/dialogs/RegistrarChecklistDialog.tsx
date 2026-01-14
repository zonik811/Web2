"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Check, ClipboardList, Fuel, UploadCloud } from "lucide-react";
import { crearChecklist } from "@/lib/actions/ot-checklist";
import { ImageUploader } from "@/components/ordenes-trabajo/ImageUploader";
import type { CrearOtChecklistInput, TipoChecklist } from "@/types";

interface RegistrarChecklistDialogProps {
    ordenId: string;
    empleadoId: string;
    onChecklistCreated: () => void;
}

export function RegistrarChecklistDialog({
    ordenId,
    empleadoId,
    onChecklistCreated
}: RegistrarChecklistDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState<Partial<CrearOtChecklistInput>>({
        ordenTrabajoId: ordenId,
        empleadoInspectorId: empleadoId,
        tipo: 'RECEPCION',
        nivelCombustible: 50,
        estadoLlantas: 'BUENO',
        lucesOperativas: true,
        frenosOperativos: true,
        fotosVehiculo: []
    });

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Completar datos faltantes
            const finalData: CrearOtChecklistInput = {
                ordenTrabajoId: ordenId,
                empleadoInspectorId: empleadoId,
                fechaHora: new Date().toISOString(),
                tipo: formData.tipo || 'RECEPCION',
                nivelCombustible: formData.nivelCombustible || 0,
                kilometraje: Number(formData.kilometraje) || 0,
                estadoLlantas: formData.estadoLlantas || 'BUENO',
                rayonesNotados: formData.rayonesNotados || 'Ninguno',
                objetosValor: formData.objetosValor || 'Ninguno',
                estadoCarroceria: formData.estadoCarroceria || 'Bueno',
                estadoInterior: formData.estadoInterior || 'Bueno',
                lucesOperativas: formData.lucesOperativas || false,
                frenosOperativos: formData.frenosOperativos || false,
                observacionesGenerales: formData.observacionesGenerales,
                fotosVehiculo: formData.fotosVehiculo || [],
                nombreClienteFirma: formData.nombreClienteFirma || 'Pendiente',
                firmaClienteUrl: formData.firmaClienteUrl
            };

            const result = await crearChecklist(finalData);

            if (result.success) {
                setOpen(false);
                setStep(1);
                // Reset form basic fields if needed, or just close
                onChecklistCreated();
            } else {
                alert("Error al guardar checklist: " + result.error);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    const handleImagesUploaded = (urls: string[]) => {
        setFormData(prev => ({ ...prev, fotosVehiculo: urls }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Nuevo Checklist
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registro de Inspección - {formData.tipo}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Tipo de Checklist Selector */}
                    <div className="flex justify-center gap-4 bg-slate-100 p-2 rounded-lg">
                        <Button
                            variant={formData.tipo === 'RECEPCION' ? 'default' : 'ghost'}
                            onClick={() => setFormData({ ...formData, tipo: 'RECEPCION' })}
                            className="w-1/2"
                        >
                            Recepción (Entrada)
                        </Button>
                        <Button
                            variant={formData.tipo === 'ENTREGA' ? 'default' : 'ghost'}
                            onClick={() => setFormData({ ...formData, tipo: 'ENTREGA' })}
                            className="w-1/2"
                        >
                            Entrega (Salida)
                        </Button>
                    </div>

                    {/* Paso 1: Datos Básicos */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Kilometraje Actual</Label>
                                    <Input
                                        type="number"
                                        placeholder="Ej: 54000"
                                        value={formData.kilometraje}
                                        onChange={e => setFormData({ ...formData, kilometraje: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Estado Llantas</Label>
                                    <Select
                                        value={formData.estadoLlantas}
                                        onValueChange={val => setFormData({ ...formData, estadoLlantas: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            <SelectItem value="BUENO">Buenas</SelectItem>
                                            <SelectItem value="REGULAR">Regulares</SelectItem>
                                            <SelectItem value="MALO">Malas / Desgaste</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4 border p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Fuel className="h-5 w-5 text-orange-500" />
                                    <Label>Nivel de Combustible: {formData.nivelCombustible}%</Label>
                                </div>
                                <Slider
                                    value={[formData.nivelCombustible || 0]}
                                    max={100}
                                    step={5}
                                    onValueChange={(vals: number[]) => setFormData({ ...formData, nivelCombustible: vals[0] })}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>E</span>
                                    <span>1/4</span>
                                    <span>1/2</span>
                                    <span>3/4</span>
                                    <span>F</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Luces Operativas</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={formData.lucesOperativas ? 'outline' : 'ghost'}
                                            className={formData.lucesOperativas ? 'border-green-500 bg-green-50 text-green-700' : ''}
                                            onClick={() => setFormData({ ...formData, lucesOperativas: true })}
                                        >
                                            Sí
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={!formData.lucesOperativas ? 'outline' : 'ghost'}
                                            className={!formData.lucesOperativas ? 'border-red-500 bg-red-50 text-red-700' : ''}
                                            onClick={() => setFormData({ ...formData, lucesOperativas: false })}
                                        >
                                            No
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Frenos Operativos</Label>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={formData.frenosOperativos ? 'outline' : 'ghost'}
                                            className={formData.frenosOperativos ? 'border-green-500 bg-green-50 text-green-700' : ''}
                                            onClick={() => setFormData({ ...formData, frenosOperativos: true })}
                                        >
                                            Sí
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={!formData.frenosOperativos ? 'outline' : 'ghost'}
                                            className={!formData.frenosOperativos ? 'border-red-500 bg-red-50 text-red-700' : ''}
                                            onClick={() => setFormData({ ...formData, frenosOperativos: false })}
                                        >
                                            No
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full" onClick={() => setStep(2)}>
                                Siguiente: Detalles y Fotos
                            </Button>
                        </div>
                    )}

                    {/* Paso 2: Detalles y Fotos */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Rayones / Golpes Notados</Label>
                                <Textarea
                                    placeholder="Describa rayones o golpes existentes..."
                                    value={formData.rayonesNotados}
                                    onChange={e => setFormData({ ...formData, rayonesNotados: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Objetos de Valor en Vehículo</Label>
                                <Input
                                    placeholder="Ej: Gafas de sol, Cargador, Documentos..."
                                    value={formData.objetosValor}
                                    onChange={e => setFormData({ ...formData, objetosValor: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Fotos de Evidencia</Label>
                                <ImageUploader
                                    onImagesChange={handleImagesUploaded}
                                    initialImages={formData.fotosVehiculo}
                                    maxImages={5}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Observaciones Generales</Label>
                                <Textarea
                                    value={formData.observacionesGenerales}
                                    onChange={e => setFormData({ ...formData, observacionesGenerales: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Nombre Cliente (Firma/Aceptación)</Label>
                                <Input
                                    placeholder="Nombre de quien entrega/recibe"
                                    value={formData.nombreClienteFirma}
                                    onChange={e => setFormData({ ...formData, nombreClienteFirma: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                                    Atrás
                                </Button>
                                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                                    {loading ? "Guardando..." : "Guardar Checklist"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
