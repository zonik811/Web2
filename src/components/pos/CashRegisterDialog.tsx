"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DollarSign, Lock, AlertTriangle, CreditCard } from "lucide-react";
import { abrirCaja, cerrarCaja, obtenerResumenTurno } from "@/lib/actions/caja";
import { TurnoCaja } from "@/types/caja";
import { formatearPrecio } from "@/lib/utils";
import { obtenerEmpleadosActivos, type EmpleadoPOS } from "@/lib/actions/empleados-pos";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CashRegisterDialogProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'abrir' | 'cerrar';
    userId: string;
    userName: string;
    turnoActivo?: TurnoCaja | null;
    onSuccess: () => void;
}

export function CashRegisterDialog({ isOpen, onClose, mode, userId, userName, turnoActivo, onSuccess }: CashRegisterDialogProps) {
    const [amount, setAmount] = useState("");
    const [cardAmount, setCardAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [systemTotal, setSystemTotal] = useState(0);

    // Employee selection
    const [employees, setEmployees] = useState<EmpleadoPOS[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [loadingEmployees, setLoadingEmployees] = useState(false);

    useEffect(() => {
        if (isOpen && mode === 'abrir') {
            // Load employees when opening
            setLoadingEmployees(true);
            obtenerEmpleadosActivos().then(emps => {
                setEmployees(emps);
                setLoadingEmployees(false);
            });
        }

        if (isOpen && mode === 'cerrar' && turnoActivo) {
            // Load expected totals for reference
            obtenerResumenTurno(turnoActivo.$id).then(res => {
                setSystemTotal(res.totalEfectivo);
            });
        }

        setAmount("");
        setCardAmount("");
        setError("");
        setSelectedEmployeeId("");
    }, [isOpen, mode, turnoActivo]);

    const handleSubmit = async () => {
        setLoading(true);
        setError("");

        try {
            if (mode === 'abrir') {
                if (!selectedEmployeeId) {
                    throw new Error("Selecciona un empleado");
                }

                const selectedEmployee = employees.find(e => e.$id === selectedEmployeeId);
                const employeeName = selectedEmployee ? `${selectedEmployee.nombre} ${selectedEmployee.apellido}` : userName;

                const base = parseFloat(amount) || 0;
                const res = await abrirCaja(selectedEmployeeId, employeeName, base);
                if (!res.success) throw new Error(res.error as string);
            } else {
                if (!turnoActivo) return;
                const efectivo = parseFloat(amount) || 0;
                const tarjetas = parseFloat(cardAmount) || 0;
                const res = await cerrarCaja(turnoActivo.$id, userId, { efectivo, tarjetas });
                if (!res.success) throw new Error(res.error as string);
            }
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || "Ocurrió un error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        {mode === 'abrir' ? (
                            <>
                                <DollarSign className="h-6 w-6 text-emerald-600" />
                                Abrir Caja
                            </>
                        ) : (
                            <>
                                <Lock className="h-6 w-6 text-red-600" />
                                Cerrar Caja (Arqueo)
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {mode === 'abrir' ? (
                        <>
                            <div className="space-y-2">
                                <Label>Empleado a Cargo</Label>
                                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Selecciona un empleado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingEmployees ? (
                                            <SelectItem value="loading" disabled>Cargando...</SelectItem>
                                        ) : employees.length === 0 ? (
                                            <SelectItem value="empty" disabled>No hay empleados</SelectItem>
                                        ) : (
                                            employees.map(emp => (
                                                <SelectItem key={emp.$id} value={emp.$id}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{emp.nombre} {emp.apellido}</span>
                                                        <span className="text-xs text-slate-500">{emp.cargo}</span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-slate-500">Empleado responsable del turno de caja</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Base Inicial (Efectivo)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        className="pl-9 h-12 text-lg font-medium"
                                        placeholder="0"
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                                <p className="text-sm text-slate-500">Monto de dinero físico en el cajón al iniciar.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Alert className="bg-slate-50 border-slate-200">
                                <AlertDescription className="text-slate-600">
                                    Total esperado en sistema (Efectivo): <strong>{formatearPrecio(systemTotal)}</strong>
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-2">
                                <Label>Efectivo en Caja (Real)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        className="pl-9 h-12 text-lg font-medium"
                                        placeholder="0"
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Vouchers / Tarjetas (Total)</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        className="pl-9"
                                        placeholder="0"
                                        type="number"
                                        value={cardAmount}
                                        onChange={e => setCardAmount(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Live Difference preview */}
                            {amount && (
                                <div className={`p-3 rounded-lg text-sm font-medium flex justify-between ${(parseFloat(amount) || 0) - systemTotal >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                    <span>Diferencia Estimada:</span>
                                    <span>{formatearPrecio((parseFloat(amount) || 0) - systemTotal)}</span>
                                </div>
                            )}
                        </>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={mode === 'abrir' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
                    >
                        {loading ? 'Procesando...' : (mode === 'abrir' ? 'Abrir Turno' : 'Cerrar Turno')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
