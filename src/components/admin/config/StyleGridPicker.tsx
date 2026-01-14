import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StyleOption {
    id: string;
    label: string;
    category?: string;
    description?: string;
}

interface StyleGridPickerProps {
    value: string;
    onChange: (value: string) => void;
    options: StyleOption[];
    renderPreview: (option: StyleOption) => React.ReactNode;
    columns?: 2 | 3 | 4;
}

export function StyleGridPicker({
    value,
    onChange,
    options,
    renderPreview,
    columns = 3
}: StyleGridPickerProps) {
    return (
        <div className={`grid gap-4 ${columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
            {options.map((option) => {
                const isSelected = value === option.id;

                return (
                    <div
                        key={option.id}
                        onClick={() => onChange(option.id)}
                        className={cn(
                            "group relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer hover:bg-slate-50",
                            isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-slate-100 hover:border-slate-300"
                        )}
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Seleccionar estilo ${option.label}`}
                    >
                        {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center shadow-sm z-10">
                                <Check className="w-3 h-3" />
                            </div>
                        )}

                        <div className="w-full h-16 flex items-center justify-center pointer-events-none isolate">
                            {renderPreview(option)}
                        </div>

                        <div className="text-center">
                            <p className={cn(
                                "text-xs font-semibold",
                                isSelected ? "text-primary" : "text-slate-600 group-hover:text-slate-900"
                            )}>
                                {option.label}
                            </p>
                            {option.description && (
                                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                    {option.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
