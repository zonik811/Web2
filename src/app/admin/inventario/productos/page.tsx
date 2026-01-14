"use client";

import { useEffect, useState, useMemo } from "react";
import { Package, Plus, ScanBarcode, Store, Tag, AlertTriangle, TrendingUp, DollarSign, Upload, Loader2, Image as ImageIcon, Barcode as BarcodeIcon, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { InventoryPageLayout } from "@/components/admin/inventario/InventoryPageLayout";
import { PremiumKPICard } from "@/components/admin/inventario/PremiumKPICard";

import { Producto, Proveedor } from "@/types/inventario";
import { obtenerProductos, crearProducto, actualizarProducto, obtenerProveedores } from "@/lib/actions/inventario";
import { toast } from "sonner";
import { BarcodeScanner } from "@/components/admin/inventario/BarcodeScanner";
import { formatearPrecio } from "@/lib/utils";
import { subirArchivo, obtenerURLArchivo } from "@/lib/appwrite";

export default function ProductosPage() {
    const [productos, setProductos] = useState<Producto[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [scanMode, setScanMode] = useState<'search' | 'form'>('search');
    const [uploading, setUploading] = useState(false);

    // Form State
    const initialFormState: Partial<Producto> = {
        nombre: "",
        descripcion: "",
        sku: "",
        codigo_barras: "",
        categoria_id: "general",
        proveedor_id: "",
        precio_compra: 0,
        precio_venta: 0,
        stock: 0,
        stock_minimo: 5,
        visible_en_tienda: false,
        tiene_descuento: false,
        porcentaje_descuento: 0,
        precio_promocional: 0,
        imagenes: []
    };

    const [formData, setFormData] = useState<Partial<Producto>>(initialFormState);

    // Stats Calculation
    const stats = useMemo(() => {
        const total = productos.length;
        const lowStock = productos.filter(p => p.stock <= (p.stock_minimo || 5)).length;
        const totalValue = productos.reduce((sum, p) => sum + (p.stock * p.precio_venta), 0);
        const inStore = productos.filter(p => p.visible_en_tienda).length;
        return { total, lowStock, totalValue, inStore };
    }, [productos]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [prodData, provData] = await Promise.all([
                obtenerProductos(search),
                obtenerProveedores()
            ]);
            setProductos(prodData);
            setProveedores(provData);
        } catch (e) {
            toast.error("Error cargando productos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [search]);

    // Auto-calculate Promo Price
    useEffect(() => {
        if (formData.tiene_descuento && formData.precio_venta && formData.porcentaje_descuento) {
            const descuento = (formData.precio_venta * formData.porcentaje_descuento) / 100;
            setFormData(prev => ({ ...prev, precio_promocional: prev.precio_venta! - descuento }));
        }
    }, [formData.precio_venta, formData.porcentaje_descuento, formData.tiene_descuento]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                precio_compra: Number(formData.precio_compra) || 0,
                precio_venta: Number(formData.precio_venta) || 0,
                stock: Number(formData.stock) || 0,
                stock_minimo: Number(formData.stock_minimo) || 0,
                porcentaje_descuento: Number(formData.porcentaje_descuento) || 0,
                precio_promocional: Number(formData.precio_promocional) || 0,
                descripcion: formData.descripcion || "",
                sku: formData.sku || "",
                codigo_barras: formData.codigo_barras || "",
                proveedor_id: formData.proveedor_id || "",
                imagenes: formData.imagenes || []
            };

            if (isEditing && formData.$id) {
                const res = await actualizarProducto(formData.$id, payload);
                if (res.success) toast.success("✅ Producto actualizado correctamente");
                else throw new Error("Falló actualización");
            } else {
                const res = await crearProducto(payload as any);
                if (res.success) toast.success("✨ Producto creado exitosamente");
                else throw new Error("Falló creación");
            }
            setIsModalOpen(false);
            loadData();
        } catch (error) {
            console.error(error);
            toast.error("❌ Ocurrió un error al guardar");
        }
    };

    const handleEdit = (p: Producto) => {
        setFormData({
            ...p,
            descripcion: p.descripcion || "",
            sku: p.sku || "",
            codigo_barras: p.codigo_barras || "",
            proveedor_id: p.proveedor_id || "",
            imagenes: p.imagenes || [],
            precio_promocional: p.precio_promocional || 0,
            porcentaje_descuento: p.porcentaje_descuento || 0
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setFormData(initialFormState);
        setIsEditing(false);
        setIsModalOpen(true);
    };

    const handleScanSuccess = (code: string) => {
        if (scanMode === 'search') {
            setSearch(code);
            toast.info(`🔍 Buscando producto: ${code}`);
        } else {
            setFormData(prev => ({ ...prev, codigo_barras: code, sku: prev.sku || code }));
            toast.success("✓ Código asignado al formulario");
        }
        setIsScannerOpen(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const fileId = await subirArchivo(file);
            const url = obtenerURLArchivo(fileId);

            setFormData(prev => ({
                ...prev,
                imagenes: [url]
            }));

            toast.success("📷 Imagen subida correctamente");
        } catch (error) {
            console.error(error);
            toast.error("❌ Error al subir la imagen");
        } finally {
            setUploading(false);
        }
    };

    return (
        <InventoryPageLayout
            title="Inventario"
            description="Gestiona tu catálogo completo, precios y existencias"
            icon={Package}
        >
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PremiumKPICard
                    label="Total Productos"
                    value={stats.total}
                    icon={Package}
                    gradient="emerald"
                    badge="TOTAL"
                />
                <PremiumKPICard
                    label="Bajo Stock"
                    value={stats.lowStock}
                    icon={AlertTriangle}
                    gradient="amber"
                    badge="ALERTA"
                />
                <PremiumKPICard
                    label="Valor Inventario (PVP)"
                    value={formatearPrecio(stats.totalValue)}
                    icon={DollarSign}
                    gradient="emerald"
                    badge="VALORACIÓN"
                />
                <PremiumKPICard
                    label="Publicados en Tienda"
                    value={stats.inStore}
                    icon={Store}
                    gradient="purple"
                    badge="ONLINE"
                />
            </div>

            {/* Toolbar */}
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96 group">
                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                            <Input
                                placeholder="Buscar por nombre, SKU o código de barras..."
                                className="pl-12 h-12 border-2 border-slate-200 focus:border-emerald-500 transition-all rounded-2xl bg-white shadow-sm font-medium"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => { setScanMode('search'); setIsScannerOpen(true); }}
                                className="h-12 px-6 border-2 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 rounded-xl font-semibold"
                            >
                                <ScanBarcode className="mr-2 h-5 w-5" />
                                Escanear
                            </Button>
                            <Button
                                onClick={handleNew}
                                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-12 px-8 shadow-xl shadow-emerald-500/40 rounded-2xl font-bold"
                            >
                                <Plus className="mr-2 h-5 w-5" /> Nuevo Producto
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Products Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Package className="h-16 w-16 animate-pulse text-emerald-600" />
                    <p className="text-slate-600 font-semibold">Cargando productos...</p>
                </div>
            ) : productos.length === 0 ? (
                <Card className="border-0 shadow-xl p-16">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="p-6 bg-slate-100 rounded-full">
                            <Package className="h-16 w-16 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">No hay productos</h3>
                        <p className="text-slate-600 max-w-md">
                            Comienza agregando tu primer producto al catálogo
                        </p>
                        <Button onClick={handleNew} className="mt-4 bg-gradient-to-r from-emerald-600 to-green-600">
                            <Plus className="mr-2 h-5 w-5" /> Crear Primer Producto
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {productos.map((prod) => (
                        <Card
                            key={prod.$id}
                            className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1 bg-white"
                            onClick={() => handleEdit(prod)}
                        >
                            {/* Image */}
                            <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center overflow-hidden">
                                {prod.imagenes && prod.imagenes.length > 0 && prod.imagenes[0] ? (
                                    <img
                                        src={prod.imagenes[0]}
                                        alt={prod.nombre}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <Package className="h-16 w-16 text-slate-300 opacity-50" />
                                )}

                                {/* Status Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                                    {prod.stock <= 0 ? (
                                        <Badge variant="destructive" className="shadow-md font-bold border-2 border-white backdrop-blur-sm">
                                            ⚠️ AGOTADO
                                        </Badge>
                                    ) : prod.stock <= (prod.stock_minimo || 5) ? (
                                        <Badge className="bg-amber-500 hover:bg-amber-600 text-white shadow-md border-2 border-white font-bold backdrop-blur-sm">
                                            ⚡ POCO STOCK
                                        </Badge>
                                    ) : null}
                                    {prod.tiene_descuento && (
                                        <Badge className="bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md border-2 border-white backdrop-blur-sm font-bold">
                                            🔥 -{prod.porcentaje_descuento}% OFF
                                        </Badge>
                                    )}
                                </div>
                                {prod.visible_en_tienda && (
                                    <Badge className="absolute top-3 right-3 bg-emerald-500/90 hover:bg-emerald-600 backdrop-blur-sm shadow-md border-2 border-white font-semibold">
                                        🌐 Online
                                    </Badge>
                                )}
                            </div>

                            {/* Content */}
                            <CardContent className="p-5 space-y-4">
                                <div>
                                    <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2 mb-1 group-hover:text-emerald-700 transition-colors">
                                        {prod.nombre}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-mono">
                                        {prod.sku || 'N/A'} {prod.codigo_barras && `• ${prod.codigo_barras}`}
                                    </p>
                                </div>

                                <Separator />

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Precio Unit</p>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xl text-slate-900">
                                                {formatearPrecio((prod.tiene_descuento ? prod.precio_promocional : prod.precio_venta) || 0)}
                                            </span>
                                            {prod.tiene_descuento && (
                                                <span className="text-xs text- slate-400 line-through">
                                                    {formatearPrecio(prod.precio_venta || 0)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Disponible</p>
                                        <div className={`font-bold text-lg ${prod.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                            {prod.stock}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Form Modal - Split View */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-6xl p-0 overflow-hidden bg-slate-50/50 h-[90vh] flex flex-col">
                    <DialogHeader className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-green-50">
                        <DialogTitle className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-600 to-green-600 rounded-2xl shadow-lg">
                                {isEditing ? <Package className="h-7 w-7 text-white" /> : <Plus className="h-7 w-7 text-white" />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-3xl font-black bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
                                    {isEditing ? "✏️ Editar Producto" : "✨ Nuevo Producto"}
                                </span>
                                <span className="text-sm font-normal text-slate-600 mt-1">
                                    Completa la información para tu catálogo
                                </span>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                        {/* LEFT: FORM */}
                        <div className="flex-1 overflow-y-auto bg-white p-6 lg:p-8 border-r border-slate-200">
                            <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                                <Tabs defaultValue="general" className="w-full">
                                    <TabsList className="w-full justify-start bg-slate-100/50 p-1 mb-6 rounded-xl border border-slate-200">
                                        <TabsTrigger value="general" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 font-semibold">
                                            📦 Información General
                                        </TabsTrigger>
                                        <TabsTrigger value="prices" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 font-semibold">
                                            💰 Precios y Stock
                                        </TabsTrigger>
                                        <TabsTrigger value="store" className="flex-1 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-emerald-700 font-semibold">
                                            🌐 Tienda Online
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Tab: General */}
                                    <TabsContent value="general" className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-700">Nombre del Producto *</Label>
                                            <Input
                                                required
                                                value={formData.nombre}
                                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                                placeholder="Ej: Filtro de Aceite Cat 1R-0750"
                                                className="h-12 border-2 rounded-xl"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-700">Descripción</Label>
                                            <Input
                                                value={formData.descripcion}
                                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                                placeholder="Descripción breve del producto"
                                                className="h-12 border-2 rounded-xl"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700">SKU</Label>
                                                <Input
                                                    value={formData.sku}
                                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                    placeholder="SKU-001"
                                                    className="h-12 border-2 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700 flex items-center justify-between">
                                                    Código de Barras
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => { setScanMode('form'); setIsScannerOpen(true); }}
                                                        className="h-8"
                                                    >
                                                        <ScanBarcode className="h-4 w-4 mr-1" /> Escanear
                                                    </Button>
                                                </Label>
                                                <Input
                                                    value={formData.codigo_barras}
                                                    onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                                                    placeholder="7890123456789"
                                                    className="h-12 border-2 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-emerald-600" />
                                                Proveedor
                                            </Label>
                                            <Select value={formData.proveedor_id} onValueChange={(v) => setFormData({ ...formData, proveedor_id: v })}>
                                                <SelectTrigger className="h-12 border-2 rounded-xl">
                                                    <SelectValue placeholder="Seleccionar proveedor" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white z-50">
                                                    {proveedores.map(p => (
                                                        <SelectItem key={p.$id} value={p.$id}>{p.nombre}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Image Upload */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-bold text-slate-700">Imagen del Producto</Label>
                                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="hidden"
                                                    id="image-upload"
                                                    disabled={uploading}
                                                />
                                                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                                    {uploading ? (
                                                        <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
                                                    ) : (
                                                        <>
                                                            <Upload className="h-12 w-12 text-slate-400" />
                                                            <p className="text-sm font-semibold text-slate-600">
                                                                Click para subir imagen
                                                            </p>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Tab: Prices */}
                                    <TabsContent value="prices" className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700">Precio de Compra</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.precio_compra}
                                                    onChange={(e) => setFormData({ ...formData, precio_compra: parseFloat(e.target.value) || 0 })}
                                                    placeholder="0"
                                                    className="h-12 border-2 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700">Precio de Venta *</Label>
                                                <Input
                                                    type="number"
                                                    required
                                                    value={formData.precio_venta}
                                                    onChange={(e) => setFormData({ ...formData, precio_venta: parseFloat(e.target.value) || 0 })}
                                                    placeholder="0"
                                                    className="h-12 border-2 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700">Stock Actual *</Label>
                                                <Input
                                                    type="number"
                                                    required
                                                    value={formData.stock}
                                                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                                                    placeholder="0"
                                                    className="h-12 border-2 rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm font-bold text-slate-700">Stock Mínimo</Label>
                                                <Input
                                                    type="number"
                                                    value={formData.stock_minimo}
                                                    onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) || 5 })}
                                                    placeholder="5"
                                                    className="h-12 border-2 rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    </TabsContent>

                                    {/* Tab: Store */}
                                    <TabsContent value="store" className="space-y-6">
                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                                            <div className="flex items-center gap-3">
                                                <Store className="h-6 w-6 text-purple-600" />
                                                <div>
                                                    <Label className="text-sm font-bold text-slate-900">Visible en Tienda Online</Label>
                                                    <p className="text-xs text-slate-600">El producto aparecerá en tu catálogo web</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={formData.visible_en_tienda}
                                                onCheckedChange={(v) => setFormData({ ...formData, visible_en_tienda: v })}
                                            />
                                        </div>

                                        <Separator />

                                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border-2 border-rose-200">
                                            <div className="flex items-center gap-3">
                                                <Tag className="h-6 w-6 text-rose-600" />
                                                <div>
                                                    <Label className="text-sm font-bold text-slate-900">Tiene Descuento</Label>
                                                    <p className="text-xs text-slate-600">Activar promoción especial</p>
                                                </div>
                                            </div>
                                            <Switch
                                                checked={formData.tiene_descuento}
                                                onCheckedChange={(v) => setFormData({ ...formData, tiene_descuento: v })}
                                            />
                                        </div>

                                        {formData.tiene_descuento && (
                                            <div className="space-y-4 p-4 bg-rose-50 rounded-xl border-2 border-rose-200">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-slate-700">Porcentaje de Descuento (%)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.porcentaje_descuento}
                                                        onChange={(e) => setFormData({ ...formData, porcentaje_descuento: parseFloat(e.target.value) || 0 })}
                                                        placeholder="10"
                                                        max="100"
                                                        className="h-12 border-2 rounded-xl"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-bold text-slate-700">Precio Promocional (Auto-calculado)</Label>
                                                    <Input
                                                        type="number"
                                                        value={formData.precio_promocional}
                                                        readOnly
                                                        className="h-12 border-2 rounded-xl bg-slate-100"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>
                                </Tabs>
                            </form>
                        </div>

                        {/* RIGHT: PREVIEW */}
                        <div className="w-full lg:w-96 bg-gradient-to-br from-slate-100 to-slate-50 p-6 overflow-y-auto">
                            <div className="sticky top-0 space-y-4">
                                <h3 className="font-bold text-lg text-slate-900 mb-4">📱 Vista Previa</h3>

                                <Card className="border-0 shadow-xl overflow-hidden">
                                    <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-100 flex items-center justify-center">
                                        {formData.imagenes && formData.imagenes.length > 0 && formData.imagenes[0] ? (
                                            <img src={formData.imagenes[0]} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-16 w-16 text-slate-400" />
                                        )}

                                        {formData.stock !== undefined && formData.stock <= 0 && (
                                            <Badge variant="destructive" className="absolute top-3 left-3 font-bold">AGOTADO</Badge>
                                        )}

                                        {formData.visible_en_tienda && (
                                            <Badge className="absolute top-3 right-3 bg-emerald-500">Online</Badge>
                                        )}
                                    </div>

                                    <CardContent className="p-5 space-y-3">
                                        <h4 className="font-bold text-lg text-slate-900 line-clamp-2">
                                            {formData.nombre || "Nombre del producto"}
                                        </h4>

                                        <Separator />

                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold mb-1">PRECIO</p>
                                                <div className="text-2xl font-black text-emerald-600">
                                                    {formatearPrecio((formData.tiene_descuento ? formData.precio_promocional : formData.precio_venta) || 0)}
                                                </div>
                                                {formData.tiene_descuento && (
                                                    <span className="text-sm text-slate-400 line-through">
                                                        {formatearPrecio(formData.precio_venta || 0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 font-bold mb-1">STOCK</p>
                                                <div className={`text-xl font-bold ${(formData.stock || 0) > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {formData.stock || 0}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="bg-white rounded-xl p-4 space-y-2 text-sm border-2 border-slate-200">
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">SKU:</span>
                                        <span className="font-mono font-semibold">{formData.sku || "N/A"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Código de Barras:</span>
                                        <span className="font-mono font-semibold">{formData.codigo_barras || "N/A"}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between">
                                        <span className="text-slate-600">Margen:</span>
                                        <span className="font-bold text-emerald-600">
                                            {formData.precio_venta && formData.precio_compra
                                                ? formatearPrecio(formData.precio_venta - formData.precio_compra)
                                                : "$0"
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-8 py-6 border-t bg-white flex-row justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="h-12 px-8 rounded-xl font-bold border-2"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            form="product-form"
                            className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 h-12 px-10 shadow-xl shadow-emerald-500/40 rounded-xl font-bold"
                        >
                            {isEditing ? "💾 Guardar Cambios" : "✨ Crear Producto"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Barcode Scanner Modal */}
            <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <ScanBarcode className="h-6 w-6 text-emerald-600" />
                            Escanear Código de Barras
                        </DialogTitle>
                    </DialogHeader>
                    <BarcodeScanner onScanSuccess={handleScanSuccess} />
                </DialogContent>
            </Dialog>
        </InventoryPageLayout>
    );
}
