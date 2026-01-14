import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface PremiumModalProps {
    title: string;
    icon: LucideIcon;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
    footer?: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl'
};

export function PremiumModal({
    title,
    icon: Icon,
    open,
    onOpenChange,
    children,
    footer,
    maxWidth = '2xl'
}: PremiumModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={`${maxWidthClasses[maxWidth]} bg-white/95 backdrop-blur-xl border-0 shadow-2xl`}>
                <DialogHeader className="border-b pb-6 mb-4 bg-gradient-to-r from-blue-50 to-purple-50 -mx-6 px-6 -mt-6 pt-6 rounded-t-xl">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                            <Icon className="h-7 w-7 text-white" />
                        </div>
                        <span className="text-3xl font-black bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                            {title}
                        </span>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {children}
                </div>

                {footer && (
                    <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-100 mt-6">
                        {footer}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
