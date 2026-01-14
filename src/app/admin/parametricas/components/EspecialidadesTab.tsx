"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Wrench, ArrowUpDown } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

interface EspecialidadesTabProps {
    especialidades: any[];
    onDataChange: () => void;
    crearEspecialidad: (data: any) => Promise<any>;
    actualizarEspecialidad: (id: string, data: any) => Promise<any>;
    eliminarEspecialidad: (id: string) => Promise<any>;
}

export function EspecialidadesTab({ especialidades, onDataChange, crearEspecialidad, actualizarEspecialidad, eliminarEspecialidad }: EspecialidadesTabProps) {
    const { toast } = useToast();
    const [dialog, setDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ nombre: "", descripcion: "", icono: "", orden: 0 });

    const handleSave = async () => {
        if (!form.nombre.trim()) {
            toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
            return;
        }

        try {
            setSaving(true);
            if (editing) {
                await actualizarEspecialidad(editing.$id, form);
                toast({ title: "✅ Actualizado", description: "Especialidad actualizada correctamente", className: "bg-green-50 border-green-200" });
            } else {
                await crearEspecialidad(form);
                toast({ title: "✅ Creado", description: "Especialidad creada correctamente", className: "bg-green-50 border-green-200" });
            }
            setDialog(false);
            setEditing(null);
            setForm({ nombre: "", descripcion: "", icono: "", orden: 0 });
            onDataChange();
        } catch (error) {
            toast({ title: "Error", description: "Error guardando especialidad", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (especialidad: any) => {
        setEditing(especialidad);
        setForm({
            nombre: especialidad.nombre,
            descripcion: especialidad.descripcion || "",
            icono: especialidad.icono || "",
            orden: especialidad.orden || 0
        });
        setDialog(true);
    };

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Eliminar la especialidad "${nombre}"?`)) return;
        try {
            await eliminarEspecialidad(id);
            toast({ title: "🗑️ Eliminado", description: "Especialidad eliminada correctamente", className: "bg-red-50 border-red-200" });
            onDataChange();
        } catch (error) {
            toast({ title: "Error", description: "Error eliminando especialidad", variant: "destructive" });
        }
    };

    return (
        <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Wrench className="w-6 h-6" />
                            Especialidades
                        </CardTitle>
                        <CardDescription className="text-emerald-100 text-base mt-1">
                            Áreas de especialización técnica del personal
                        </CardDescription>
                    </div>
                    <Dialog open={dialog} onOpenChange={setDialog}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => { setEditing(null); setForm({ nombre: "", descripcion: "", icono: "", orden: 0 }); }}
                                className="bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg font-semibold"
                                size="lg"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Nueva Especialidad
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{editing ? "✏️ Editar" : "➕ Crear"} Especialidad</DialogTitle>
                                <DialogDescription className="text-base">
                                    {editing ? "Modifica la información de la especialidad" : "Completa los datos de la nueva especialidad"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-5 py-4">
                                <div>
                                    <Label htmlFor="esp-nombre" className="text-base font-semibold">Nombre de la Especialidad *</Label>
                                    <Input
                                        id="esp-nombre"
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        className="mt-2 h-12 text-base"
                                        placeholder="ej: Filtros Diesel"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="esp-descripcion" className="text-base font-semibold">Descripción</Label>
                                    <Input
                                        id="esp-descripcion"
                                        value={form.descripcion}
                                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                        className="mt-2 h-12 text-base"
                                        placeholder="ej: Especialista en sistemas de filtración"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="esp-icono" className="text-base font-semibold">Icono (Emoji)</Label>
                                    <Input
                                        id="esp-icono"
                                        value={form.icono}
                                        onChange={(e) => setForm({ ...form, icono: e.target.value })}
                                        className="mt-2 h-12 text-2xl text-center"
                                        placeholder="🔧"
                                        maxLength={2}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Usa un emoji para representar la especialidad</p>
                                </div>
                                <div>
                                    <Label htmlFor="esp-orden" className="text-base font-semibold">Orden de Visualización</Label>
                                    <Input
                                        id="esp-orden"
                                        type="number"
                                        value={form.orden}
                                        onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 0 })}
                                        className="mt-2 h-12 text-base"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                >
                                    {saving ? "Guardando..." : editing ? "Actualizar" : "Crear Especialidad"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {especialidades.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mb-6">
                            <Wrench className="w-12 h-12 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay especialidades registradas</h3>
                        <p className="text-gray-600 text-center max-w-md mb-6">
                            Crea tu primera especialidad para clasificar las áreas de experiencia del equipo
                        </p>
                        <Button onClick={() => setDialog(true)} className="bg-gradient-to-r from-emerald-600 to-teal-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Primera Especialidad
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                                <TableHead className="w-20 font-bold text-gray-900">Icono</TableHead>
                                <TableHead className="font-bold text-gray-900">Nombre</TableHead>
                                <TableHead className="font-bold text-gray-900">Descripción</TableHead>
                                <TableHead className="w-32 font-bold text-gray-900">
                                    <div className="flex items-center gap-1">
                                        <ArrowUpDown className="w-4 h-4" />
                                        Orden
                                    </div>
                                </TableHead>
                                <TableHead className="w-40 text-right font-bold text-gray-900">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {especialidades.map((esp, idx) => (
                                <TableRow key={esp.$id} className="hover:bg-emerald-50/50 transition-colors">
                                    <TableCell>
                                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-2xl">
                                            {esp.icono || "🔧"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900">{esp.nombre}</TableCell>
                                    <TableCell className="text-gray-600">{esp.descripcion || "-"}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 font-bold rounded-lg">
                                            {esp.orden || idx + 1}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                onClick={() => handleEdit(esp)}
                                                className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                                title="Editar especialidad"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(esp.$id, esp.nombre)}
                                                className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                                title="Eliminar especialidad"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
