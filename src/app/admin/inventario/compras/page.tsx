"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical, Receipt, CreditCard, Trash2, FileText, DollarSign, TrendingUp, AlertCircle, Calendar } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { obtenerCompras, eliminarCompra } from "@/lib/actions/compras";
import { CompraProveedor } from "@/types/inventario";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { formatearPrecio, cn } from "@/lib/utils";
import { PaymentHistoryDialog } from "@/components/admin/inventario/PaymentHistoryDialog";
import { RegisterPaymentDialog } from "@/components/admin/inventario/RegisterPaymentDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ComprasPage() {
    const [compras, setCompras] = useState<CompraProveedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Payment State
    const [selectedCompra, setSelectedCompra] = useState<CompraProveedor | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);

    useEffect(() => {
        cargarCompras();
    }, []);

    const cargarCompras = async () => {
        setLoading(true);
        try {
            const data = await obtenerCompras();
            setCompras(data);
        } catch (error) {
            toast.error("Error al cargar compras");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta compra? Se revertirá el stock agregado.")) return;

        const res = await eliminarCompra(id);
        if (res.success) {
            toast.success("Compra eliminada y stock revertido");
            cargarCompras();
        } else {
            toast.error("Error al eliminar compra");
        }
    };

    const filteredCompras = compras.filter(c =>
        c.numeroCompra?.toLowerCase().includes(search.toLowerCase()) ||
        c.proveedorNombre?.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenHistory = (compra: CompraProveedor) => {
        setSelectedCompra(compra);
        setHistoryOpen(true);
    };

    const handleOpenRegister = (compra: CompraProveedor) => {
        setSelectedCompra(compra);
        setRegisterOpen(true);
    };

    // Calculate Summary KPIs
    const totalCompras = filteredCompras.reduce((acc, c) => acc + c.total, 0);
    const totalPagado = filteredCompras.reduce((acc, c) => acc + (c.monto_pagado || 0), 0);
    const totalPendiente = totalCompras - totalPagado;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                        Gestión de Compras
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Controla inventario, proveedores y estados financieros de tus adquisiciones.
                    </p>
                </div>
                <Link href="/admin/inventario/compras/nueva">
                    <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-105">
                        <Plus className="w-4 h-4 mr-2" /> Nueva Compra
                    </Button>
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Compras</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                            <Receipt className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{formatearPrecio(totalCompras)}</div>
                        <p className="text-xs text-slate-400 mt-1">Registradas este mes</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Pagado</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{formatearPrecio(totalPagado)}</div>
                        <p className="text-xs text-emerald-600/60 mt-1">
                            {((totalPagado / totalCompras || 0) * 100).toFixed(1)}% del total
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-none shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Por Pagar</CardTitle>
                        <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{formatearPrecio(totalPendiente)}</div>
                        <p className="text-xs text-amber-600/60 mt-1">Deuda pendiente proveedores</p>
                    </CardContent>
                </Card>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex gap-4 bg-slate-50/50">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Buscar por # compra, proveedor..."
                            className="pl-9 bg-white border-slate-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="w-[180px]">Compra</TableHead>
                                <TableHead>Proveedor</TableHead>
                                <TableHead className="w-[200px] text-center">Progreso Pago</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Por Pagar</TableHead>
                                <TableHead className="text-center">Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <div className="flex justify-center items-center gap-2 text-slate-500">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600"></div>
                                            Cargando datos...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredCompras.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                                        No se encontraron resultados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCompras.map((compra) => {
                                    const montoPagado = compra.monto_pagado || 0;
                                    const porPagar = Math.max(0, compra.total - montoPagado);
                                    const porcentaje = Math.min(100, (montoPagado / compra.total) * 100);
                                    const isPaid = compra.estado_pago === 'pagado';

                                    return (
                                        <TableRow key={compra.$id} className="hover:bg-slate-50/80 transition-colors group">
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-700">
                                                        {compra.numeroCompra || compra.$id.substring(0, 8)}
                                                    </span>
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {format(new Date(compra.fecha_compra), "d MMM yyyy", { locale: es })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 bg-blue-100 border border-blue-200">
                                                        <AvatarFallback className="text-blue-700 text-xs font-bold">
                                                            {compra.proveedorNombre?.substring(0, 2).toUpperCase() || "PV"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-slate-700">
                                                        {compra.proveedorNombre || 'Proveedor General'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-6">
                                                <div className="w-full space-y-1">
                                                    <div className="flex justify-between text-xs font-medium">
                                                        <span className={cn(isPaid ? "text-emerald-600" : "text-slate-500")}>
                                                            {porcentaje.toFixed(0)}%
                                                        </span>
                                                        <span className="text-slate-400">
                                                            {isPaid ? 'Completado' : 'En proceso'}
                                                        </span>
                                                    </div>
                                                    <Progress value={porcentaje} className="h-2"
                                                    // Custom color handled via class if needed, default is primary (black). 
                                                    // We can override via indicatorClassName if Progress supports it, or raw css.
                                                    // Shadcn Progress uses bg-primary. Let's assume default is fine or override wrapper color.
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="font-bold text-slate-700 block">
                                                    {formatearPrecio(compra.total)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={cn(
                                                    "font-medium",
                                                    porPagar > 0 ? "text-amber-600" : "text-emerald-600"
                                                )}>
                                                    {porPagar > 0 ? formatearPrecio(porPagar) : "$ 0"}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={isPaid ? 'default' : 'secondary'}
                                                    className={cn(
                                                        "shadow-sm",
                                                        isPaid
                                                            ? 'bg-emerald-500 hover:bg-emerald-600 border-transparent'
                                                            : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'
                                                    )}>
                                                    {isPaid ? 'Pagado' : 'Pendiente'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-white">
                                                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleOpenRegister(compra)}>
                                                            <CreditCard className="mr-2 h-4 w-4" /> Registrar Pago
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleOpenHistory(compra)}>
                                                            <Receipt className="mr-2 h-4 w-4" /> Ver Pagos
                                                        </DropdownMenuItem>

                                                        {compra.comprobante_url && (
                                                            <DropdownMenuItem onClick={() => window.open(compra.comprobante_url, '_blank')}>
                                                                <FileText className="mr-2 h-4 w-4" /> Ver Factura
                                                            </DropdownMenuItem>
                                                        )}

                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => handleDelete(compra.$id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Dialogs */}
            <PaymentHistoryDialog
                open={historyOpen}
                onOpenChange={setHistoryOpen}
                compra={selectedCompra}
            />

            <RegisterPaymentDialog
                open={registerOpen}
                onOpenChange={setRegisterOpen}
                compra={selectedCompra}
                onSuccess={cargarCompras}
            />
        </div>
    );
}
