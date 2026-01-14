import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export interface PremiumTableColumn {
    key: string;
    header: string;
    width?: string;
    align?: 'left' | 'center' | 'right';
    render?: (item: any) => ReactNode;
}

interface PremiumTableProps {
    columns: PremiumTableColumn[];
    data: any[];
    loading?: boolean;
    emptyMessage?: string;
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    actions?: ReactNode;
    keyExtractor?: (item: any) => string;
}

export function PremiumTable({
    columns,
    data,
    loading = false,
    emptyMessage = "No se encontraron registros",
    searchPlaceholder = "Buscar...",
    searchValue,
    onSearchChange,
    actions,
    keyExtractor = (item) => item.$id || item.id
}: PremiumTableProps) {
    return (
        <Card className="border-0 shadow-2xl overflow-hidden bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-6 bg-gradient-to-r from-slate-50 via-blue-50/50 to-slate-50 border-b-2 border-slate-200/50">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {onSearchChange && (
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <Input
                                placeholder={searchPlaceholder}
                                className="pl-12 h-12 border-2 border-slate-200 focus:border-blue-500 transition-all rounded-2xl bg-white shadow-sm font-medium"
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                            />
                        </div>
                    )}
                    {actions && <div className="w-full md:w-auto">{actions}</div>}
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border-b-2 border-slate-200 hover:bg-slate-100/50">
                                {columns.map((col) => (
                                    <TableHead
                                        key={col.key}
                                        className={`font-black text-slate-800 text-sm py-4 ${col.width || ''} ${col.align === 'center' ? 'text-center' :
                                                col.align === 'right' ? 'text-right' : ''
                                            }`}
                                    >
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-40 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <RefreshCw className="h-10 w-10 animate-spin text-blue-600" />
                                            <p className="text-slate-600 font-semibold">Cargando...</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-40 text-center">
                                        <p className="text-slate-600 font-semibold">{emptyMessage}</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((item) => (
                                    <TableRow
                                        key={keyExtractor(item)}
                                        className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-300 border-b border-slate-100"
                                    >
                                        {columns.map((col) => (
                                            <TableCell
                                                key={col.key}
                                                className={`py-5 ${col.align === 'center' ? 'text-center' :
                                                        col.align === 'right' ? 'text-right' : ''
                                                    }`}
                                            >
                                                {col.render ? col.render(item) : item[col.key]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
