"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Database, Loader2, Code, Eye } from "lucide-react";
import { useState } from "react";
import { exportCollectionData } from "@/lib/actions/data-management";
import { toast } from "sonner";
import { ImportDialog } from "./ImportDialog";
import { SchemaDialog } from "./SchemaDialog";

interface CollectionStats {
    id: string;
    name: string;
    count: number;
}

interface DataCollectionCardProps {
    stats: CollectionStats;
}

export function DataCollectionCard({ stats }: DataCollectionCardProps) {
    const [exporting, setExporting] = useState(false);
    const [importOpen, setImportOpen] = useState(false);
    const [schemaOpen, setSchemaOpen] = useState(false);

    const handleExport = async () => {
        setExporting(true);
        try {
            const result = await exportCollectionData(stats.id);

            if (result.success && result.data) {
                // Crear Blob y descargar
                const jsonString = JSON.stringify(result.data, null, 2);
                const blob = new Blob([jsonString], { type: "application/json" });
                const url = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.href = url;
                a.download = `backup-${stats.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast.success(`Exportación completa: ${result.count} registros`);
            } else {
                toast.error("Error al exportar datos");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error inesperado durante la exportación");
        } finally {
            setExporting(false);
        }
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-lg font-medium capitalize">{stats.name}</CardTitle>
                            <CardDescription className="text-xs font-mono text-slate-400 mt-1">
                                ID: {stats.id}
                            </CardDescription>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <Database className="h-4 w-4" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <span className="text-2xl font-bold text-slate-800">{stats.count}</span>
                        <span className="text-sm text-slate-500 ml-2">registros</span>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                            onClick={handleExport}
                            disabled={exporting}
                        >
                            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                            Exportar
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-slate-600 border-slate-200 hover:bg-slate-50"
                            onClick={() => setImportOpen(true)}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Importar
                        </Button>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-2 text-xs text-slate-400 hover:text-slate-600 h-6"
                        onClick={() => setSchemaOpen(true)}
                    >
                        <Code className="h-3 w-3 mr-1.5" /> Ver Estructura
                    </Button>
                </CardContent>
            </Card>

            <ImportDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                collectionId={stats.id}
                collectionName={stats.name}
            />

            <SchemaDialog
                open={schemaOpen}
                onOpenChange={setSchemaOpen}
                collectionId={stats.id}
                collectionName={stats.name}
            />
        </>
    );
}
