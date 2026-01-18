"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { importCollectionData } from "@/lib/actions/data-management";
import { toast } from "sonner";
import { Loader2, UploadCloud, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId: string;
    collectionName: string;
    onSuccess?: () => void;
}

export function ImportDialog({ open, onOpenChange, collectionId, collectionName, onSuccess }: ImportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<{ processed: number; created: number; updated: number; errors: number } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStats(null); // Reset stats on new file
        }
    };

    const handleImport = async () => {
        if (!file) return;

        setLoading(true);
        try {
            const text = await file.text();
            let data;
            try {
                data = JSON.parse(text);
                if (!Array.isArray(data)) throw new Error("El archivo debe contener un arreglo de documentos");
            } catch (err) {
                toast.error("Archivo JSON inválido");
                setLoading(false);
                return;
            }

            const result = await importCollectionData(collectionId, data);

            if (result.success && result.stats) {
                setStats(result.stats);
                toast.success(`Importación completada: ${result.stats.processed} procesados`);
                if (onSuccess) onSuccess();
            } else {
                toast.error("Error al importar datos");
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!loading) {
                onOpenChange(val);
                if (!val) {
                    setFile(null);
                    setStats(null);
                }
            }
        }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Importar Datos: {collectionName}</DialogTitle>
                    <DialogDescription>
                        Sube un archivo JSON previamente exportado para restaurar datos.
                        Los registros existentes se actualizarán y los nuevos se crearán.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {!stats ? (
                        <div className="space-y-4">
                            <Alert className="bg-amber-50 text-amber-900 border-amber-200">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Advertencia</AlertTitle>
                                <AlertDescription>
                                    Esta acción modificará la base de datos. Asegúrate de tener un respaldo reciente.
                                </AlertDescription>
                            </Alert>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="file">Archivo JSON</Label>
                                <Input id="file" type="file" accept=".json" onChange={handleFileChange} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-lg border p-4 bg-slate-50">
                                <h4 className="font-semibold mb-2">Resultados de Importación</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Procesados:</span>
                                        <span className="font-medium">{stats.processed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-emerald-600">Creados:</span>
                                        <span className="font-medium">{stats.created}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-600">Actualizados:</span>
                                        <span className="font-medium">{stats.updated}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-red-600">Errores:</span>
                                        <span className="font-medium">{stats.errors}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {!stats ? (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button onClick={handleImport} disabled={!file || loading} className="bg-blue-600 hover:bg-blue-700">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importando...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud className="mr-2 h-4 w-4" /> Importar Ahora
                                    </>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => onOpenChange(false)}>
                            Cerrar
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
