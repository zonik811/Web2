"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Search, Truck, Pencil, Trash2, CheckCircle, AlertCircle, DollarSign, RefreshCw, Building2, Phone, Mail, MapPin, User, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Proveedor } from "@/types/inventario";
import {
    obtenerProveedores,
    crearProveedor,
    actualizarProveedor,
    eliminarProveedor,
    obtenerKPIsProveedores
} from "@/lib/actions/inventario";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProveedoresPage() {
    const router = useRouter();
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [kpis, setKpis] = useState({
        totalProveedores: 0,
        proveedoresActivos: 0,
        proveedoresConDeuda: 0,
        totalDeuda: 0
    });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Delete State
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState<Partial<Proveedor>>({
        nombre: "",
        nit_rut: "",
        telefono: "",
        email: "",
        direccion: "",
        nombre_contacto: "",
        activo: true
    });

    const loadData = async () => {
        setLoading(true);
        const [data, kpiData] = await Promise.all([
            obtenerProveedores(search),
            obtenerKPIsProveedores()
        ]);
        setProveedores(data);
        setKpis(kpiData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [search]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditing && formData.$id) {
                const res = await actualizarProveedor(formData.$id, formData);
                if (res.success) toast.success("✅ Proveedor actualizado exitosamente");
                else toast.error("❌ Error al actualizar");
            } else {
                const res = await crearProveedor(formData as any);
                if (res.success) toast.success("✨ Proveedor creado exitosamente");
                else toast.error("❌ Error al crear");
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            toast.error("❌ Ocurrió un error inesperado");
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        const res = await eliminarProveedor(itemToDelete);
        if (res.success) {
            toast.success("🗑️ Proveedor eliminado correctamente");
            loadData();
        } else {
            toast.error(res.error as string || "No se pudo eliminar el proveedor");
        }
        setItemToDelete(null);
    };

    const handleEdit = (p: Proveedor) => {
        setFormData(p);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setFormData({
            nombre: "",
            nit_rut: "",
            telefono: "",
            email: "",
            direccion: "",
            nombre_contacto: "",
            activo: true
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const formatearPrecio = (valor: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0,
        }).format(valor);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Back Button */}
                <Button
                    onClick={() => router.push('/admin/inventario')}
                    variant="ghost"
                    className="mb-4 hover:bg-white/60 transition-all"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Inventario
                </Button>

                {/* Header con diseño premium */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 blur-3xl -z-10"></div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
                                <div className="relative p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl">
                                    <Truck className="h-10 w-10 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                                    Gestión de Proveedores
                                </h1>
                                <p className="text-lg text-slate-600 mt-2">
                                    Administra tus aliados estratégicos y estados de cuenta
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPI Cards Ultra Premium */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Proveedores */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <Card className="relative border-0 shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <Truck className="h-7 w-7 text-white" />
                                    </div>
                                    <Badge className="bg-blue-100 text-blue-700 border-0 px-3 py-1 text-xs font-bold">
                                        TOTAL
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                        {kpis.totalProveedores}
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600">Proveedores Registrados</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Activos */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <Card className="relative border-0 shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <CheckCircle className="h-7 w-7 text-white" />
                                    </div>
                                    <Badge className="bg-emerald-100 text-emerald-700 border-0 px-3 py-1 text-xs font-bold">
                                        ACTIVOS
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-5xl font-black bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
                                        {kpis.proveedoresActivos}
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600">Disponibles para Compras</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Con Deuda */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <Card className="relative border-0 shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <AlertCircle className="h-7 w-7 text-white" />
                                    </div>
                                    <Badge className="bg-amber-100 text-amber-700 border-0 px-3 py-1 text-xs font-bold">
                                        PENDIENTE
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-5xl font-black bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">
                                        {kpis.proveedoresConDeuda}
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600">Con Deuda Activa</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Deuda Total */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-400 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                        <Card className="relative border-0 shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        <DollarSign className="h-7 w-7 text-white" />
                                    </div>
                                    <Badge className="bg-red-100 text-red-700 border-0 px-3 py-1 text-xs font-bold">
                                        DEUDA
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-4xl font-black bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                                        {formatearPrecio(kpis.totalDeuda)}
                                    </div>
                                    <p className="text-sm font-semibold text-slate-600">Total Por Pagar</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tabla con diseño ultra premium */}
                <Card className="border-0 shadow-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
                    <CardHeader className="pb-6 bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 border-b-2 border-slate-200/50">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="relative w-full md:w-96 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <Input
                                    placeholder="Buscar proveedor..."
                                    className="pl-12 h-12 border-2 border-slate-200 focus:border-blue-500 transition-all rounded-2xl bg-white shadow-sm font-medium"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Button
                                onClick={handleNew}
                                className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 w-full md:w-auto h-12 px-8 shadow-xl shadow-blue-500/40 rounded-2xl font-bold text-base group"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <Plus className="mr-2 h-5 w-5 relative z-10" />
                                <span className="relative z-10">Nuevo Proveedor</span>
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b-2 border-slate-200 hover:bg-slate-100/50">
                                        <TableHead className="w-[350px] font-black text-slate-800 text-sm py-4">PROVEEDOR</TableHead>
                                        <TableHead className="font-black text-slate-800 text-sm">CONTACTO</TableHead>
                                        <TableHead className="font-black text-slate-800 text-sm">PERSONA</TableHead>
                                        <TableHead className="text-center font-black text-slate-800 text-sm">ESTADO</TableHead>
                                        <TableHead className="text-right font-black text-slate-800 text-sm">ACCIONES</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
                                                    <p className="text-slate-600 font-semibold">Cargando proveedores...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : proveedores.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-40 text-center">
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="p-4 bg-slate-100 rounded-full">
                                                        <Truck className="h-10 w-10 text-slate-400" />
                                                    </div>
                                                    <p className="text-slate-600 font-semibold">No se encontraron proveedores</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        proveedores.map((prov) => (
                                            <TableRow key={prov.$id} className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-300 border-b border-slate-100">
                                                <TableCell className="py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="relative">
                                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                                            <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                                {prov.nombre.substring(0, 2).toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="font-bold text-slate-900 text-base group-hover:text-blue-700 transition-colors">
                                                                {prov.nombre}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                                <Building2 className="h-3 w-3" />
                                                                {prov.nit_rut || "NIT N/A"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                                            <Phone className="h-4 w-4 text-blue-500" />
                                                            <span className="font-medium">{prov.telefono || "N/A"}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Mail className="h-4 w-4 text-purple-500" />
                                                            <span className="truncate max-w-[200px]">{prov.email || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {prov.nombre_contacto ? (
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-slate-400" />
                                                            <span className="text-sm font-medium text-slate-700">{prov.nombre_contacto}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge
                                                        variant={prov.activo ? "default" : "secondary"}
                                                        className={prov.activo
                                                            ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md px-4 py-1.5 font-semibold"
                                                            : "bg-slate-200 text-slate-600 border-0 px-4 py-1.5 font-semibold"
                                                        }
                                                    >
                                                        {prov.activo ? "✓ Activo" : "○ Inactivo"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleEdit(prov)}
                                                            className="h-10 w-10 p-0 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all shadow-sm hover:shadow-md"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setItemToDelete(prov.$id)}
                                                            className="h-10 w-10 p-0 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all shadow-sm hover:shadow-md"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Modal Ultra Premium */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-3xl bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
                    <DialogHeader className="border-b pb-6 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 -mx-6 px-6 -mt-6 pt-6 rounded-t-xl">
                        <DialogTitle className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                                <Truck className="h-7 w-7 text-white" />
                            </div>
                            <span className="text-3xl font-black bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                                {isEditing ? "✏️ Editar Proveedor" : "✨ Registrar Proveedor"}
                            </span>
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-blue-600" />
                                    Nombre de Empresa / Razón Social *
                                </Label>
                                <Input
                                    required
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Ej: Distribuidora de Repuestos S.A.S"
                                    className="h-12 text-base border-2 border-slate-200 focus:border-blue-500 rounded-xl font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700">NIT / RUT</Label>
                                <Input
                                    value={formData.nit_rut}
                                    onChange={e => setFormData({ ...formData, nit_rut: e.target.value })}
                                    placeholder="900.123.456-7"
                                    className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-blue-600" />
                                    Teléfono Principal
                                </Label>
                                <Input
                                    value={formData.telefono}
                                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                    placeholder="+57 300 123 4567"
                                    className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-purple-600" />
                                    Correo Electrónico
                                </Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="contacto@proveedor.com"
                                    className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    Dirección
                                </Label>
                                <Input
                                    value={formData.direccion}
                                    onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                    placeholder="Calle 123 # 45 - 67"
                                    className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <User className="h-4 w-4 text-blue-600" />
                                    Contacto Directo
                                </Label>
                                <Input
                                    value={formData.nombre_contacto}
                                    onChange={e => setFormData({ ...formData, nombre_contacto: e.target.value })}
                                    placeholder="Juan Pérez"
                                    className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl"
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-8">
                                <input
                                    type="checkbox"
                                    id="activo"
                                    checked={formData.activo}
                                    onChange={e => setFormData({ ...formData, activo: e.target.checked })}
                                    className="h-5 w-5 rounded-md border-2 border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                />
                                <Label htmlFor="activo" className="text-sm font-bold text-slate-700 cursor-pointer select-none">
                                    ✓ Proveedor Activo
                                </Label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="h-12 px-8 rounded-xl font-bold border-2 hover:bg-slate-100 transition-all"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="h-12 px-10 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 shadow-xl shadow-blue-500/40 rounded-xl font-bold text-base"
                            >
                                {isEditing ? "💾 Guardar Cambios" : "✨ Crear Proveedor"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Alert Dialog Premium */}
            <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
                <AlertDialogContent className="max-w-md bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
                    <AlertDialogHeader>
                        <div className="mx-auto mb-6 relative">
                            <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-30"></div>
                            <div className="relative p-5 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-xl">
                                <AlertCircle className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <AlertDialogTitle className="text-3xl font-black text-center bg-gradient-to-r from-slate-900 to-red-900 bg-clip-text text-transparent">
                            ¿Estás seguro?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-base pt-4 space-y-4">
                            <p className="text-slate-700 font-medium">
                                Esta acción eliminará el proveedor de forma <span className="font-bold text-red-600">permanente</span>.
                            </p>
                            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                                <p className="text-amber-800 font-semibold text-sm flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    Si tiene compras asociadas, no se podrá eliminar.
                                </p>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
                        <AlertDialogCancel className="h-12 px-8 rounded-xl font-bold border-2 hover:bg-slate-100">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="h-12 px-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-xl shadow-red-500/40 rounded-xl font-bold"
                        >
                            🗑️ Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
