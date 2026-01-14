"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export interface FieldDefinition {
    key: string;
    label: string;
    type: "text" | "image" | "textarea" | "number";
    placeholder?: string;
}

interface EditableListProps {
    items: any[];
    onItemsChange: (items: any[]) => void;
    fields: FieldDefinition[];
    title: string;
    emptyMessage: string;
}

export function EditableList({ items, onItemsChange, fields, title, emptyMessage }: EditableListProps) {
    const handleAdd = () => {
        // Create new item with empty values based on fields
        const newItem = fields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {});
        // Add ID or timestamp if needed, but for simple JSON lists simple objects are fine
        onItemsChange([...items, newItem]);
    };

    const handleRemove = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onItemsChange(newItems);
    };

    const handleChange = (index: number, key: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [key]: value };
        onItemsChange(newItems);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between p-1">
                <h3 className="text-lg font-semibold text-slate-800 tracking-tight">{title}</h3>
                <Button
                    onClick={handleAdd}
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/25 rounded-full px-6 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir Nuevo
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <Pencil className="h-5 w-5 text-slate-400" />
                    </div>
                    <p className="text-muted-foreground font-medium">{emptyMessage}</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {items.map((item, index) => (
                        <div key={index} className="group relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-4 right-4 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                                onClick={() => handleRemove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Image Fields */}
                                {fields.filter(f => f.type === 'image').map(field => (
                                    <div key={field.key} className="shrink-0 flex flex-col space-y-3">
                                        <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{field.label}</Label>
                                        <div className="relative group/image">
                                            <ImageUploader
                                                value={item[field.key]}
                                                onChange={(url) => handleChange(index, field.key, url)}
                                                aspectRatio="square"
                                                className="h-32 w-32 rounded-xl shadow-md border-2 border-white ring-1 ring-slate-100 transition-transform group-hover/image:scale-105"
                                            />
                                        </div>
                                    </div>
                                ))}

                                {/* Other Fields */}
                                <div className="flex-1 grid gap-5 content-start">
                                    {fields.filter(f => f.type !== 'image').map(field => (
                                        <div key={field.key} className="space-y-2 group/input">
                                            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 group-focus-within/input:text-primary transition-colors">
                                                {field.label}
                                            </Label>
                                            {field.type === 'textarea' ? (
                                                <Textarea
                                                    value={item[field.key] || ""}
                                                    onChange={(e) => handleChange(index, field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    rows={2}
                                                    className="resize-none bg-slate-50 border-slate-200 focus:bg-white focus:border-primary/50 transition-all rounded-xl"
                                                />
                                            ) : (
                                                <Input
                                                    type={field.type}
                                                    value={item[field.key] || ""}
                                                    onChange={(e) => handleChange(index, field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className="bg-slate-50 border-slate-200 focus:bg-white focus:border-primary/50 transition-all h-10 rounded-xl"
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
