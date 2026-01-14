import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type GradientType = 'blue' | 'emerald' | 'amber' | 'red' | 'purple' | 'orange';

interface PremiumKPICardProps {
    label: string;
    value: string | number;
    icon: LucideIcon;
    gradient?: GradientType;
    badge?: string;
}

const gradientConfig: Record<GradientType, {
    bg: string;
    glow: string;
    text: string;
    badgeBg: string;
    badgeText: string;
}> = {
    blue: {
        bg: 'from-blue-500 to-blue-600',
        glow: 'from-blue-600 to-blue-400',
        text: 'from-blue-600 to-blue-800',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-700'
    },
    emerald: {
        bg: 'from-emerald-500 to-emerald-600',
        glow: 'from-emerald-600 to-emerald-400',
        text: 'from-emerald-600 to-emerald-800',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-700'
    },
    amber: {
        bg: 'from-amber-500 to-amber-600',
        glow: 'from-amber-600 to-amber-400',
        text: 'from-amber-600 to-amber-800',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-700'
    },
    red: {
        bg: 'from-red-500 to-red-600',
        glow: 'from-red-600 to-red-400',
        text: 'from-red-600 to-red-800',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-700'
    },
    purple: {
        bg: 'from-purple-500 to-purple-600',
        glow: 'from-purple-600 to-purple-400',
        text: 'from-purple-600 to-purple-800',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-700'
    },
    orange: {
        bg: 'from-orange-500 to-orange-600',
        glow: 'from-orange-600 to-orange-400',
        text: 'from-orange-600 to-orange-800',
        badgeBg: 'bg-orange-100',
        badgeText: 'text-orange-700'
    }
};

export function PremiumKPICard({
    label,
    value,
    icon: Icon,
    gradient = 'blue',
    badge
}: PremiumKPICardProps) {
    const config = gradientConfig[gradient];

    return (
        <div className="group relative">
            <div className={`absolute inset-0 bg-gradient-to-r ${config.glow} rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity`}></div>
            <Card className="relative border-0 shadow-xl overflow-hidden bg-white/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 bg-gradient-to-br ${config.bg} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <Icon className="h-7 w-7 text-white" />
                        </div>
                        {badge && (
                            <Badge className={`${config.badgeBg} ${config.badgeText} border-0 px-3 py-1 text-xs font-bold`}>
                                {badge}
                            </Badge>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className={`text-5xl font-black bg-gradient-to-r ${config.text} bg-clip-text text-transparent`}>
                            {value}
                        </div>
                        <p className="text-sm font-semibold text-slate-600">{label}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
