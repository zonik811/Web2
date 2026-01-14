"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

interface TiposClienteTabProps {
    tipos: any[];
    onDataChange: () => void;
    crearTipo: (data: any) => Promise<any>;
    actualizarTipo: (id: string, data: any) => Promise<any>;
    eliminarTipo: (id: string) => Promise<any>;
}

export function TiposClienteTab({ tipos, onDataChange, crearTipo, actualizarTipo, eliminarTipo }: TiposClienteTabProps) {
    const { toast } = useToast();
    const [dialog, setDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ nombre: "", descripcion: "" });

    const handleSave = async () => {
        if (!form.nombre.trim()) {
            toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
            return;
        }

        try {
            setSaving(true);
            if (editing) {
                await actualizarTipo(editing.$id, form);
                toast({ title: "✅ Actualizado", description: "Tipo de cliente actualizado correctamente", className: "bg-green-50 border-green-200" });
            } else {
                await crearTipo(form);
                toast({ title: "✅ Creado", description: "Tipo de cliente creado correctamente", className: "bg-green-50 border-green-200" });
            }

            setDialog(false);
            setEditing(null);
            setForm({ nombre: "", descripcion: "" });
            onDataChange();
        } catch (error) {
            toast({ title: "Error", description: "Error guardando tipo", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (tipo: any) => {
        setEditing(tipo);
        setForm({ nombre: tipo.nombre, descripcion: tipo.descripcion || "" });
        setDialog(true);
    };

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Eliminar el tipo "${nombre}"?`)) return;
        try {
            await eliminarTipo(id);
            toast({ title: "🗑️ Eliminado", description: "Tipo eliminado correctamente", className: "bg-red-50 border-red-200" });
            onDataChange();
        } catch (error) {
            toast({ title: "Error", description: "Error eliminando tipo", variant: "destructive" });
        }
    };

    return (
        <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Users className="w-6 h-6" />
                            Tipos de Cliente
                        </CardTitle>
                        <CardDescription className="text-orange-100 text-base mt-1">
                            Categorías para segmentar tu base de clientes
                        </CardDescription>
                    </div>
                    <Dialog open={dialog} onOpenChange={setDialog}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => { setEditing(null); setForm({ nombre: "", descripcion: "" }); }}
                                className="bg-white text-orange-600 hover:bg-orange-50 shadow-lg font-semibold"
                                size="lg"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Nuevo Tipo
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{editing ? "✏️ Editar" : "➕ Crear"} Tipo de Cliente</DialogTitle>
                                <DialogDescription className="text-base">
                                    {editing ? "Modifica la categoría seleccionada" : "Define una nueva categoría para tus clientes"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-5 py-4">
                                <div>
                                    <Label htmlFor="nombre" className="text-base font-semibold">Nombre *</Label>
                                    <Input
                                        id="nombre"
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        className="mt-2 h-12 text-base"
                                        placeholder="ej: Corporativo, VIP"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="descripcion" className="text-base font-semibold">Descripción</Label>
                                    <Input
                                        id="descripcion"
                                        value={form.descripcion}
                                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                        className="mt-2 h-12 text-base"
                                        placeholder="ej: Clientes con contrato mensual"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                >
                                    {saving ? "Guardando..." : editing ? "Actualizar" : "Crear Tipo"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {tipos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-6">
                            <Users className="w-12 h-12 text-orange-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay tipos registrados</h3>
                        <p className="text-gray-600 text-center max-w-md mb-6">
                            Crea tu primer tipo de cliente para empezar a segmentar
                        </p>
                        <Button onClick={() => setDialog(true)} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Primer Tipo
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                                <TableHead className="font-bold text-gray-900">Nombre</TableHead>
                                <TableHead className="font-bold text-gray-900">Descripción</TableHead>
                                <TableHead className="w-40 text-right font-bold text-gray-900">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tipos.map((tipo) => (
                                <TableRow key={tipo.$id} className="hover:bg-orange-50/50 transition-colors">
                                    <TableCell className="font-semibold text-gray-900">{tipo.nombre}</TableCell>
                                    <TableCell className="text-gray-600">{tipo.descripcion || "-"}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                onClick={() => handleEdit(tipo)}
                                                className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                                title="Editar tipo"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tipo.$id, tipo.nombre)}
                                                className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                                title="Eliminar tipo"
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
