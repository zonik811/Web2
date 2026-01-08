"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { sendNotification } from "@/lib/actions/notifications";
import { useAuth } from "@/lib/hooks/useAuth";
import { BellRing, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner or similar toast is used, or alerts

export function TestNotification() {
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const [success, setSuccess] = useState(false);

    const handleTest = async () => {
        if (!user?.$id) return;

        setLoading(true);
        try {
            const result = await sendNotification(
                "¡Hola! Esta es una notificación de prueba desde el Panel Admin.",
                "Prueba de Sistema",
                user.$id
            );

            if (result.success) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            } else {
                console.error("Error envío:", result.error);
                alert("Error enviando notificación");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleTest}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : success ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
                <BellRing className="h-4 w-4" />
            )}
            {success ? "Enviado" : "Probar Push"}
        </Button>
    );
}
