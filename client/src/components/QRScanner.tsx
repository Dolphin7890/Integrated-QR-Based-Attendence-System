import { useEffect, useId, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Button } from './UI';

interface QRScannerProps {
    onScan: (data: string) => void;
    onClose: () => void;
}

const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
    const readerId = useId().replace(/:/g, '');
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const lastScanRef = useRef<number>(0);
    const onScanRef = useRef(onScan);
    const isClearingRef = useRef(false);

    // Keep the ref updated with the latest callback
    useEffect(() => {
        onScanRef.current = onScan;
    }, [onScan]);

    useEffect(() => {
        const reader = document.getElementById(readerId);
        if (reader) {
            reader.innerHTML = '';
        }

        const scanner = new Html5QrcodeScanner(
            readerId,
            {
                fps: 15,
                qrbox: { width: 280, height: 280 },
                aspectRatio: 1.0,
                disableFlip: false,
                rememberLastUsedCamera: true,
                experimentalFeatures: {
                    useBarCodeDetectorIfSupported: true
                }
            },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                const now = Date.now();
                // Cooldown of 2.5 seconds
                if (now - lastScanRef.current > 2500) {
                    lastScanRef.current = now;
                    // Call the latest callback via ref
                    if (onScanRef.current) {
                        onScanRef.current(decodedText);
                    }
                }
            },
            () => undefined
        );
        scannerRef.current = scanner;

        return () => {
            const activeScanner = scannerRef.current;
            scannerRef.current = null;

            if (activeScanner && !isClearingRef.current) {
                isClearingRef.current = true;
                activeScanner.clear()
                    .catch(error => {
                        console.error("Failed to clear html5-qrcode scanner.", error);
                    })
                    .finally(() => {
                        isClearingRef.current = false;
                    });
            }
        };
    }, [readerId]);

    const handleClose = () => {
        if (!isClearingRef.current && scannerRef.current) {
            isClearingRef.current = true;
            scannerRef.current.clear()
                .catch(error => {
                    console.error("Failed to clear html5-qrcode scanner.", error);
                })
                .finally(() => {
                    scannerRef.current = null;
                    isClearingRef.current = false;
                    onClose();
                });
            return;
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md border border-slate-200 shadow-2xl relative">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Scan QR Code</h3>
                    <Button variant="secondary" onClick={handleClose} className="text-sm py-1 px-3">
                        Close
                    </Button>
                </div>
                <div id={readerId} className="w-full h-80 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-200"></div>
                <p className="text-center text-slate-500 mt-4 text-sm">Align QR code within the frame</p>
            </div>
        </div>
    );
};

export default QRScanner;
