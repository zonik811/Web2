"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Briefcase, ArrowUpDown } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

interface CargosTabProps {
    cargos: any[];
    onDataChange: () => void;
    crearCargo: (data: any) => Promise<any>;
    actualizarCargo: (id: string, data: any) => Promise<any>;
    eliminarCargo: (id: string) => Promise<any>;
}

export function CargosTab({ cargos, onDataChange, crearCargo, actualizarCargo, eliminarCargo }: CargosTabProps) {
    const { toast } = useToast();
    const [dialog, setDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ nombre: "", descripcion: "", orden: 0 });

    const handleSave = async () => {
        if (!form.nombre.trim()) {
            toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
            return;
        }

        try {
            setSaving(true);
            if (editing) {
                await actualizarCargo(editing.$id, form);
                toast({ title: "✅ Actualizado", description: "Cargo actualizado correctamente", className: "bg-green-50 border-green-200" });
            } else {
                await crearCargo(form);
                toast({ title: "✅ Creado", description: "Cargo creado correctamente", className: "bg-green-50 border-green-200" });
            }
            setDialog(false);
            setEditing(null);
            setForm({ nombre: "", descripcion: "", orden: 0 });
            onDataChange();
        } catch (error) {
            toast({ title: "Error", description: "Error guardando cargo", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (cargo: any) => {
        setEditing(cargo);
        setForm({ nombre: cargo.nombre, descripcion: cargo.descripcion || "", orden: cargo.orden || 0 });
        setDialog(true);
    };

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Eliminar el cargo "${nombre}"?`)) return;
        try {
            await eliminarCargo(id);
            toast({ title: "🗑️ Eliminado", description: "Cargo eliminado correctamente", className: "bg-red-50 border-red-200" });
            onDataChange();
        } catch (error) {
            toast({ title: "Error", description: "Error eliminando cargo", variant: "destructive" });
        }
    };

    return (
        <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Briefcase className="w-6 h-6" />
                            Cargos
                        </CardTitle>
                        <CardDescription className="text-blue-100 text-base mt-1">
                            Puestos de trabajo disponibles en la empresa
                        </CardDescription>
                    </div>
                    <Dialog open={dialog} onOpenChange={setDialog}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => { setEditing(null); setForm({ nombre: "", descripcion: "", orden: 0 }); }}
                                className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg font-semibold"
                                size="lg"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Nuevo Cargo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{editing ? "✏️ Editar" : "➕ Crear"} Cargo</DialogTitle>
                                <DialogDescription className="text-base">
                                    {editing ? "Modifica la información del cargo" : "Completa los datos del nuevo cargo"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-5 py-4">
                                <div>
                                    <Label htmlFor="nombre" className="text-base font-semibold">Nombre del Cargo *</Label>
                                    <Input
                                        id="nombre"
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        className="mt-2 h-12 text-base"
                                        placeholder="ej: Técnico Diesel"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="descripcion" className="text-base font-semibold">Descripción</Label>
                                    <Input
                                        id="descripcion"
                                        value={form.descripcion}
                                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                        className="mt-2 h-12 text-base"
                                        placeholder="ej: Especialista en reparación de motores"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="orden" className="text-base font-semibold">Orden de Visualización</Label>
                                    <Input
                                        id="orden"
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
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                    {saving ? "Guardando..." : editing ? "Actualizar" : "Crear Cargo"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {cargos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                            <Briefcase className="w-12 h-12 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay cargos registrados</h3>
                        <p className="text-gray-600 text-center max-w-md mb-6">
                            Crea tu primer cargo para organizar los puestos de trabajo en tu empresa
                        </p>
                        <Button onClick={() => setDialog(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Primer Cargo
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50">
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
                            {cargos.map((cargo, idx) => (
                                <TableRow key={cargo.$id} className="hover:bg-blue-50/50 transition-colors">
                                    <TableCell className="font-semibold text-gray-900">{cargo.nombre}</TableCell>
                                    <TableCell className="text-gray-600">{cargo.descripcion || "-"}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-bold rounded-lg">
                                            {cargo.orden || idx + 1}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                onClick={() => handleEdit(cargo)}
                                                className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                                title="Editar cargo"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cargo.$id, cargo.nombre)}
                                                className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                                title="Eliminar cargo"
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
