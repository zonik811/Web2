"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Plus, Search, Trash2, Save, ShoppingCart, Loader2 } from "lucide-react";
import Link from "next/link";


import { obtenerProveedores, obtenerProductos } from "@/lib/actions/inventario";
import { registrarCompra, DetalleItemCompra } from "@/lib/actions/compras";
import { Proveedor, Producto } from "@/types/inventario";
import { formatearPrecio } from "@/lib/utils";
import { ImageUploader } from "@/components/ordenes-trabajo/ImageUploader";

export default function NuevaCompraPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Data Sources
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [productos, setProductos] = useState<Producto[]>([]);

    // Form State
    const [proveedorId, setProveedorId] = useState("");
    const [fechaCompra, setFechaCompra] = useState(new Date().toISOString().split('T')[0]);
    const [facturaRef, setFacturaRef] = useState("");
    const [comprobanteUrl, setComprobanteUrl] = useState("");
    const [estadoPago, setEstadoPago] = useState<'pendiente' | 'pagado'>('pendiente');

    // Items State
    const [items, setItems] = useState<DetalleItemCompra[]>([]);
    const [selectedProdId, setSelectedProdId] = useState("");
    const [cantidad, setCantidad] = useState("1");
    const [costoUnitario, setCostoUnitario] = useState("");

    useEffect(() => {
        const loadJava = async () => {
            const [provs, prods] = await Promise.all([
                obtenerProveedores(),
                obtenerProductos()
            ]);
            setProveedores(provs);
            setProductos(prods);
        };
        loadJava();
    }, []);

    // Handle Product Selection to auto-fill cost
    useEffect(() => {
        if (selectedProdId) {
            const prod = productos.find(p => p.$id === selectedProdId);
            if (prod) {
                setCostoUnitario(prod.precio_compra.toString());
            }
        }
    }, [selectedProdId, productos]);

    const handleAddItem = () => {
        if (!selectedProdId || !cantidad || !costoUnitario) return;

        const cant = parseInt(cantidad);
        const cost = parseFloat(costoUnitario);

        if (cant <= 0 || cost < 0) {
            toast.error("Cantidad y costo deben ser válidos");
            return;
        }

        // Check if exists
        const existing = items.find(i => i.producto_id === selectedProdId);
        if (existing) {
            toast.error("El producto ya está en la lista. Elimínelo para modificar.");
            return;
        }

        setItems([...items, {
            producto_id: selectedProdId,
            cantidad: cant,
            precio_unitario: cost
        }]);

        // Reset inputs
        setSelectedProdId("");
        setCantidad("1");
        setCostoUnitario("");
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!proveedorId) {
            toast.error("Seleccione un proveedor");
            return;
        }
        if (items.length === 0) {
            toast.error("Agregue al menos un producto");
            return;
        }

        setLoading(true);
        try {
            const res = await registrarCompra({
                proveedor_id: proveedorId,
                fecha_compra: new Date(fechaCompra).toISOString(),
                factura_referencia: facturaRef,
                items: items,
                comprobante_url: comprobanteUrl,
                estado_pago: estadoPago,
                aplicar_iva: false // TODO: UI for this
            });

            if (res.success) {
                toast.success("Compra registrada exitosamente");
                router.push("/admin/inventario/compras");
            } else {
                toast.error("Error al registrar compra");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error inesperado");
        } finally {
            setLoading(false);
        }
    };

    const subtotal = items.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0);
    const total = subtotal; // Add tax logic if needed later

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center gap-4">
                <Link href="/admin/inventario/compras">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Registrar Nueva Compra</h1>
                    <p className="text-slate-500">Ingreso de mercancía al inventario</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Header */}
                <Card className="lg:col-span-3 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-blue-500" />
                            Datos Generales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="grid gap-2">
                            <Label>Proveedor</Label>
                            <Select value={proveedorId} onValueChange={setProveedorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seleccione Proveedor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {proveedores.map(p => (
                                        <SelectItem key={p.$id} value={p.$id}>{p.nombre}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Fecha Compra</Label>
                            <Input type="date" value={fechaCompra} onChange={e => setFechaCompra(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label>Referencia Factura</Label>
                            <Input placeholder="# Factura" value={facturaRef} onChange={e => setFacturaRef(e.target.value)} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Comprobante</Label>
                            <ImageUploader
                                maxImages={1}
                                label="Subir Foto"
                                onImagesChange={(imgs: string[]) => setComprobanteUrl(imgs[0] || "")}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Estado de Pago</Label>
                            <Select value={estadoPago} onValueChange={(v: any) => setEstadoPago(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pendiente">Pendiente (Crédito)</SelectItem>
                                    <SelectItem value="pagado">Pagado (Contado)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Items Section */}
                <Card className="lg:col-span-2 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>Items de la Compra</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2 items-end bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex-1 space-y-2">
                                <Label>Producto</Label>
                                <Select value={selectedProdId} onValueChange={setSelectedProdId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Buscar producto..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {productos.map(p => (
                                            <SelectItem key={p.$id} value={p.$id}>
                                                {p.nombre} (Stock: {p.stock})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-24 space-y-2">
                                <Label>Cant.</Label>
                                <Input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} />
                            </div>
                            <div className="w-32 space-y-2">
                                <Label>Costo Unit.</Label>
                                <Input type="number" value={costoUnitario} onChange={e => setCostoUnitario(e.target.value)} />
                            </div>
                            <Button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="border rounded-md overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50">
                                        <TableHead>Producto</TableHead>
                                        <TableHead className="text-right">Cantidad</TableHead>
                                        <TableHead className="text-right">Costo</TableHead>
                                        <TableHead className="text-right">Subtotal</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-slate-500">
                                                Agregue productos a la lista
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item, idx) => {
                                            const prod = productos.find(p => p.$id === item.producto_id);
                                            return (
                                                <TableRow key={idx}>
                                                    <TableCell>{prod?.nombre || 'Producto'}</TableCell>
                                                    <TableCell className="text-right">{item.cantidad}</TableCell>
                                                    <TableCell className="text-right">{formatearPrecio(item.precio_unitario)}</TableCell>
                                                    <TableCell className="text-right font-medium">{formatearPrecio(item.cantidad * item.precio_unitario)}</TableCell>
                                                    <TableCell>
                                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Totals & Action */}
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm bg-slate-50">
                        <CardHeader>
                            <CardTitle>Resumen</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatearPrecio(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600">
                                <span>Impuestos</span>
                                <span>$0</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-xl font-bold text-slate-900">
                                <span>Total</span>
                                <span>{formatearPrecio(total)}</span>
                            </div>

                            <Button onClick={handleSubmit} disabled={loading || items.length === 0} className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                Finalizar Compra
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
