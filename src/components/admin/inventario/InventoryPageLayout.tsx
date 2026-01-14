import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LucideIcon } from "lucide-react";

interface InventoryPageLayoutProps {
    title: string;
    description: string;
    icon: LucideIcon;
    backHref?: string;
    children: ReactNode;
}

export function InventoryPageLayout({
    title,
    description,
    icon: Icon,
    backHref = "/admin/inventario",
    children
}: InventoryPageLayoutProps) {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
            <div className="max-w-[1600px] mx-auto space-y-8">
                {/* Back Button */}
                <Button
                    onClick={() => router.push(backHref)}
                    variant="ghost"
                    className="mb-4 hover:bg-white/60 transition-all"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al Inventario
                </Button>

                {/* Header Premium */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-blue-600/10 blur-3xl -z-10"></div>
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-8">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
                                <div className="relative p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl">
                                    <Icon className="h-10 w-10 text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-5xl font-black bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                                    {title}
                                </h1>
                                <p className="text-lg text-slate-600 mt-2">
                                    {description}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
