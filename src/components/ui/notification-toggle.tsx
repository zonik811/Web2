"use client";

import { usePushNotifications } from "@/lib/hooks/usePushNotifications";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";

export function NotificationToggle() {
    const { isSubscribed, subscribe, unsubscribe, loading, permission } = usePushNotifications();

    if (permission === 'denied') {
        return (
            <Button variant="ghost" size="icon" disabled title="Notificaciones bloqueadas">
                <BellOff className="h-4 w-4 text-red-400" />
            </Button>
        );
    }

    if (loading) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={isSubscribed ? unsubscribe : subscribe}
            title={isSubscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
            className={isSubscribed ? "text-primary hover:text-primary/80" : "text-gray-400 hover:text-gray-900"}
        >
            {isSubscribed ? <Bell className="h-5 w-5 fill-current" /> : <Bell className="h-5 w-5" />}
        </Button>
    );
}
