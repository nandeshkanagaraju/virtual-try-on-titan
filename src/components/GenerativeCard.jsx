import React from 'react';
import { Heart, Loader2, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GenerativeCard({
    item,
    baseImage,
    generatedImage,
    status,
    onWishlist,
    isWishlisted,
    onRetry,
    onTryNow // Fallback for manual trigger if needed
}) {
    const isGenerating = status === 'pending' || status === 'processing';
    const hasResult = status === 'success' && generatedImage;
    const hasError = status === 'error';

    // Helper to determine active image to show in the "Try On" slot
    const renderTryOnSlot = () => {
        if (hasResult) {
            return (
                <img
                    src={generatedImage}
                    alt="Virtual Try-On"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                />
            );
        }
        if (isGenerating) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-slate-400">
                    <Loader2 size={24} className="animate-spin mb-2 text-black" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Generating...</span>
                </div>
            );
        }
        if (hasError) {
            return (
                <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-400">
                    <span className="text-[9px] font-bold uppercase tracking-widest mb-2">Failed</span>
                    <button
                        onClick={() => onRetry(item)}
                        className="p-2 bg-white rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-colors"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            );
        }

        // Idle / No Base Image state
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden group">
                {baseImage ? (
                    <div className="absolute inset-0 opacity-50 grayscale">
                        <img src={baseImage} className="w-full h-full object-cover" alt="Base" />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <User size={40} />
                    </div>
                )}

                <div className="z-10 bg-white/80 p-3 rounded-full backdrop-blur-sm shadow-sm">
                    <Sparkles size={16} className="text-slate-400" />
                </div>
            </div>
        );
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group flex flex-col bg-white rounded-[24px] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
        >
            {/* Split View Container */}
            <div className="flex h-64 relative">

                {/* 1. PRODUCT ORIGINAL */}
                <div className="w-1/2 bg-[#F9F9F9] p-4 flex items-center justify-center relative border-r border-slate-50">
                    <img
                        src={item.src}
                        alt={item.name}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-widest text-slate-300">Original</span>
                </div>

                {/* 2. AI GENERATED / PREVIEW */}
                <div className="w-1/2 relative overflow-hidden bg-slate-100">
                    {renderTryOnSlot()}
                    <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest text-slate-400/50 mix-blend-difference text-white">
                        {hasResult ? "Try-On" : "Preview"}
                    </span>
                </div>

                {/* WISHLIST BUTTON (Overlays both) */}
                <button
                    onClick={() => onWishlist(item.id)}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 p-3 bg-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all border border-slate-100 opacity-0 group-hover:opacity-100"
                >
                    <Heart size={18} className={isWishlisted ? "fill-red-500 text-red-500" : "text-slate-300"} />
                </button>
            </div>

            {/* INFO & ACTIONS */}
            <div className="p-4 flex flex-col gap-3">
                <div className="">
                    <h3 className="text-xs font-bold tracking-tight text-slate-900 truncate">{item.name}</h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.type}</p>
                </div>

                {/* If no result yet and we have a base image, show manual trigger ? OR if no base image, prompt upload */}
                {!hasResult && !isGenerating && (
                    <button
                        onClick={() => onTryNow(item)}
                        className="w-full py-2 bg-black text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                    >
                        {baseImage ? "Generate Try-On" : "Upload & Try"} <ArrowRight size={12} />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// Simple Icon fallback if lucide-react User isn't imported but used
const User = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);
