"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, TrendingUp, AlertCircle, Package, Clock, Plus, Eye, Trash2, Building2, Calendar as CalendarIcon, DollarSign, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { InventoryPageLayout } from "@/components/admin/inventario/InventoryPageLayout";
import { PremiumKPICard } from "@/components/admin/inventario/PremiumKPICard";
import { PremiumTable, PremiumTableColumn } from "@/components/admin/inventario/PremiumTable";
import { PremiumModal } from "@/components/admin/inventario/PremiumModal";

import { obtenerCompras, registrarCompra, eliminarCompra } from "@/lib/actions/compras";
import { obtenerProveedores, obtenerProductos } from "@/lib/actions/inventario";
import { CompraProveedor, Producto, Proveedor, DetalleItemCompra } from "@/types/inventario";
import { formatearPrecio } from "@/lib/utils";
import { toast } from "sonner";

export default function ComprasPage() {
    const [compras, setCompras] = useState<CompraProveedor[]>([]);
    const [filteredCompras, setFilteredCompras] = useState<CompraProveedor[]>([]);
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCompra, setSelectedCompra] = useState<CompraProveedor | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Filters
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
    const [statusFilter, setStatusFilter] = useState<'todos' | 'pagado' | 'pendiente'>('todos');
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // KPIs
    const [kpis, setKpis] = useState({
        gastoMensual: 0,
        porPagar: 0,
        totalComprasMes: 0,
        ultimaCompra: null as CompraProveedor | null
    });

    // New Purchase Form
    const [newPurchase, setNewPurchase] = useState({
        proveedor_id: "",
        fecha_compra: new Date().toISOString().split('T')[0],
        factura_referencia: "",
        estado_pago: "pendiente" as "pendiente" | "pagado",
        items: [] as (DetalleItemCompra & { tempId: number, nombreProducto?: string })[]
    });

    const [currentItem, setCurrentItem] = useState({
        producto_id: "",
        cantidad: 1,
        precio_unitario: 0
    });

    const [aplicarIva, setAplicarIva] = useState(false);

    const loadData = async () => {
        setLoading(true);
        const [comprasData, provsData, prodsData] = await Promise.all([
            obtenerCompras(),
            obtenerProveedores(),
            obtenerProductos()
        ]);
        setCompras(comprasData);
        setProveedores(provsData);
        setProductos(prodsData);
        calcularKpis(comprasData);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filter Logic
    useEffect(() => {
        let filtered = [...compras];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(c => {
                const provName = getProvName(c.proveedor_id).toLowerCase();
                const ref = (c.factura_referencia || "").toLowerCase();
                return provName.includes(searchTerm.toLowerCase()) || ref.includes(searchTerm.toLowerCase());
            });
        }

        // Status filter
        if (statusFilter !== 'todos') {
            filtered = filtered.filter(c => c.estado_pago === statusFilter);
        }

        // Date range filter
        if (dateRange.from) {
            filtered = filtered.filter(c => {
                const compraDate = new Date(c.fecha_compra);
                return compraDate >= dateRange.from!;
            });
        }
        if (dateRange.to) {
            filtered = filtered.filter(c => {
                const compraDate = new Date(c.fecha_compra);
                return compraDate <= dateRange.to!;
            });
        }

        setFilteredCompras(filtered);
    }, [compras, searchTerm, statusFilter, dateRange]);

    const calcularKpis = (data: CompraProveedor[]) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const comprasMes = data.filter(c => {
            const d = new Date(c.fecha_compra);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const gastoMensual = comprasMes.reduce((sum, c) => sum + c.total, 0);
        const porPagar = data.filter(c => c.estado_pago === 'pendiente').reduce((sum, c) => sum + c.total, 0);
        const ultima = data.length > 0 ? data[0] : null;

        setKpis({
            gastoMensual,
            porPagar,
            totalComprasMes: comprasMes.length,
            ultimaCompra: ultima
        });
    };

    const handleAddItem = () => {
        if (!currentItem.producto_id || currentItem.cantidad <= 0 || currentItem.precio_unitario <= 0) {
            toast.error("Complete todos los campos del producto");
            return;
        }

        const prod = productos.find(p => p.$id === currentItem.producto_id);

        setNewPurchase(prev => ({
            ...prev,
            items: [
                ...prev.items,
                {
                    ...currentItem,
                    tempId: Date.now(),
                    nombreProducto: prod?.nombre || "Desconocido"
                }
            ]
        }));

        setCurrentItem({ producto_id: "", cantidad: 1, precio_unitario: 0 });
    };

    const handleRemoveItem = (tempId: number) => {
        setNewPurchase(prev => ({
            ...prev,
            items: prev.items.filter(i => i.tempId !== tempId)
        }));
    };

    const handleSubmit = async () => {
        if (!newPurchase.proveedor_id || newPurchase.items.length === 0) {
            toast.error("Seleccione proveedor y agregue productos");
            return;
        }

        const res = await registrarCompra({
            proveedor_id: newPurchase.proveedor_id,
            fecha_compra: new Date(newPurchase.fecha_compra).toISOString(),
            factura_referencia: newPurchase.factura_referencia,
            items: newPurchase.items.map(i => ({
                producto_id: i.producto_id,
                cantidad: i.cantidad,
                precio_unitario: i.precio_unitario
            })),
            estado_pago: newPurchase.estado_pago,
            aplicar_iva: aplicarIva
        });

        if (res.success) {
            toast.success("✨ Compra registrada exitosamente");
            setIsModalOpen(false);
            setNewPurchase({
                proveedor_id: "",
                fecha_compra: new Date().toISOString().split('T')[0],
                factura_referencia: "",
                estado_pago: "pendiente",
                items: []
            });
            setAplicarIva(false);
            loadData();
        } else {
            toast.error("❌ Error al registrar compra");
        }
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;

        const res = await eliminarCompra(itemToDelete);
        if (res.success) {
            toast.success('🗑️ Compra eliminada y stock revertido');
            loadData();
        } else {
            toast.error('❌ Error eliminando compra');
        }
        setItemToDelete(null);
    };

    const getProvName = (id: string) => proveedores.find(p => p.$id === id)?.nombre || id;

    const subtotalCompra = newPurchase.items.reduce((sum, i) => sum + (i.cantidad * i.precio_unitario), 0);
    const impuestosCompra = aplicarIva ? subtotalCompra * 0.19 : 0;
    const totalCompra = subtotalCompra + impuestosCompra;

    const getProductSummary = (c: CompraProveedor) => {
        let items: DetalleItemCompra[] = [];
        try {
            if (c.detalles_items) {
                items = JSON.parse(c.detalles_items);
            } else if (Array.isArray((c as any).items)) {
                items = (c as any).items.map((i: string) => JSON.parse(i));
            }
        } catch (e) { return "Error datos"; }

        if (!items.length) return "Sin productos";

        const names = items.map(i => {
            const p = productos.find(prod => prod.$id === i.producto_id);
            return p ? p.nombre : "???";
        });

        if (names.length <= 2) return names.join(", ");
        return `${names.slice(0, 2).join(", ")} (+${names.length - 2})`;
    };

    // Table columns definition
    const columns: PremiumTableColumn[] = [
        {
            key: "fecha_compra",
            header: "FECHA",
            width: "w-[140px]",
            render: (c: CompraProveedor) => (
                <div className="font-medium text-slate-700">
                    {new Date(c.fecha_compra).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })}
                </div>
            )
        },
        {
            key: "proveedor",
            header: "PROVEEDOR",
            render: (c: CompraProveedor) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform duration-200">
                        {getProvName(c.proveedor_id).substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-900">{getProvName(c.proveedor_id)}</span>
                </div>
            )
        },
        {
            key: "productos",
            header: "PRODUCTOS",
            render: (c: CompraProveedor) => (
                <div className="text-sm text-slate-600 truncate max-w-[250px]" title={getProductSummary(c)}>
                    {getProductSummary(c)}
                </div>
            )
        },
        {
            key: "referencia",
            header: "REFERENCIA",
            render: (c: CompraProveedor) => (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Hash className="h-4 w-4 text-slate-400" />
                    {c.factura_referencia || "N/A"}
                </div>
            )
        },
        {
            key: "total",
            header: "TOTAL",
            align: "right",
            render: (c: CompraProveedor) => (
                <span className="font-bold text-slate-900">{formatearPrecio(c.total)}</span>
            )
        },
        {
            key: "estado",
            header: "ESTADO",
            align: "center",
            render: (c: CompraProveedor) => (
                <Badge
                    className={c.estado_pago === 'pagado'
                        ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md font-semibold"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-md font-semibold"
                    }
                >
                    {c.estado_pago === 'pagado' ? '✓ Pagado' : '⏳ Pendiente'}
                </Badge>
            )
        },
        {
            key: "actions",
            header: "ACCIONES",
            align: "right",
            render: (c: CompraProveedor) => (
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setSelectedCompra(c);
                            setIsDetailOpen(true);
                        }}
                        className="h-10 w-10 p-0 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-all"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setItemToDelete(c.$id)}
                        className="h-10 w-10 p-0 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <InventoryPageLayout
            title="Gestión de Compras"
            description="Controla tus gastos, facturas de proveedores y stock entrante"
            icon={ShoppingCart}
        >
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PremiumKPICard
                    label="Gasto Mes Actual"
                    value={formatearPrecio(kpis.gastoMensual)}
                    icon={TrendingUp}
                    gradient="orange"
                    badge="TOTAL"
                />
                <PremiumKPICard
                    label="Cuentas por Pagar"
                    value={formatearPrecio(kpis.porPagar)}
                    icon={AlertCircle}
                    gradient={kpis.porPagar > 0 ? "red" : "emerald"}
                    badge="PENDIENTE"
                />
                <PremiumKPICard
                    label="Compras (Mes)"
                    value={kpis.totalComprasMes}
                    icon={Package}
                    gradient="amber"
                    badge="CANTIDAD"
                />
                <PremiumKPICard
                    label="Última Actividad"
                    value={kpis.ultimaCompra ? new Date(kpis.ultimaCompra.fecha_compra).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' }) : "N/A"}
                    icon={Clock}
                    gradient="purple"
                    badge={kpis.ultimaCompra ? getProvName(kpis.ultimaCompra.proveedor_id).substring(0, 12) : ""}
                />
            </div>

            {/* Table with Filters */}
            <PremiumTable
                columns={columns}
                data={filteredCompras}
                loading={loading}
                emptyMessage="No se encontraron compras"
                searchPlaceholder="Buscar por proveedor o factura..."
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                actions={
                    <div className="flex gap-3">
                        {/* Date Filter */}
                        <div className="flex gap-2">
                            <Input
                                type="date"
                                value={dateRange.from ? dateRange.from.toISOString().split('T')[0] : ''}
                                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value ? new Date(e.target.value) : undefined }))}
                                className="h-12 border-2 border-slate-200 rounded-xl"
                            />
                            <Input
                                type="date"
                                value={dateRange.to ? dateRange.to.toISOString().split('T')[0] : ''}
                                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value ? new Date(e.target.value) : undefined }))}
                                className="h-12 border-2 border-slate-200 rounded-xl"
                            />
                        </div>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                            <SelectTrigger className="w-[180px] h-12 border-2 border-slate-200 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white z-50">
                                <SelectItem value="todos">Todos</SelectItem>
                                <SelectItem value="pagado">Pagados</SelectItem>
                                <SelectItem value="pendiente">Pendientes</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* New Button */}
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-12 px-8 shadow-xl shadow-orange-500/40 rounded-2xl font-bold"
                        >
                            <Plus className="mr-2 h-5 w-5" /> Registrar Compra
                        </Button>
                    </div>
                }
            />

            {/* New Purchase Modal */}
            <PremiumModal
                title={`Registrar Compra`}
                icon={ShoppingCart}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
                maxWidth="3xl"
                footer={
                    <>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsModalOpen(false)}
                            className="h-12 px-8 rounded-xl font-bold border-2"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 h-12 px-10 shadow-xl shadow-orange-500/40 rounded-xl font-bold"
                        >
                            ✨ Guardar Compra
                        </Button>
                    </>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-orange-600" />
                            Proveedor *
                        </Label>
                        <Select value={newPurchase.proveedor_id} onValueChange={(v) => setNewPurchase({ ...newPurchase, proveedor_id: v })}>
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

                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 text-orange-600" />
                            Fecha de Compra
                        </Label>
                        <Input
                            type="date"
                            value={newPurchase.fecha_compra}
                            onChange={(e) => setNewPurchase({ ...newPurchase, fecha_compra: e.target.value })}
                            className="h-12 border-2 rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Factura / Referencia</Label>
                        <Input
                            value={newPurchase.factura_referencia}
                            onChange={(e) => setNewPurchase({ ...newPurchase, factura_referencia: e.target.value })}
                            placeholder="Ej: FAC-001"
                            className="h-12 border-2 rounded-xl"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Estado de Pago</Label>
                        <Select value={newPurchase.estado_pago} onValueChange={(v: any) => setNewPurchase({ ...newPurchase, estado_pago: v })}>
                            <SelectTrigger className="h-12 border-2 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white z-50">
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="pagado">Pagado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Separator className="my-6" />

                {/* Add Items Section */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Package className="h-5 w-5 text-orange-600" />
                        Productos Comprados
                    </h3>

                    <div className="grid grid-cols-12 gap-3">
                        <div className="col-span-5">
                            <Select value={currentItem.producto_id} onValueChange={(v) => setCurrentItem({ ...currentItem, producto_id: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Producto" />
                                </SelectTrigger>
                                <SelectContent className="bg-white z-50">
                                    {productos.map(p => (
                                        <SelectItem key={p.$id} value={p.$id}>{p.nombre} - Stock: {p.stock}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-2">
                            <Input
                                type="number"
                                placeholder="Cant."
                                value={currentItem.cantidad}
                                onChange={(e) => setCurrentItem({ ...currentItem, cantidad: parseInt(e.target.value) || 1 })}
                            />
                        </div>
                        <div className="col-span-3">
                            <Input
                                type="number"
                                placeholder="Precio Unit."
                                value={currentItem.precio_unitario}
                                onChange={(e) => setCurrentItem({ ...currentItem, precio_unitario: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="col-span-2">
                            <Button onClick={handleAddItem} className="w-full bg-emerald-600 hover:bg-emerald-700">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Items List */}
                    {newPurchase.items.length > 0 && (
                        <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-100">
                                    <TableRow>
                                        <TableHead className="font-bold">Producto</TableHead>
                                        <TableHead className="text-center font-bold">Cantidad</TableHead>
                                        <TableHead className="text-right font-bold">Precio Unit.</TableHead>
                                        <TableHead className="text-right font-bold">Subtotal</TableHead>
                                        <TableHead className="w-[60px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {newPurchase.items.map(item => (
                                        <TableRow key={item.tempId}>
                                            <TableCell className="font-medium">{item.nombreProducto}</TableCell>
                                            <TableCell className="text-center">{item.cantidad}</TableCell>
                                            <TableCell className="text-right">{formatearPrecio(item.precio_unitario)}</TableCell>
                                            <TableCell className="text-right font-bold">{formatearPrecio(item.cantidad * item.precio_unitario)}</TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.tempId)} className="hover:bg-red-100 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Totals */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-xl border-2 border-slate-200 space-y-3">
                        <div className="flex items-center gap-3">
                            <Switch checked={aplicarIva} onCheckedChange={setAplicarIva} />
                            <Label className="font-semibold">Aplicar IVA (19%)</Label>
                        </div>
                        <div className="space-y-2 text-right">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal:</span>
                                <span className="font-semibold">{formatearPrecio(subtotalCompra)}</span>
                            </div>
                            {aplicarIva && (
                                <div className="flex justify-between text-slate-600">
                                    <span>IVA (19%):</span>
                                    <span className="font-semibold">{formatearPrecio(impuestosCompra)}</span>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between text-2xl font-black">
                                <span>Total:</span>
                                <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                    {formatearPrecio(totalCompra)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </PremiumModal>

            {/* Detail Modal */}
            <PremiumModal
                title="Detalle de Compra"
                icon={Eye}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                maxWidth="2xl"
            >
                {selectedCompra && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl">
                            <div>
                                <p className="text-sm text-slate-500 font-semibold">Proveedor</p>
                                <p className="text-lg font-bold text-slate-900">{getProvName(selectedCompra.proveedor_id)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-semibold">Fecha</p>
                                <p className="text-lg font-bold text-slate-900">
                                    {new Date(selectedCompra.fecha_compra).toLocaleDateString('es-CO')}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-semibold">Referencia</p>
                                <p className="text-lg font-bold text-slate-900">{selectedCompra.factura_referencia || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-semibold">Estado</p>
                                <Badge className={selectedCompra.estado_pago === 'pagado' ? "bg-emerald-500" : "bg-amber-500"}>
                                    {selectedCompra.estado_pago === 'pagado' ? 'Pagado' : 'Pendiente'}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3">Productos</h4>
                            <p className="text-slate-600">{getProductSummary(selectedCompra)}</p>
                        </div>

                        <div className="bg-slate-100 p-4 rounded-xl space-y-2 text-right">
                            <div className="flex justify-between">
                                <span className="font-semibold">Total:</span>
                                <span className="text-2xl font-black text-orange-600">{formatearPrecio(selectedCompra.total)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </PremiumModal>

            {/* Delete Alert */}
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
                            ¿Eliminar Compra?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-base pt-4 space-y-4">
                            <p className="text-slate-700 font-medium">
                                Esta acción eliminará la compra y <span className="font-bold text-red-600">revertirá el stock</span>.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="sm:justify-center gap-3 mt-6">
                        <AlertDialogCancel className="h-12 px-8 rounded-xl font-bold border-2">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-xl shadow-red-500/40 rounded-xl font-bold h-12 px-8"
                        >
                            🗑️ Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </InventoryPageLayout>
    );
}
