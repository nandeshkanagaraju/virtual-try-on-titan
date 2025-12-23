import React, { useState, useEffect } from 'react';
import { X, Loader2, Sparkles, Download, Scan, Info } from 'lucide-react';
import { performVirtualTryOn } from '../services/runwayService.js';

export default function AIModal({ isOpen, onClose, baseImage, jewelryItem }) {
    const apiKey = import.meta.env.VITE_RUNWAY_API_KEY;

    const [status, setStatus] = useState('idle');
    const [resultImage, setResultImage] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStatus('idle');
            setResultImage(null);
            setErrorMsg('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // --- FORCED DOWNLOAD HELPER ---
    const handleDownload = async () => {
        if (!resultImage) return;
        setIsDownloading(true);
        try {
            const response = await fetch(resultImage);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `taneria-studio-render-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
            // Fallback: Open in new tab if blob fetch fails
            window.open(resultImage, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleGenerate = async () => {
        if (!apiKey) {
            setErrorMsg("Studio configuration required.");
            return;
        }
        setStatus('processing');
        setErrorMsg('');

        try {
            const url = await performVirtualTryOn(baseImage, jewelryItem, apiKey);
            setResultImage(url);
            setStatus('success');
        } catch (err) {
            setErrorMsg("The render engine timed out. Please try again.");
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8 font-['Archivo_Black',sans-serif]">
            {/* Modal Container: Max-height and Overflow Fix */}
            <div className="bg-white border-[2px] border-black rounded-[24px] w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">

                {/* Header (Fixed) */}
                <div className="border-b-[1px] border-black/10 p-5 flex justify-between items-center bg-white shrink-0">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-black uppercase tracking-tighter leading-none">AI TRY ON</h2>
                        <span className="text-[9px] font-bold text-black/40 uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                            <Scan size={10} /> GEMINI FLASH 2.5
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    
                    {/* IDLE STATE */}
                    {(status === 'idle' || status === 'error') && (
                        <div className="flex flex-col items-center">
                            <div className="w-full aspect-[4/3] bg-gray-50 border border-black/5 rounded-xl overflow-hidden mb-6 relative group">
                                <img src={baseImage} className="w-full h-full object-cover grayscale opacity-30" alt="Identity" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white border-2 border-black p-4 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                        <Sparkles className="text-black" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleGenerate}
                                className="w-full bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-md"
                            >
                                Create your Look
                            </button>
                            
                            {errorMsg && <p className="mt-4 text-[9px] text-red-500 font-bold uppercase">{errorMsg}</p>}
                        </div>
                    )}

                    {/* PROCESSING STATE */}
                    {status === 'processing' && (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <Loader2 className="w-12 h-12 text-black animate-spin mb-6" strokeWidth={1.5} />
                            <h3 className="text-lg font-black uppercase text-center tracking-tighter">Rendering in Progress</h3>
                            <p className="text-[10px] font-bold uppercase opacity-40 mt-2">Please wait</p>
                        </div>
                    )}

                    {/* SUCCESS STATE */}
                    {status === 'success' && resultImage && (
                        <div className="flex flex-col animate-in fade-in duration-500">
                            {/* The Result Image - Constrained Size */}
                            <div className="border-[2px] border-black rounded-xl overflow-hidden shadow-lg mb-4 bg-gray-100">
                                <img src={resultImage} alt="Neural Preview" className="w-full h-auto max-h-[40vh] object-contain mx-auto" />
                            </div>

                            {/* Professional Disclaimer Section */}
                            <div className="bg-gray-50 border border-black/5 p-4 rounded-xl flex gap-3 items-start mb-6">
                                <Info size={14} className="text-black/40 shrink-0 mt-0.5" />
                                <p className="text-[9px] font-bold text-black/60 leading-relaxed uppercase tracking-wide">
                                    <span className="text-black">Professional Note:</span> <p className='text-black'>Visualization provides 90-95% resemblance. Lighting and textures are studio-optimized for perspective.
                                </p></p> 
                            </div>
                            
                            {/* Actions (Fixed at bottom of scroll area) */}
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setStatus('idle')} 
                                    className="flex-1 py-4 border-2 border-black rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-gray-100 transition-colors"
                                >
                                    New Look
                                </button>
                                <button 
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="flex-1 py-4 bg-black text-white rounded-xl font-black uppercase text-[9px] tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all disabled:opacity-50"
                                >
                                    {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={14} />}
                                    {isDownloading ? 'Downloading...' : 'Save to Device'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; }
            `}</style>
        </div>
    );
}