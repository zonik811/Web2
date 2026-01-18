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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { obtenerFestivos, crearFestivo, eliminarFestivo } from "@/lib/actions/horas-extras";
import type { DiaFestivo } from "@/types";
import { Trash2, Plus, Calendar } from "lucide-react";

interface GestionFestivosDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function GestionFestivosDialog({ open, onOpenChange }: GestionFestivosDialogProps) {
    const [festivos, setFestivos] = useState<DiaFestivo[]>([]);
    const [loading, setLoading] = useState(false);
    const [anio, setAnio] = useState(new Date().getFullYear());

    const [nuevoFestivo, setNuevoFestivo] = useState({
        fecha: "",
        nombre: "",
        esIrrenunciable: false,
        multiplicador: 1.75
    });

    useEffect(() => {
        if (open) {
            cargarFestivos();
        }
    }, [open, anio]);

    const cargarFestivos = async () => {
        setLoading(true);
        const lista = await obtenerFestivos(anio);
        setFestivos(lista);
        setLoading(false);
    };

    const handleCrear = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await crearFestivo(nuevoFestivo);
            if (result.success) {
                toast.success("Festivo agregado");
                setNuevoFestivo({ ...nuevoFestivo, nombre: "", fecha: "" });
                cargarFestivos();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Error al crear festivo");
        }
    };

    const handleEliminar = async (id: string) => {
        if (!confirm("¿Eliminar este día festivo?")) return;
        try {
            const result = await eliminarFestivo(id);
            if (result.success) {
                toast.success("Festivo eliminado");
                cargarFestivos();
            } else {
                toast.error(result.error);
            }
        } catch (error) {
            toast.error("Error al eliminar");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Gestión de Días Festivos - {anio}</DialogTitle>
                    <DialogDescription>
                        Configura los días feriados para el cálculo de recargos.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setAnio(anio - 1)}>&lt;</Button>
                        <span className="font-bold">{anio}</span>
                        <Button variant="outline" size="sm" onClick={() => setAnio(anio + 1)}>&gt;</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Formulario */}
                    <div className="space-y-4 border-r pr-6">
                        <h3 className="font-medium text-sm text-muted-foreground uppercase">Nuevo Festivo</h3>
                        <form onSubmit={handleCrear} className="space-y-3">
                            <div>
                                <Label>Fecha</Label>
                                <Input
                                    type="date"
                                    value={nuevoFestivo.fecha}
                                    onChange={e => setNuevoFestivo({ ...nuevoFestivo, fecha: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <Label>Nombre</Label>
                                <Input
                                    value={nuevoFestivo.nombre}
                                    onChange={e => setNuevoFestivo({ ...nuevoFestivo, nombre: e.target.value })}
                                    placeholder="Ej: Navidad"
                                    required
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="irrenunciable"
                                    checked={nuevoFestivo.esIrrenunciable}
                                    onCheckedChange={(checked: boolean) => setNuevoFestivo({ ...nuevoFestivo, esIrrenunciable: checked })}
                                />
                                <Label htmlFor="irrenunciable">Irrenunciable</Label>
                            </div>
                            <div>
                                <Label>Multiplicador</Label>
                                <Input
                                    type="number"
                                    step="0.25"
                                    value={nuevoFestivo.multiplicador}
                                    onChange={e => setNuevoFestivo({ ...nuevoFestivo, multiplicador: parseFloat(e.target.value) })}
                                    required
                                />
                            </div>
                            <Button type="submit" size="sm" className="w-full">
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar
                            </Button>
                        </form>
                    </div>

                    {/* Lista */}
                    <div className="md:col-span-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Factor</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {festivos.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                            No hay festivos registrados en {anio}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    festivos.map(dia => (
                                        <TableRow key={dia.$id}>
                                            <TableCell>
                                                {new Date(dia.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                                            </TableCell>
                                            <TableCell>{dia.nombre}</TableCell>
                                            <TableCell>x{dia.multiplicador}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                    onClick={() => handleEliminar(dia.$id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
