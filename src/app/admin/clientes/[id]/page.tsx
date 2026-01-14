"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Calendar,
    CreditCard,
    DollarSign,
    Mail,
    MapPin,
    Phone,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    FileText,
    Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { obtenerDetalleCliente } from "@/lib/actions/clientes";
import { formatearFecha, formatearPrecio } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DetalleClientePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            cargarDetalle();
        }
    }, [id]);

    const cargarDetalle = async () => {
        try {
            setLoading(true);
            const resultado = await obtenerDetalleCliente(id);
            setData(resultado);
        } catch (error) {
            console.error("Error cargando detalle:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
                <p className="text-gray-500 font-medium">Cargando perfil del cliente...</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <User className="h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900">Cliente no encontrado</h2>
                <Button variant="outline" className="mt-4" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                </Button>
            </div>
        );
    }

    const { cliente, estadisticas, citas, pagos } = data;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-4 border-white shadow-lg bg-blue-100">
                            <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">
                                {cliente.nombre.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{cliente.nombre}</h1>
                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                <span className="flex items-center"><MapPin className="h-3.5 w-3.5 mr-1" /> {cliente.ciudad}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="badge-type capitalize">{cliente.tipoCliente || 'Residencial'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none">
                        <Pencil className="mr-2 h-4 w-4" /> Editar Perfil
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700 flex-1 md:flex-none shadow-lg shadow-blue-600/20">
                        <Calendar className="mr-2 h-4 w-4" /> Nueva Cita
                    </Button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Saldo Pendiente Card - Highlighted */}
                <Card className={`border-none shadow-md overflow-hidden relative ${estadisticas.saldoPendiente > 0 ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white' : 'bg-white'}`}>
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <AlertCircle className="h-24 w-24" />
                    </div>
                    <CardHeader className="pb-2 relative z-10">
                        <CardTitle className={`text-sm font-medium flex items-center ${estadisticas.saldoPendiente > 0 ? 'text-red-100' : 'text-gray-500'}`}>
                            <DollarSign className="mr-2 h-4 w-4" /> Saldo Pendiente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className={`text-3xl font-bold ${estadisticas.saldoPendiente > 0 ? 'text-white' : 'text-gray-900'}`}>
                            {formatearPrecio(estadisticas.saldoPendiente)}
                        </div>
                        <p className={`text-xs mt-1 ${estadisticas.saldoPendiente > 0 ? 'text-red-100' : 'text-gray-500'}`}>
                            Por servicios no pagados
                        </p>
                    </CardContent>
                </Card>

                {/* Total Pagado */}
                <Card className="border-none shadow-md bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-gray-500 text-sm font-medium flex items-center">
                            <CreditCard className="mr-2 h-4 w-4 text-emerald-500" /> Total Pagado Histórico
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{formatearPrecio(estadisticas.totalPagado)}</div>
                        <p className="text-xs text-gray-500 mt-1">A través de {pagos.length} transacciones</p>
                    </CardContent>
                </Card>

                {/* Servicios Realizados */}
                <Card className="border-none shadow-md bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-gray-500 text-sm font-medium flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-blue-500" /> Servicios Completados
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">{estadisticas.totalServicios}</div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            {estadisticas.proximaCita ? (
                                <span className="text-blue-600 font-medium flex items-center">
                                    <Clock className="h-3 w-3 mr-1" /> Próxima: {formatearFecha(estadisticas.proximaCita.fechaCita)}
                                </span>
                            ) : (
                                <span>No hay citas programadas</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="citas" className="space-y-6">
                <TabsList className="bg-white p-1 rounded-lg border border-gray-100 shadow-sm w-full md:w-auto flex overflow-x-auto">
                    <TabsTrigger value="citas" className="flex-1 md:flex-none">Historial de Citas</TabsTrigger>
                    <TabsTrigger value="pagos" className="flex-1 md:flex-none">Historial de Pagos</TabsTrigger>
                    <TabsTrigger value="info" className="flex-1 md:flex-none">Información Personal</TabsTrigger>
                </TabsList>

                <TabsContent value="citas">
                    <Card className="border-none shadow-md overflow-hidden bg-white">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                            <CardTitle className="text-lg font-semibold text-gray-800">Servicios Contratados</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {citas.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">No hay citas registradas.</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Servicio</TableHead>
                                            <TableHead>Precio</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead>Pago</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {citas.map((cita: any) => (
                                            <TableRow key={cita.$id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium text-gray-900">
                                                    {formatearFecha(cita.fechaCita)}
                                                    <div className="text-xs text-gray-500">{cita.horaCita}</div>
                                                </TableCell>
                                                <TableCell className="capitalize">{cita.servicio || 'Limpieza General'}</TableCell>
                                                <TableCell>{formatearPrecio(cita.precioAcordado || cita.precioCliente)}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={`
                                                        ${cita.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' :
                                                            cita.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-gray-100 text-gray-700'} capitalize shadow-none font-normal
                                                    `}>
                                                        {cita.estado}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {cita.pagadoPorCliente ? (
                                                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                                            <CheckCircle2 className="h-3 w-3 mr-1" /> Pagado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                                            Pendiente
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pagos">
                    <Card className="border-none shadow-md overflow-hidden bg-white">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                            <CardTitle className="text-lg font-semibold text-gray-800">Pagos Realizados</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {pagos.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">No hay pagos registrados.</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Método</TableHead>
                                            <TableHead>Referencia</TableHead>
                                            <TableHead className="text-right">Monto</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pagos.map((pago: any) => (
                                            <TableRow key={pago.$id}>
                                                <TableCell className="font-medium">{formatearFecha(pago.fechaPago)}</TableCell>
                                                <TableCell className="capitalize">{pago.metodoPago}</TableCell>
                                                <TableCell className="text-gray-500 text-sm">
                                                    {pago.citaId ? `Cita ...${pago.citaId.slice(-6)}` : 'Abono General'}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-gray-900">
                                                    {formatearPrecio(pago.monto)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="info">
                    <Card className="border-none shadow-md bg-white">
                        <CardHeader>
                            <CardTitle>Datos de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                                        <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Teléfono</p>
                                            <p className="text-base font-medium text-gray-900">{cliente.telefono}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                                        <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Correo Electrónico</p>
                                            <p className="text-base font-medium text-gray-900">{cliente.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Dirección Principal</p>
                                            <p className="text-base font-medium text-gray-900">{cliente.direccion}</p>
                                            <p className="text-sm text-gray-500">{cliente.ciudad}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                                        <FileText className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Notas Adicionales</p>
                                            <p className="text-sm text-gray-700">{cliente.notasImportantes || "Sin notas registradas."}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
