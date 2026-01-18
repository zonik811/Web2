"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { obtenerTurnos, crearTurno, eliminarTurno } from "@/lib/actions/turnos";
import type { Turno } from "@/types";
import { Trash2, Plus, Clock, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfiguracionTurnosDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ConfiguracionTurnosDialog({ open, onOpenChange }: ConfiguracionTurnosDialogProps) {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(false);

    // Formulario nuevo turno
    const [nuevoTurno, setNuevoTurno] = useState({
        nombre: "",
        horaEntrada: "",
        horaSalida: "",
        color: "#3b82f6" // Default blue
    });

    useEffect(() => {
        if (open) {
            cargarTurnos();
        }
    }, [open]);

    const cargarTurnos = async () => {
        setLoading(true);
        const lista = await obtenerTurnos();
        setTurnos(lista);
        setLoading(false);
    };

    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await crearTurno(nuevoTurno);
            if (result.success) {
                toast.success("Turno creado correctamente");
                setNuevoTurno({ nombre: "", horaEntrada: "", horaSalida: "", color: "#3b82f6" });
                cargarTurnos();
            } else {
                toast.error(result.error || "Error al crear turno");
            }
        } catch (error) {
            toast.error("Error al crear turno");
        }
    };

    const handleEliminar = async (id: string) => {
        if (!confirm("¿Estás seguro de desactivar este turno?")) return;

        try {
            const result = await eliminarTurno(id);
            if (result.success) {
                toast.success("Turno desactivado");
                cargarTurnos();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Error al desactivar turno");
        }
    };

    const presetColors = [
        { name: "Azul", value: "#3b82f6" },
        { name: "Púrpura", value: "#9333ea" },
        { name: "Verde", value: "#10b981" },
        { name: "Naranja", value: "#f59e0b" },
        { name: "Rosa", value: "#ec4899" },
        { name: "Cyan", value: "#06b6d4" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                            <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl">Gestión de Turnos Rotativos</DialogTitle>
                            <DialogDescription className="text-base mt-1">
                                Define los tipos de turnos disponibles para asignar a los empleados.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden py-4">
                    {/* Columna Izquierda: Formulario */}
                    <div className="lg:border-r lg:pr-6 space-y-4">
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                            <div className="flex items-center gap-2 mb-4">
                                <Plus className="h-5 w-5 text-blue-600" />
                                <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Nuevo Turno</h3>
                            </div>

                            <form onSubmit={handleCrear} className="space-y-4">
                                <div>
                                    <Label className="text-sm font-semibold text-slate-700">Nombre del Turno</Label>
                                    <Input
                                        value={nuevoTurno.nombre}
                                        onChange={e => setNuevoTurno({ ...nuevoTurno, nombre: e.target.value })}
                                        placeholder="Ej: Turno Mañana"
                                        required
                                        className="mt-1.5 bg-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-sm font-semibold text-slate-700">Entrada</Label>
                                        <Input
                                            type="time"
                                            value={nuevoTurno.horaEntrada}
                                            onChange={e => setNuevoTurno({ ...nuevoTurno, horaEntrada: e.target.value })}
                                            required
                                            className="mt-1.5 bg-white"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-semibold text-slate-700">Salida</Label>
                                        <Input
                                            type="time"
                                            value={nuevoTurno.horaSalida}
                                            onChange={e => setNuevoTurno({ ...nuevoTurno, horaSalida: e.target.value })}
                                            required
                                            className="mt-1.5 bg-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Palette className="h-4 w-4" />
                                        Color Identificador
                                    </Label>
                                    <div className="flex gap-2 mt-2">
                                        {presetColors.map((preset) => (
                                            <button
                                                key={preset.value}
                                                type="button"
                                                onClick={() => setNuevoTurno({ ...nuevoTurno, color: preset.value })}
                                                className={`
                                                    w-10 h-10 rounded-lg shadow-md hover:scale-110 transition-transform
                                                    ${nuevoTurno.color === preset.value ? 'ring-4 ring-slate-800 ring-offset-2' : ''}
                                                `}
                                                style={{ backgroundColor: preset.value }}
                                                title={preset.name}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-2 items-center mt-3">
                                        <Input
                                            type="color"
                                            value={nuevoTurno.color}
                                            onChange={e => setNuevoTurno({ ...nuevoTurno, color: e.target.value })}
                                            className="w-16 h-10 p-1 bg-white"
                                        />
                                        <span className="text-xs font-mono text-slate-600 bg-white px-3 py-2 rounded-lg border">{nuevoTurno.color}</span>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear Turno
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Columna Derecha: Lista de Turnos */}
                    <div className="lg:col-span-2 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 uppercase tracking-wide text-sm">Turnos Activos</h3>
                            <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold">
                                {turnos.length} turnos
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            <AnimatePresence>
                                {turnos.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200"
                                    >
                                        <Clock className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                        <p className="text-slate-600 font-medium">No hay turnos definidos</p>
                                        <p className="text-sm text-slate-500 mt-1">Crea tu primer turno usando el formulario</p>
                                    </motion.div>
                                ) : (
                                    turnos.map((turno, index) => (
                                        <motion.div
                                            key={turno.$id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="group relative bg-white border border-slate-200 rounded-xl p-4 hover:shadow-lg hover:border-slate-300 transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className="w-12 h-12 rounded-xl shadow-md flex items-center justify-center"
                                                        style={{ backgroundColor: turno.color || '#ccc' }}
                                                    >
                                                        <Clock className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-800">{turno.nombre}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                                {turno.horaEntrada}
                                                            </span>
                                                            <span className="text-slate-400">→</span>
                                                            <span className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                                                {turno.horaSalida}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleEliminar(turno.$id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
