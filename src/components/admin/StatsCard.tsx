"use client";

import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    variant?: "default" | "primary" | "secondary" | "warning" | "destructive";
}

const variantStyles = {
    default: "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200",
    primary: "bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200",
    secondary: "bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200",
    warning: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200",
    destructive: "bg-gradient-to-br from-red-50 to-red-100 border-red-200",
};

const iconStyles = {
    default: "text-slate-600 bg-slate-200",
    primary: "text-primary-600 bg-primary-200",
    secondary: "text-secondary-600 bg-secondary-200",
    warning: "text-orange-600 bg-orange-200",
    destructive: "text-red-600 bg-red-200",
};

export function StatsCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    variant = "default",
}: StatsCardProps) {
    return (
        <Card className={cn("border-2", variantStyles[variant])}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg", iconStyles[variant])}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {description && (
                    <p className="text-xs text-gray-600 mt-1">{description}</p>
                )}
                {trend && (
                    <div className="flex items-center mt-2">
                        <span
                            className={cn(
                                "text-xs font-medium",
                                trend.isPositive ? "text-green-600" : "text-red-600"
                            )}
                        >
                            {trend.isPositive ? "+" : ""}
                            {trend.value}%
                        </span>
                        <span className="text-xs text-gray-500 ml-2">vs mes anterior</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
