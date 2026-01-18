"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Code, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AttributeSchema, getCollectionSchema } from "@/lib/actions/data-management";

interface SchemaDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId: string;
    collectionName: string;
}

export function SchemaDialog({ open, onOpenChange, collectionId, collectionName }: SchemaDialogProps) {
    const [schema, setSchema] = useState<AttributeSchema[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && collectionId) {
            loadSchema();
        }
    }, [open, collectionId]);

    const loadSchema = async () => {
        setLoading(true);
        try {
            const data = await getCollectionSchema(collectionId);
            setSchema(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-slate-500" />
                        Estructura: {collectionName}
                    </DialogTitle>
                    <DialogDescription>
                        Definición de atributos y tipos de datos para esta colección.
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead>Atributo (Key)</TableHead>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead className="text-center">Requerido</TableHead>
                                    <TableHead className="text-center">Array</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schema.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24 text-slate-500">
                                            No se encontraron atributos definidos.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    schema.map((attr) => (
                                        <TableRow key={attr.key}>
                                            <TableCell className="font-mono text-sm font-medium text-slate-700">
                                                {attr.key}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                    {attr.type}
                                                    {attr.size && ` (${attr.size})`}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {attr.required ?
                                                    <Check className="h-4 w-4 text-emerald-500 mx-auto" /> :
                                                    <span className="text-slate-300">-</span>
                                                }
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {attr.array ?
                                                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Array</Badge> :
                                                    <span className="text-slate-300">-</span>
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
