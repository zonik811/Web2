"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ImageUploader } from "./ImageUploader";
import { SignaturePad } from "./SignaturePad";
import {
    ClipboardCheck,
    Fuel,
    Gauge,
    Car,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Camera,
    PenTool
} from "lucide-react";
import type { CrearOtChecklistInput } from "@/types";

interface ChecklistVehiculoFormProps {
    nombreCliente: string;
    empleadoInspectorId: string;
    onChecklistComplete: (data: Omit<CrearOtChecklistInput, 'ordenTrabajoId'>) => void;
}

export function ChecklistVehiculoForm({
    nombreCliente,
    empleadoInspectorId,
    onChecklistComplete
}: ChecklistVehiculoFormProps) {
    const [formData, setFormData] = useState({
        estadoLlantas: "",
        nivelCombustible: 25, // Default 1/4 tank
        kilometraje: 0,
        rayonesNotados: "",
        objetosValor: "",
        estadoCarroceria: "",
        estadoInterior: "",
        lucesOperativas: true,
        frenosOperativos: true,
        observacionesGenerales: "",
    });

    const [fotosVehiculo, setFotosVehiculo] = useState<string[]>([]);
    const [firmaUrl, setFirmaUrl] = useState<string>("");

    const handleFieldChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isComplete = fotosVehiculo.length >= 4 && firmaUrl !== "";

    // Auto-update parent when checklist is complete
    useEffect(() => {
        if (isComplete) {
            const checklistData: Omit<CrearOtChecklistInput, 'ordenTrabajoId'> = {
                tipo: 'RECEPCION',
                ...formData,
                fotosVehiculo,
                firmaClienteUrl: firmaUrl,
                nombreClienteFirma: nombreCliente,
                empleadoInspectorId,
                fechaHora: new Date().toISOString(),
            };
            onChecklistComplete(checklistData);
        }
    }, [isComplete, formData, fotosVehiculo, firmaUrl, nombreCliente, empleadoInspectorId, onChecklistComplete]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Hero */}
            <div className="flex items-center gap-4 py-2">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Checklist de Recepción</h2>
                    <p className="text-slate-500">Inspección física inicial del vehículo</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Niveles e Indicadores */}
                <Card className="border-none shadow-sm bg-slate-50/50">
                    <CardHeader className="pb-3 border-b border-slate-100/50">
                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-700">
                            <Gauge className="h-4 w-4 text-blue-500" />
                            Niveles e Indicadores
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-8">
                        {/* Combustible Slider */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label className="flex items-center gap-2 text-slate-700 font-medium">
                                    <Fuel className="h-4 w-4" />
                                    Nivel de Combustible
                                </Label>
                                <span className={`font-mono font-bold text-lg ${formData.nivelCombustible < 15 ? "text-red-500" : "text-slate-700"
                                    }`}>
                                    {formData.nivelCombustible}%
                                </span>
                            </div>
                            <div className="px-1">
                                <Slider
                                    value={[formData.nivelCombustible]}
                                    onValueChange={(val) => handleFieldChange("nivelCombustible", val[0])}
                                    max={100}
                                    step={5}
                                    className={`py-2 cursor-pointer ${formData.nivelCombustible < 15 ? "[&>.bg-primary]:bg-red-500" : ""
                                        }`}
                                />
                                <div className="flex justify-between text-xs font-bold text-slate-300 mt-2 px-1 font-mono uppercase">
                                    <span>E</span>
                                    <span>1/4</span>
                                    <span>1/2</span>
                                    <span>3/4</span>
                                    <span>F</span>
                                </div>
                            </div>
                        </div>

                        {/* Kilometraje */}
                        <div className="space-y-3">
                            <Label htmlFor="kilometraje" className="text-slate-700 font-medium">Kilometraje Actual</Label>
                            <div className="relative">
                                <Input
                                    id="kilometraje"
                                    type="number"
                                    value={formData.kilometraje}
                                    onChange={(e) => handleFieldChange("kilometraje", parseInt(e.target.value))}
                                    className="pl-4 h-11 font-mono text-lg bg-white border-slate-200"
                                />
                                <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">KM</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 2. Verificación de Seguridad */}
                <Card className="border-none shadow-sm bg-slate-50/50">
                    <CardHeader className="pb-3 border-b border-slate-100/50">
                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-700">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Verificación de Seguridad
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 gap-4">
                        {/* Luces Toggle Card */}
                        <div
                            onClick={() => handleFieldChange("lucesOperativas", !formData.lucesOperativas)}
                            className={`
                                cursor-pointer relative flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98]
                                ${formData.lucesOperativas
                                    ? "bg-white border-green-100 hover:border-green-200 hover:shadow-green-100/50"
                                    : "bg-red-50/50 border-red-100 hover:border-red-200"
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${formData.lucesOperativas ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                    {formData.lucesOperativas ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className={`font-semibold ${formData.lucesOperativas ? "text-slate-700" : "text-red-700"}`}>
                                        Sistema de Luces
                                    </p>
                                    <p className="text-xs text-slate-500">Focos, direccionales y stop</p>
                                </div>
                            </div>
                            <Badge variant={formData.lucesOperativas ? "outline" : "destructive"} className={formData.lucesOperativas ? "text-green-600 border-green-200 bg-green-50" : ""}>
                                {formData.lucesOperativas ? "OPERATIVO" : "FALLA"}
                            </Badge>
                        </div>

                        {/* Frenos Toggle Card */}
                        <div
                            onClick={() => handleFieldChange("frenosOperativos", !formData.frenosOperativos)}
                            className={`
                                cursor-pointer relative flex items-center justify-between p-4 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98]
                                ${formData.frenosOperativos
                                    ? "bg-white border-green-100 hover:border-green-200 hover:shadow-green-100/50"
                                    : "bg-red-50/50 border-red-100 hover:border-red-200"
                                }
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${formData.frenosOperativos ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                                    {formData.frenosOperativos ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className={`font-semibold ${formData.frenosOperativos ? "text-slate-700" : "text-red-700"}`}>
                                        Sistema de Frenos
                                    </p>
                                    <p className="text-xs text-slate-500">Pedal, pastillas y líquido</p>
                                </div>
                            </div>
                            <Badge variant={formData.frenosOperativos ? "outline" : "destructive"} className={formData.frenosOperativos ? "text-green-600 border-green-200 bg-green-50" : ""}>
                                {formData.frenosOperativos ? "OPERATIVO" : "FALLA"}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. Inspección Detallada */}
            <Card className="border-none shadow-md bg-white">
                <CardHeader className="pb-3 border-b border-slate-100">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                        <Car className="h-5 w-5 text-primary" />
                        Inspección Detallada
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 grid md:grid-cols-2 gap-8">
                    {/* Columna Izquierda */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="estadoCarroceria" className="text-slate-700 font-medium">Estado Carrocería</Label>
                            <Textarea
                                id="estadoCarroceria"
                                value={formData.estadoCarroceria}
                                onChange={(e) => handleFieldChange("estadoCarroceria", e.target.value)}
                                placeholder="Golpes, abolladuras o estado de pintura..."
                                className="min-h-[100px] resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="estadoLlantas" className="text-slate-700 font-medium">Estado Llantas</Label>
                            <Input
                                id="estadoLlantas"
                                value={formData.estadoLlantas}
                                onChange={(e) => handleFieldChange("estadoLlantas", e.target.value)}
                                placeholder="Ej: Delanteras nuevas, traseras 50%..."
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Columna Derecha */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor="estadoInterior" className="text-slate-700 font-medium">Estado Interior & Objetos</Label>
                            <Textarea
                                id="estadoInterior"
                                value={formData.estadoInterior}
                                onChange={(e) => handleFieldChange("estadoInterior", e.target.value)}
                                placeholder="Tapicería, tablero, limpieza..."
                                className="min-h-[100px] resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="objetosValor" className="text-slate-700 font-medium">Objetos de Valor</Label>
                            <Input
                                id="objetosValor"
                                value={formData.objetosValor}
                                onChange={(e) => handleFieldChange("objetosValor", e.target.value)}
                                placeholder="Radio, Herramientas, Documentos..."
                                className="h-11 bg-slate-50 border-slate-200 focus:bg-white"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 4. Evidencia Visual y Firma */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-md overflow-hidden flex flex-col">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Camera className="h-4 w-4 text-purple-500" />
                            Evidencia Fotográfica *
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-6 bg-white">
                        <ImageUploader
                            maxImages={4}
                            onImagesChange={setFotosVehiculo}
                            label="Capturar 4 ángulos del vehículo"
                        />
                        {fotosVehiculo.length < 4 && (
                            <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                                <AlertTriangle className="h-4 w-4" />
                                <span>Faltan {4 - fotosVehiculo.length} fotos requeridas</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-none shadow-md overflow-hidden flex flex-col">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <PenTool className="h-4 w-4 text-indigo-500" />
                            Conformidad del Cliente *
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 p-6 bg-white flex flex-col justify-center">
                        <Label className="mb-3 block text-slate-500 text-sm">Firma del propietario o conductor:</Label>
                        <SignaturePad
                            onSignatureSave={setFirmaUrl}
                            onClear={() => setFirmaUrl("")}
                        />
                        {!firmaUrl && (
                            <div className="mt-4 flex items-center gap-2 text-sm text-slate-400 bg-slate-50 p-2 rounded justify-center border border-dashed border-slate-200">
                                <span>✍️ Firma requerida para finalizar</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Checklist Complete Barrier */}
            {isComplete && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-in zoom-in-95 duration-300 shadow-sm">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-green-800">¡Checklist Completado!</h4>
                        <p className="text-green-700 text-sm">Toda la información ha sido registrada correctamente. Puedes crear la orden.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
