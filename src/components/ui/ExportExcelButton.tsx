"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';

interface ExportExcelButtonProps {
    data: any[];
    fileName: string;
    label?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
    mapData?: (item: any) => any; // Función opcional para transformar/limpiar datos antes de exportar
}

export function ExportExcelButton({
    data,
    fileName,
    label = "Exportar Excel",
    variant = "outline",
    className,
    mapData
}: ExportExcelButtonProps) {

    const handleExport = () => {
        // Transformar datos si se provee una función de mapeo
        const dataToExport = mapData ? data.map(mapData) : data;

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

        // Auto-ancho de columnas básico
        const max_width = dataToExport.reduce((w, r) => Math.max(w, JSON.stringify(r).length), 10);
        worksheet["!cols"] = [{ wch: max_width }];

        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    return (
        <Button onClick={handleExport} variant={variant} className={className}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {label}
        </Button>
    );
}
