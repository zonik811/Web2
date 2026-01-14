"use client";

import { useState } from "react";
import { Upload, X, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { subirImagenBase64 } from "@/lib/actions/storage";

interface ImageUploaderProps {
    maxImages?: number;
    onImagesChange: (images: string[]) => void;
    label?: string;
    initialImages?: string[];
}

export function ImageUploader({ maxImages = 4, onImagesChange, label = "Fotos", initialImages = [] }: ImageUploaderProps) {
    const [images, setImages] = useState<string[]>(initialImages);
    const [uploading, setUploading] = useState(false);

    // Actualizar si initialImages cambia
    useState(() => {
        if (initialImages.length > 0) {
            setImages(initialImages);
        }
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        setUploading(true);
        const newImageUrls: string[] = [];
        const filesArray = Array.from(files).slice(0, maxImages - images.length);

        try {
            for (const file of filesArray) {
                // Leer como base64
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });

                // Subir a Storage
                const result = await subirImagenBase64(base64, file.name);
                if (result.success && result.url) {
                    newImageUrls.push(result.url);
                }
            }

            const updatedImages = [...images, ...newImageUrls];
            setImages(updatedImages);
            onImagesChange(updatedImages);
        } catch (error) {
            console.error("Error subiendo imágenes:", error);
            alert("Error al subir algunas imágenes");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = (index: number) => {
        const updatedImages = images.filter((_, i) => i !== index);
        setImages(updatedImages);
        onImagesChange(updatedImages);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{label}</label>
                <span className="text-sm text-muted-foreground">
                    {images.length} / {maxImages}
                </span>
            </div>

            {/* Preview de imágenes */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <Card key={index} className="relative group">
                            <CardContent className="p-2">
                                <div className="relative aspect-square">
                                    <Image
                                        src={img}
                                        alt={`Foto ${index + 1}`}
                                        fill
                                        className="object-cover rounded"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Botón para subir más */}
            {images.length < maxImages && (
                <div>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                        disabled={uploading}
                    />
                    <label htmlFor="image-upload">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => document.getElementById("image-upload")?.click()}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Subiendo...
                                </>
                            ) : (
                                <>
                                    <Camera className="h-4 w-4" />
                                    Agregar Fotos ({maxImages - images.length} restantes)
                                </>
                            )}
                        </Button>
                    </label>
                </div>
            )}
        </div>
    );
}
