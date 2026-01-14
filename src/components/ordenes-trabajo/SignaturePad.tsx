"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eraser, Pen, Loader2 } from "lucide-react";
import { subirImagenBase64 } from "@/lib/actions/storage";

interface SignaturePadProps {
    onSignatureSave: (dataUrl: string) => void;
    onClear?: () => void;
}

export function SignaturePad({ onSignatureSave, onClear }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;

        // Configure drawing style
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
    }, []);

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        isDrawing.current = true;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        isDrawing.current = false;
    };

    const handleClear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        onClear?.();
    };

    const handleSave = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setSaving(true);
        try {
            const dataUrl = canvas.toDataURL("image/png");

            // Subir a Storage
            const result = await subirImagenBase64(dataUrl, "firma.png");
            if (result.success && result.url) {
                onSignatureSave(result.url);
            } else {
                alert("Error al guardar la firma");
            }
        } catch (error) {
            console.error("Error guardando firma:", error);
            alert("Error al guardar la firma");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Pen className="h-5 w-5" />
                    Firma del Cliente
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg bg-white">
                    <canvas
                        ref={canvasRef}
                        className="w-full cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>

                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClear}
                        className="gap-2"
                    >
                        <Eraser className="h-4 w-4" />
                        Limpiar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleSave}
                        className="flex-1"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Guardando...
                            </>
                        ) : (
                            "Guardar Firma"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
