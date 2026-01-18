"use client";

import { useEffect, useState } from "react";
import { getDatabaseStats, CollectionStats, exportCollectionData } from "@/lib/actions/data-management";
import { DataCollectionCard } from "@/components/admin/configuracion/DataCollectionCard";
import { Loader2, Database, ShieldCheck, DownloadCloud } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import JSZip from "jszip";
import { toast } from "sonner";


export default function DataManagementPage() {
    const [stats, setStats] = useState<CollectionStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [bulkExporting, setBulkExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState(0);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const data = await getDatabaseStats();
            // Ordenar alfabéticamente por nombre
            data.sort((a, b) => a.name.localeCompare(b.name));
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkExport = async () => {
        if (confirm("Esta operación puede tardar unos minutos dependiendo del tamaño de la base de datos. ¿Deseas continuar?")) {
            setBulkExporting(true);
            setExportProgress(0);

            try {
                const zip = new JSZip();
                const total = stats.length;
                let processed = 0;

                for (const collection of stats) {
                    try {
                        // Update progress (roughly)
                        setExportProgress(Math.round((processed / total) * 100));

                        const result = await exportCollectionData(collection.id);
                        if (result.success && result.data) {
                            zip.file(`${collection.name}.json`, JSON.stringify(result.data, null, 2));
                        }
                    } catch (err) {
                        console.error(`Failed to export ${collection.name}`, err);
                        toast.error(`Error exportando ${collection.name}, se omitirá.`);
                    }
                    processed++;
                }

                setExportProgress(100);
                toast.info("Comprimiendo archivos...");

                const content = await zip.generateAsync({ type: "blob" });
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = `V2Web-Full-Backup-${new Date().toISOString().split('T')[0]}.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast.success("Copia de seguridad completa descargada exitosamente");

            } catch (error) {
                console.error("Bulk export failed", error);
                toast.error("Falló la exportación masiva");
            } finally {
                setBulkExporting(false);
                setExportProgress(0);
            }
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-6">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Database className="h-8 w-8 text-blue-600" />
                        Gestión de Datos y Respaldos
                    </h1>
                    <p className="text-slate-500 max-w-2xl mt-2">
                        Administra la información de tu sistema. Exporta copias de seguridad de tus tablas o importa datos masivamente.
                    </p>
                </div>

                <Button
                    onClick={handleBulkExport}
                    disabled={loading || bulkExporting}
                    className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                >
                    {bulkExporting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generando Backup ({exportProgress}%)
                        </>
                    ) : (
                        <>
                            <DownloadCloud className="mr-2 h-4 w-4" />
                            Exportar Todo (ZIP)
                        </>
                    )}
                </Button>
            </div>

            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <AlertTitle>Copia de Seguridad Recomendada</AlertTitle>
                <AlertDescription>
                    Se recomienda realizar exportaciones periódicas de las tablas críticas (Clientes, Ventas, Inventario) para asegurar la integridad de tu negocio.
                </AlertDescription>
            </Alert>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                    <p>Analizando base de datos...</p>
                </div>
            ) : (
                <div className="block">
                    {/* Totals */}
                    <div className="mb-6 flex gap-4 text-sm text-slate-500">
                        <span>Total Tablas: <strong className="text-slate-900">{stats.length}</strong></span>
                        <span>Total Registros: <strong className="text-slate-900">{stats.reduce((acc, s) => acc + s.count, 0)}</strong></span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {stats.map((stat) => (
                            <DataCollectionCard key={stat.id} stats={stat} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
