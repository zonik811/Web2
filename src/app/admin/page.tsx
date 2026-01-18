"use client";

import { useEffect, useState } from "react";
import { obtenerResumenOperativo, OperationalSummary } from "@/lib/actions/admin-dashboard";
import { OperationalStatusWidget, FinanceOverviewWidget, CriticalAlertsWidget } from "@/components/admin/dashboard/OverviewWidgets";
import { WelcomeHero } from "@/components/admin/dashboard/WelcomeHero";
import { QuickActionsGrid } from "@/components/admin/dashboard/QuickActionsGrid";
import { RevenueAreaChart } from "@/components/admin/dashboard/RevenueAreaChart";
import { ActivityFeed } from "@/components/admin/dashboard/ActivityFeed";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
    const [summary, setSummary] = useState<OperationalSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarResumen();
    }, []);

    const cargarResumen = async () => {
        try {
            setLoading(true);
            const data = await obtenerResumenOperativo();
            setSummary(data);
        } catch (error) {
            console.error("Error loading dashboard summary", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !summary) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700 pb-10">

            {/* 1. Hero Section - Full Width */}
            <WelcomeHero userName="Admin" />

            {/* 2. Quick Actions - Full Width */}
            <QuickActionsGrid />

            {/* 3. Main Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column (2/3) - Operational & Financials */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Key Metrics Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[250px]">
                        <OperationalStatusWidget summary={summary.operaciones} />
                        <FinanceOverviewWidget summary={summary.finanzas} />
                    </div>

                    {/* Revenue Chart */}
                    <div className="h-[400px]">
                        <RevenueAreaChart />
                    </div>

                </div>

                {/* Right Column (1/3) - Alerts & Activity */}
                <div className="space-y-6">

                    {/* Critical Alerts (Top Priority) */}
                    <div className="h-[250px]">
                        <CriticalAlertsWidget alerts={summary.alertas} rrhh={summary.rrhh} />
                    </div>

                    {/* Activity Feed */}
                    <ActivityFeed />

                </div>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <Skeleton className="h-[280px] w-full rounded-3xl" />
            <div className="grid grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-2xl" />
                ))}
            </div>
            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-6 h-[250px]">
                        <Skeleton className="h-full rounded-xl" />
                        <Skeleton className="h-full rounded-xl" />
                    </div>
                    <Skeleton className="h-[400px] rounded-xl" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-[250px] rounded-xl" />
                    <Skeleton className="h-[400px] rounded-xl" />
                </div>
            </div>
        </div>
    );
}
