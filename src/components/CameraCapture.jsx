import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

export default function CameraCapture({ onCapture, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [error, setError] = useState(null);
    const [permissionDenied, setPermissionDenied] = useState(false);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user" }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
            setError(null);
            setPermissionDenied(false);
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("Could not access camera. Please allow permissions.");
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setPermissionDenied(true);
            }
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Mirror effect
            context.translate(canvas.width, 0);
            context.scale(-1, 1);

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageDataUrl = canvas.toDataURL('image/png');
            setCapturedImage(imageDataUrl);
            // Do NOT stop camera stream yet in case retake is needed (but maybe stop to save battery? 
            // Re-starting might be slow. Let's keep it running in background or pause it? 
            // Pausing is better. But for simplicity let's just keep stream active but hidden).
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        // Ensure video feed is still active
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    };

    const handleConfirm = () => {
        onCapture(capturedImage);
        stopCamera();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center font-['Inter',sans-serif]">
            {/* Header / Controls */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-20">
                <div className="text-white/80 text-xs font-bold uppercase tracking-widest max-w-md mx-auto text-center hidden md:block">
                    {capturedImage ? "Review your photo" : "Face a light source, align your face, take off your glasses"}
                </div>
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-900">
                {error ? (
                    <div className="text-center p-8 max-w-md">
                        <div className="mb-4 text-red-400 mx-auto w-12 h-12 flex items-center justify-center bg-red-400/10 rounded-full">
                            <Camera size={24} />
                        </div>
                        <h3 className="text-white text-lg font-bold mb-2">Camera Access Required</h3>
                        <p className="text-slate-400 text-sm mb-6">{error}</p>
                        <button onClick={startCamera} className="px-6 py-3 bg-white text-black rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : capturedImage ? (
                    // PREVIEW STATE
                    <img src={capturedImage} alt="Capture Preview" className="w-full h-full object-cover" />
                ) : (
                    // LIVE CAMERA STATE
                    <>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform scale-x-[-1]"
                            style={{ maxHeight: '100%', maxWidth: '100%' }}
                        />
                        {/* Orientation Guide Overlay */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="absolute inset-0 bg-slate-900/60"
                                style={{ maskImage: 'radial-gradient(ellipse 300px 400px at center, transparent 40%, black 100%)', WebkitMaskImage: 'radial-gradient(ellipse 300px 400px at center, transparent 40%, black 100%)' }}
                            />
                            <div className="w-[300px] h-[400px] border-4 border-dashed border-teal-400/50 rounded-[50%] opacity-70" />
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Controls */}
            {!error && (
                <div className="absolute bottom-0 left-0 right-0 p-10 flex items-center justify-center z-20 bg-gradient-to-t from-black/80 to-transparent">
                    {capturedImage ? (
                        <div className="flex gap-6">
                            <button
                                onClick={handleRetake}
                                className="px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-white/30 transition-all"
                            >
                                <RefreshCw size={16} /> Retake
                            </button>
                            <button
                                onClick={handleConfirm}
                                className="px-8 py-4 bg-teal-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 hover:bg-teal-400 transition-all shadow-[0_0_20px_rgba(20,184,166,0.5)]"
                            >
                                <Check size={16} /> Confirm Photo
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleCapture}
                            className="w-20 h-20 rounded-full bg-white border-4 border-slate-300 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                            aria-label="Capture Photo"
                        >
                            <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-900" />
                        </button>
                    )}
                </div>
            )}

            {/* Hidden Canvas for Capture */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}
