"use client";

import { useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { subirArchivo, obtenerURLArchivo } from "@/lib/appwrite";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploaderProps {
    value?: string;
    onChange: (url: string) => void;
    className?: string;
    aspectRatio?: "square" | "video" | "auto";
}

export function ImageUploader({ value, onChange, className, aspectRatio = "square" }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tamaño (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("La imagen no debe pesar más de 5MB");
            return;
        }

        setUploading(true);
        try {
            const fileId = await subirArchivo(file);
            const url = obtenerURLArchivo(fileId);
            onChange(url);
            toast.success("Imagen subida correctamente");
        } catch (error) {
            console.error(error);
            toast.error("Error al subir la imagen");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        onChange("");
    };

    return (
        <div className={cn("relative group overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:bg-slate-100", className)}>
            {value ? (
                <>
                    <div className={cn("relative w-full h-full",
                        aspectRatio === "square" && "aspect-square",
                        aspectRatio === "video" && "aspect-video",
                        aspectRatio === "auto" && "h-40"
                    )}>
                        <Image
                            src={value}
                            alt="Uploaded"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </>
            ) : (
                <label className="flex flex-col items-center justify-center w-full h-full min-h-[160px] cursor-pointer">
                    {uploading ? (
                        <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                    ) : (
                        <>
                            <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                <Upload className="h-6 w-6 text-slate-500" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">Subir Imagen</span>
                            <span className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP (Max 5MB)</span>
                        </>
                    )}
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            )}
        </div>
    );
}
