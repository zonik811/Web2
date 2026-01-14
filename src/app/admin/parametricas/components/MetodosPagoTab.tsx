"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, CreditCard, ArrowUpDown, Lock } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

interface MetodosPagoTabProps {
    metodosPago: any[];
    onDataChange: () => void;
    crearMetodoPago: (data: any) => Promise<any>;
    actualizarMetodoPago: (id: string, data: any) => Promise<any>;
    eliminarMetodoPago: (id: string) => Promise<any>;
}

export function MetodosPagoTab({ metodosPago, onDataChange, crearMetodoPago, actualizarMetodoPago, eliminarMetodoPago }: MetodosPagoTabProps) {
    const { toast } = useToast();
    const [dialog, setDialog] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ nombre: "", descripcion: "", icono: "", orden: 0, codigo: "" });

    const handleSave = async () => {
        if (!form.nombre.trim()) {
            toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" });
            return;
        }
        if (!form.codigo.trim()) {
            toast({ title: "Error", description: "El código es requerido", variant: "destructive" });
            return;
        }

        try {
            setSaving(true);
            if (editing) {
                await actualizarMetodoPago(editing.$id, form);
                toast({ title: "✅ Actualizado", description: "Método de pago actualizado correctamente", className: "bg-green-50 border-green-200" });
            } else {
                await crearMetodoPago(form);
                toast({ title: "✅ Creado", description: "Método de pago creado correctamente", className: "bg-green-50 border-green-200" });
            }
            setDialog(false);
            setEditing(null);
            setForm({ nombre: "", descripcion: "", icono: "", orden: 0, codigo: "" });
            onDataChange();
        } catch (error) {
            toast({ title: "Error", description: "Error guardando método de pago", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (metodoPago: any) => {
        setEditing(metodoPago);
        setForm({
            nombre: metodoPago.nombre,
            descripcion: metodoPago.descripcion || "",
            icono: metodoPago.icono || "",
            orden: metodoPago.orden || 0,
            codigo: metodoPago.codigo || ""
        });
        setDialog(true);
    };

    const handleDelete = async (id: string, nombre: string) => {
        if (!confirm(`¿Eliminar el método de pago "${nombre}"?`)) return;
        try {
            await eliminarMetodoPago(id);
            toast({ title: "🗑️ Eliminado", description: "Método de pago eliminado correctamente", className: "bg-red-50 border-red-200" });
            onDataChange();
        } catch (error) {
            toast({ title: "Error", description: "Error eliminando método de pago", variant: "destructive" });
        }
    };

    return (
        <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <CreditCard className="w-6 h-6" />
                            Métodos de Pago
                        </CardTitle>
                        <CardDescription className="text-purple-100 text-base mt-1">
                            Formas de pago disponibles en la empresa
                        </CardDescription>
                    </div>
                    <Dialog open={dialog} onOpenChange={setDialog}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => { setEditing(null); setForm({ nombre: "", descripcion: "", icono: "", orden: 0, codigo: "" }); }}
                                className="bg-white text-purple-600 hover:bg-purple-50 shadow-lg font-semibold"
                                size="lg"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Nuevo Método de Pago
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{editing ? "✏️ Editar" : "➕ Crear"} Método de Pago</DialogTitle>
                                <DialogDescription className="text-base">
                                    {editing ? "Modifica la información del método de pago" : "Completa los datos del nuevo método de pago"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-5 py-4">
                                <div>
                                    <Label htmlFor="mp-nombre" className="text-base font-semibold">Nombre del Método *</Label>
                                    <Input
                                        id="mp-nombre"
                                        value={form.nombre}
                                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                        className="mt-2 h-12 text-base"
                                        placeholder="ej: Efectivo"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="mp-codigo" className="text-base font-semibold flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-gray-400" />
                                        Código Interno *
                                    </Label>
                                    <Input
                                        id="mp-codigo"
                                        value={form.codigo}
                                        onChange={(e) => setForm({ ...form, codigo: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                                        className="mt-2 h-12 text-base font-mono bg-gray-50 uppercase"
                                        placeholder="ej: EFECTIVO"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Identificador único del sistema (ej: EFECTIVO, NEQUI)</p>
                                </div>
                                <div>
                                    <Label htmlFor="mp-descripcion" className="text-base font-semibold">Descripción</Label>
                                    <Input
                                        id="mp-descripcion"
                                        value={form.descripcion}
                                        onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                                        className="mt-2 h-12 text-base"
                                        placeholder="ej: Pago en efectivo"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="mp-icono" className="text-base font-semibold">Icono (Emoji)</Label>
                                        <Input
                                            id="mp-icono"
                                            value={form.icono}
                                            onChange={(e) => setForm({ ...form, icono: e.target.value })}
                                            className="mt-2 h-12 text-2xl text-center"
                                            placeholder="💵"
                                            maxLength={2}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="mp-orden" className="text-base font-semibold">Orden</Label>
                                        <Input
                                            id="mp-orden"
                                            type="number"
                                            value={form.orden}
                                            onChange={(e) => setForm({ ...form, orden: parseInt(e.target.value) || 0 })}
                                            className="mt-2 h-12 text-base"
                                        />
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                    {saving ? "Guardando..." : editing ? "Actualizar" : "Crear Método de Pago"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {metodosPago.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-6">
                            <CreditCard className="w-12 h-12 text-purple-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay métodos de pago registrados</h3>
                        <p className="text-gray-600 text-center max-w-md mb-6">
                            Crea tu primer método de pago para facilitar las transacciones
                        </p>
                        <Button onClick={() => setDialog(true)} className="bg-gradient-to-r from-purple-600 to-pink-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Crear Primer Método de Pago
                        </Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50/50 hover:bg-gray-50">
                                <TableHead className="w-20 font-bold text-gray-900">Icono</TableHead>
                                <TableHead className="font-bold text-gray-900">Nombre</TableHead>
                                <TableHead className="font-bold text-gray-900">Código</TableHead>
                                <TableHead className="font-bold text-gray-900">Descripción</TableHead>
                                <TableHead className="w-32 font-bold text-gray-900">Orden</TableHead>
                                <TableHead className="w-40 text-right font-bold text-gray-900">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {metodosPago.map((metodo, idx) => (
                                <TableRow key={metodo.$id} className="hover:bg-purple-50/50 transition-colors">
                                    <TableCell>
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-2xl">
                                            {metodo.icono || "💳"}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold text-gray-900">{metodo.nombre}</TableCell>
                                    <TableCell className="text-gray-500 font-mono text-xs">{metodo.codigo || "-"}</TableCell>
                                    <TableCell className="text-gray-600">{metodo.descripcion || "-"}</TableCell>
                                    <TableCell>
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 font-bold rounded-lg">
                                            {metodo.orden || idx + 1}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-3 justify-end">
                                            <button
                                                onClick={() => handleEdit(metodo)}
                                                className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                                title="Editar método de pago"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(metodo.$id, metodo.nombre)}
                                                className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 transform hover:scale-110"
                                                title="Eliminar método de pago"
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
