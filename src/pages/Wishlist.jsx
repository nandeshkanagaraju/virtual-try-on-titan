import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowRight, HeartOff, Sparkles, Loader2, Download, LayoutGrid, Camera, User, X, RotateCcw, Maximize2 } from 'lucide-react';
import { JEWELRY_CATALOG } from '../data/catalog';
import { performVirtualTryOn } from '../services/runwayService.js';
import AIModal from '../components/AIModal';
import CameraCapture from '../components/CameraCapture';
import Header from '../components/Header';

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [baseImage, setBaseImage] = useState(null);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [activeAIItem, setActiveAIItem] = useState(null);
    const [showCamera, setShowCamera] = useState(false);
    const fileInputRef = useRef(null);

    // Bulk processing states
    const [isProcessingAll, setIsProcessingAll] = useState(false);
    const [bulkResults, setBulkResults] = useState({});
    const [progress, setProgress] = useState({});

    const apiKey = import.meta.env.VITE_RUNWAY_API_KEY;

    useEffect(() => {
        // Load Wishlist
        const savedIds = JSON.parse(localStorage.getItem('taneria_wishlist') || '[]');
        const items = JEWELRY_CATALOG.filter(item => savedIds.includes(item.id));
        setWishlistItems(items);

        // Load Portrait from local storage
        const savedImg = localStorage.getItem('user_portrait');
        if (savedImg) setBaseImage(savedImg);

        // Load Persisted Results
        const savedResults = JSON.parse(localStorage.getItem('taneria_wishlist_results') || '{}');
        setBulkResults(savedResults);
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgData = event.target.result;
                setBaseImage(imgData);
                localStorage.setItem('user_portrait', imgData); // Persist across pages
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCameraCapture = (imageDataUrl) => {
        setBaseImage(imageDataUrl);
        localStorage.setItem('user_portrait', imageDataUrl);
        setShowCamera(false);
    };

    const removePortrait = () => {
        setBaseImage(null);
        localStorage.removeItem('user_portrait');
    };

    const removeFromWishlist = (id) => {
        const updated = wishlistItems.filter(item => item.id !== id);
        setWishlistItems(updated);
        localStorage.setItem('taneria_wishlist', JSON.stringify(updated.map(i => i.id)));
    };

    const generateAllLooks = async () => {
        if (!baseImage) {
            alert("Please upload your portrait first using the Studio Identity section.");
            return;
        }
        setIsProcessingAll(true);
        const newResults = { ...bulkResults };
        const newProgress = {};
        wishlistItems.forEach(item => newProgress[item.id] = 'loading');
        setProgress(newProgress);

        try {
            const promises = wishlistItems.map(async (item) => {
                try {
                    const url = await performVirtualTryOn(baseImage, item, apiKey);
                    newResults[item.id] = url;
                    setProgress(prev => ({ ...prev, [item.id]: 'done' }));
                } catch (err) {
                    setProgress(prev => ({ ...prev, [item.id]: 'error' }));
                }
            });
            await Promise.all(promises);
            setBulkResults(newResults);
            localStorage.setItem('taneria_wishlist_results', JSON.stringify(newResults));
        } finally {
            setIsProcessingAll(false);
        }
    };

    const handleRegenerate = async (item) => {
        if (!baseImage) {
            alert("Please upload or capture a photo first to retry the look.");
            return;
        }

        setProgress(prev => ({ ...prev, [item.id]: 'loading' }));

        try {
            const url = await performVirtualTryOn(baseImage, item, apiKey);
            const newResults = { ...bulkResults, [item.id]: url };
            setBulkResults(newResults);
            localStorage.setItem('taneria_wishlist_results', JSON.stringify(newResults));
            setProgress(prev => ({ ...prev, [item.id]: 'done' }));
        } catch (err) {
            console.error("Regeneration error:", err);
            setProgress(prev => ({ ...prev, [item.id]: 'error' }));
            alert("Generation failed. Please try again.");
        }
    };

    // Image Preview Modal State
    const [previewImage, setPreviewImage] = useState(null);

    return (
        <div className="min-h-screen bg-[#FDFDFF] font-['Inter',sans-serif] text-slate-900 pb-20 overflow-x-hidden">
            <Header />

            <main className="max-w-5xl mx-auto px-8 py-16">

                {/* 1. STUDIO IDENTITY SECTION (The Upload Option) */}
                <section className="mb-16 bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <div className="relative w-24 h-24 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                            {baseImage ? (
                                <img src={baseImage} className="w-full h-full object-cover" alt="Identity" />
                            ) : (
                                <User className="text-slate-200" size={32} />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight">Studio Identity</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic">Required for Parallel Rendering</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className="bg-black text-white px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md"
                        >
                            <User size={14} /> Upload
                        </button>
                        <button
                            onClick={() => setShowCamera(true)}
                            className="bg-white border text-black border-slate-200 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            <Camera size={14} /> Camera
                        </button>
                        {baseImage && (
                            <button onClick={removePortrait} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                </section>

                <AnimatePresence>
                    {showCamera && (
                        <div className="fixed inset-0 z-[200]">
                            <CameraCapture
                                onCapture={handleCameraCapture}
                                onClose={() => setShowCamera(false)}
                            />
                        </div>
                    )}
                </AnimatePresence>

                {/* 2. WISHLIST HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 border-b border-slate-100 pb-10">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter">My Wishlist</h1>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Personal Lookbook Studio</p>
                    </div>

                    {wishlistItems.length > 0 && (
                        <button
                            onClick={generateAllLooks}
                            disabled={isProcessingAll}
                            className={`flex items-center gap-3 px-10 py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest shadow-xl transition-all
                                ${baseImage ? 'bg-black text-white hover:bg-indigo-600' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
                            `}
                        >
                            {isProcessingAll ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                            {isProcessingAll ? "Rendering Parallel Looks..." : "Generate Lookbook"}
                        </button>
                    )}
                </div>

                {/* 3. PARALLEL LIST */}
                {wishlistItems.length > 0 ? (
                    <div className="space-y-6">
                        {wishlistItems.map((item) => (
                            <motion.div
                                key={item.id} layout
                                className="bg-white border border-slate-100 rounded-[32px] p-5 flex flex-col md:flex-row items-center gap-10 shadow-sm hover:shadow-md transition-all group"
                            >
                                <div className="flex items-center gap-6 flex-1 w-full">
                                    <div className="w-24 h-24 bg-slate-50 rounded-[20px] flex items-center justify-center p-3 shrink-0">
                                        <img src={item.src} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{item.name}</h3>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Premium Collection</p>
                                    </div>
                                </div>

                                {/* Parallel Render Area */}
                                <div className="w-full md:w-64 aspect-square bg-[#F8F9FA] rounded-[24px] border-2 border-dashed border-slate-200 overflow-hidden relative">
                                    {bulkResults[item.id] ? (
                                        <div className="relative h-full w-full animate-in fade-in zoom-in-95 duration-700 group/image">
                                            <img
                                                src={bulkResults[item.id]}
                                                className="w-full h-full object-cover cursor-zoom-in"
                                                alt="Look Result"
                                                onClick={() => setPreviewImage(bulkResults[item.id])}
                                            />

                                            {/* Overlay Actions */}
                                            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100 gap-2">
                                                <button
                                                    onClick={() => setPreviewImage(bulkResults[item.id])}
                                                    className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                                                    title="View Fullscreen"
                                                >
                                                    <Maximize2 size={18} />
                                                </button>
                                                <a
                                                    href={bulkResults[item.id]}
                                                    download
                                                    className="bg-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
                                                    title="Download"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <Download size={18} />
                                                </a>
                                            </div>

                                            {/* Regenerate Button (Bottom Center) - "Not satisfied?" */}
                                            {progress[item.id] !== 'loading' && (
                                                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                                                    <button
                                                        onClick={() => handleRegenerate(item)}
                                                        className="bg-white/90 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:bg-black hover:text-white transition-all transform hover:-translate-y-1"
                                                    >
                                                        <RotateCcw size={12} />
                                                        <span className="text-[9px] font-bold uppercase tracking-widest">Retry Look</span>
                                                    </button>
                                                </div>
                                            )}

                                            {/* Loading Overlay if regenerating */}
                                            {progress[item.id] === 'loading' && (
                                                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                                                    <Loader2 className="animate-spin text-black" size={24} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest mt-2">Refining...</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                            {progress[item.id] === 'loading' ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="animate-spin text-black" size={24} />
                                                    <span className="text-[8px] font-black uppercase tracking-widest">Rendering</span>
                                                </div>
                                            ) : (
                                                <LayoutGrid size={24} className="text-slate-200" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex md:flex-col gap-2">
                                    <button onClick={() => removeFromWishlist(item.id)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                                        <Trash2 size={20} />
                                    </button>
                                    <button onClick={() => { setActiveAIItem(item); setIsAIModalOpen(true); }} className="p-3 text-slate-300 hover:text-black transition-colors">
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100 flex flex-col items-center">
                        <HeartOff className="text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No items saved in studio</p>
                    </div>
                )}
            </main>

            <AIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} baseImage={baseImage} jewelryItem={activeAIItem} />

            {/* Image Preview Modal */}
            <AnimatePresence>
                {previewImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={() => setPreviewImage(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            className="relative max-w-7xl w-full max-h-screen flex items-center justify-center p-4"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img src={previewImage} alt="Full View" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />

                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full backdrop-blur-md transition-all"
                            >
                                <X size={24} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}