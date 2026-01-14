"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface BarcodeScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose?: () => void;
}

export function BarcodeScanner({ onScanSuccess, onClose }: BarcodeScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);

    useEffect(() => {
        // Initialize Scanner
        // Use a unique ID for the container
        const scannerId = "reader-barcode";

        scannerRef.current = new Html5QrcodeScanner(
            scannerId,
            {
                fps: 10,
                qrbox: { width: 250, height: 150 },
                aspectRatio: 1.0,
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.CODE_128,
                    Html5QrcodeSupportedFormats.UPC_A,
                    Html5QrcodeSupportedFormats.UPC_E,
                    Html5QrcodeSupportedFormats.QR_CODE
                ]
            },
            /* verbose= */ false
        );

        scannerRef.current.render(
            (decodedText) => {
                // Success

                onScanSuccess(decodedText);
                // Optional: Auto stop on success? Or let parent handle it.
                // Usually better to let parent decide, but likely we want to close/stop.
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(err => console.error("Error clearing scanner", err));
                }
            },
            (errorMessage) => {
                // Error parsing, typical in scanning frames. Ignore or log debug.
                // setScanError(errorMessage);
            }
        );

        return () => {
            // Cleanup on unmount
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear html5-qrcode scanner. ", error);
                });
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
            {onClose && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 text-white hover:bg-white/20 hover:text-white"
                    onClick={onClose}
                >
                    <X className="h-6 w-6" />
                </Button>
            )}
            <div id="reader-barcode" className="w-full h-full bg-slate-900 text-white" />
            <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/50 pointer-events-none">
                Apunta la cámara al código de barras
            </div>
        </div>
    );
}
