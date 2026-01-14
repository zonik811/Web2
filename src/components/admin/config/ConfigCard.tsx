"use client";

import Link from "next/link";
import { LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfigCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
    gradient: string;
    delay?: number;
}

export function ConfigCard({ title, description, icon: Icon, href, gradient, delay = 0 }: ConfigCardProps) {
    return (
        <Link href={href} className="block group h-full">
            <div
                className={cn(
                    "relative h-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300",
                    "hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:scale-[1.02] hover:-translate-y-1 hover:border-slate-200",
                    "dark:bg-slate-950 dark:border-slate-800 dark:hover:shadow-none", // Better dark mode fallback
                    "animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
                )}
                style={{ animationDelay: `${delay}ms` }}
            >
                {/* Gradient Background Effect on Hover (Subtle) */}
                <div
                    className={cn(
                        "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]",
                        gradient
                    )}
                />

                <div className="relative z-10 flex flex-col h-full">
                    {/* Icon Header */}
                    <div className="flex items-start justify-between mb-5">
                        <div
                            className={cn(
                                "flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                                gradient
                            )}
                        >
                            <Icon className="h-7 w-7" />
                        </div>
                        <div
                            className={cn(
                                "rounded-full p-2 text-slate-300 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 bg-slate-50",
                                "dark:bg-slate-900 dark:text-slate-600"
                            )}>
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-50 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-700 transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                            {description}
                        </p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
