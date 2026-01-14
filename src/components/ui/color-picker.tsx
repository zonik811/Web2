"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <Label>{label}</Label>
            <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full border shadow-sm shrink-0">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute -top-1/2 -left-1/2 h-[200%] w-[200%] cursor-pointer p-0 border-0"
                    />
                </div>
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="font-mono uppercase w-32"
                    maxLength={7}
                />
            </div>
        </div>
    );
}
