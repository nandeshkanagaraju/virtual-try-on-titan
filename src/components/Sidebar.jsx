import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, User, Upload, ArrowRight, Heart, Filter, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { JEWELRY_CATALOG } from '../data/catalog';
import AIModal from '../components/AIModal';
import GenerativeCard from './GenerativeCard';
import { performVirtualTryOn } from '../services/runwayService';

import CameraCapture from './CameraCapture';

export default function JewelryShowcase() {
    const [baseImage, setBaseImage] = useState(null);
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [activeAIItem, setActiveAIItem] = useState(null);
    const [isUploadPromptOpen, setIsUploadPromptOpen] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [wishlist, setWishlist] = useState([]);
    const [filterMode, setFilterMode] = useState('all');
    const fileInputRef = useRef(null);

    // --- BATCH GENERATION STATE ---
    const [generatedResults, setGeneratedResults] = useState({}); // { itemId: url }
    const [generationStatus, setGenerationStatus] = useState({}); // { itemId: 'idle' | 'pending' | 'success' | 'error' }

    // Constants
    const apiKey = import.meta.env.VITE_RUNWAY_API_KEY;

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('taneria_wishlist') || '[]');
        setWishlist(saved);

        // Load Persisted Generated Results
        const savedResults = JSON.parse(localStorage.getItem('taneria_wishlist_results') || '{}');
        setGeneratedResults(savedResults);
    }, []);

    // FILTER LOGIC - Moved up for scope access
    const filteredCatalog = filterMode === 'all'
        ? JEWELRY_CATALOG
        : JEWELRY_CATALOG.filter(item => item.type === filterMode);

    // TRIGGERS WHEN BASE IMAGE CHANGES (Only on upload/capture)
    useEffect(() => {
        if (baseImage) {
            triggerBatchGeneration();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [baseImage]); // Remove filterMode to prevent auto-gen on tab switch

    const toggleWishlist = (id) => {
        let updatedWishlist = wishlist.includes(id)
            ? wishlist.filter(itemId => itemId !== id)
            : [...wishlist, id];
        setWishlist(updatedWishlist);
        localStorage.setItem('taneria_wishlist', JSON.stringify(updatedWishlist));
        window.dispatchEvent(new Event('storage'));
    };

    const handleTryNowAction = (item) => { // Manual Trigger
        setActiveAIItem(item);
        if (!baseImage) setIsUploadPromptOpen(true);
        else {
            // Check if we already have it generated
            if (generatedResults[item.id]) {
                // Just open modal with existing result? Or re-generate? 
                // For now, let's just open the AI Modal normally for full res view
                setIsAIModalOpen(true);
            } else {
                setIsAIModalOpen(true); // Default behavior
            }
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setBaseImage(event.target.result);
                // Clear previous results for new identity
                setGeneratedResults({});
                setGenerationStatus({});
                localStorage.removeItem('taneria_wishlist_results');

                setIsUploadPromptOpen(false);
                if (activeAIItem) {
                    setIsAIModalOpen(true);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCameraCapture = (imageDataUrl) => {
        setBaseImage(imageDataUrl);
        // Clear previous results for new identity
        setGeneratedResults({});
        setGenerationStatus({});
        localStorage.removeItem('taneria_wishlist_results');

        setShowCamera(false);
        setIsUploadPromptOpen(false);

        if (activeAIItem) {
            setIsAIModalOpen(true);
        }
    };

    // --- BATCH GENERATION LOGIC ---
    const triggerBatchGeneration = async () => {
        if (!apiKey) {
            console.warn("Runway API Key missing. Skipping auto-generation.");
            return;
        }

        const itemsToProcess = filteredCatalog.filter(item =>
            !generatedResults[item.id] && // Not already generated
            (!generationStatus[item.id] || generationStatus[item.id] === 'error') // Not currently pending
        );

        if (itemsToProcess.length === 0) return;

        console.log(`Starting Batch Generation for ${itemsToProcess.length} items...`);

        // Update status to pending for all
        const newStatus = { ...generationStatus };
        itemsToProcess.forEach(item => {
            newStatus[item.id] = 'pending';
        });
        setGenerationStatus(newStatus);

        // Process sequentially to be gentle on browser/API? Or parallel?
        // Parallel might be too heavy. Let's do small batches or one by one.
        // For a demo, parallel is risky but fast. Let's do parallel with Promise.allSettled
        // BUT actually, iterating is safer.

        itemsToProcess.forEach(async (item) => {
            try {
                // Call the service
                const url = await performVirtualTryOn(baseImage, item, apiKey);

                // Update Success State
                setGeneratedResults(prev => {
                    const next = { ...prev, [item.id]: url };
                    localStorage.setItem('taneria_wishlist_results', JSON.stringify(next));
                    return next;
                });
                setGenerationStatus(prev => ({ ...prev, [item.id]: 'success' }));

            } catch (err) {
                console.error(`Failed generation for ${item.id}`, err);
                setGenerationStatus(prev => ({ ...prev, [item.id]: 'error' }));
            }
        });
    };

    // Retry Handler
    const handleRetry = async (item) => {
        if (!baseImage) return;
        setGenerationStatus(prev => ({ ...prev, [item.id]: 'pending' }));
        try {
            const url = await performVirtualTryOn(baseImage, item, apiKey);
            setGeneratedResults(prev => {
                const next = { ...prev, [item.id]: url };
                localStorage.setItem('taneria_wishlist_results', JSON.stringify(next));
                return next;
            });
            setGenerationStatus(prev => ({ ...prev, [item.id]: 'success' }));
        } catch (err) {
            setGenerationStatus(prev => ({ ...prev, [item.id]: 'error' }));
        }
    };




    return (
        <div className="relative w-full min-h-screen bg-[#FDFDFF] font-['Inter',sans-serif] text-slate-900 overflow-x-hidden">

            {/* 1. Header Section */}
            <div className="max-w-7xl mx-auto px-8 pt-16 pb-12 flex justify-between items-end border-b border-slate-100">
                <div className="flex flex-col">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-2">Exclusive</h2>
                    <h1 className="text-4xl font-bold tracking-tight">Jewelery Gallery</h1>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/wishlist" className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all group">
                        <Heart size={16} className={wishlist.length > 0 ? "fill-red-500 text-red-500" : "text-slate-400"} />
                        <span className="text-[11px] font-bold uppercase tracking-widest">Wishlist</span>
                        {wishlist.length > 0 && <span className="ml-1 bg-black text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{wishlist.length}</span>}
                    </Link>

                    {baseImage ? (
                        <div className="flex items-center gap-3 bg-white border border-slate-200 p-1 pr-4 rounded-full shadow-sm">
                            <img src={baseImage} className="w-10 h-10 rounded-full object-cover border border-slate-100" alt="User" />
                            <button onClick={() => setBaseImage(null)} className="text-[10px] font-bold uppercase text-red-500 hover:underline">Change Photo</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsUploadPromptOpen(true)}
                            className="bg-black text-white px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all text-[11px] font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                            <Camera size={16} /> Upload / Camera
                        </button>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen mr-50 mb-20">

                {/* 2. FILTER SIDEBAR (Window at the left) */}
                <aside className="w-full md:w-64 p-8 border-r border-slate-100 sticky top-32 h-fit">
                    <div className="flex items-center gap-2 mb-8 text-slate-400 mr-20">
                        <Filter size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Categories</span>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {[
                            { id: 'all', label: 'All Collection' },
                            { id: 'necklace', label: 'Necklaces' },
                            { id: 'earring', label: 'Earrings' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilterMode(btn.id)}
                                className={`text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all ${filterMode === btn.id
                                    ? 'bg-black text-white shadow-lg'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-black'
                                    }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </nav>

                    <div className="mt-12 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                        <Sparkles size={16} className="text-yellow-600 mb-2" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed tracking-wider">
                            Select a specific category (e.g. Necklaces) and upload a photo to auto-generate try-ons for the entire collection.
                        </p>
                    </div>
                </aside>

                {/* 3. Main Grid Content */}
                <main className="flex-1 p-8">
                    {!baseImage && filterMode !== 'all' && (
                        <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                                Upload a photo to see these items on you instantly.
                            </span>
                            <button
                                onClick={() => setIsUploadPromptOpen(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest"
                            >
                                Upload Now
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence mode='popLayout'>
                            {filteredCatalog.map((item) => {
                                const isWishlisted = wishlist.includes(item.id);
                                return (
                                    <GenerativeCard
                                        key={item.id}
                                        item={item}
                                        baseImage={baseImage}
                                        generatedImage={generatedResults[item.id]}
                                        status={generationStatus[item.id] || 'idle'}
                                        onWishlist={toggleWishlist}
                                        isWishlisted={isWishlisted}
                                        onRetry={handleRetry}
                                        onTryNow={handleTryNowAction}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showCamera && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200]"
                    >
                        <CameraCapture
                            onCapture={handleCameraCapture}
                            onClose={() => setShowCamera(false)}
                        />
                    </motion.div>
                )}

                {isUploadPromptOpen && !showCamera && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white border-2 border-black rounded-[40px] p-10 max-w-sm w-full text-center shadow-[20px_20px_0px_0px_rgba(0,0,0,1)]">
                            <div className="w-20 h-20 bg-slate-50 border-2 border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <User size={40} />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Upload Portrait</h2>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-loose mb-8 px-4">Provide a photo to preview the {activeAIItem ? <span className="text-black">{activeAIItem.name}</span> : "Collection"}.</p>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                            <div className="flex flex-col gap-3">
                                <button onClick={() => fileInputRef.current.click()} className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                                    <Upload size={16} /> Upload Photo
                                </button>
                                <button onClick={() => setShowCamera(true)} className="w-full bg-white border-2 border-black text-black py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
                                    <Camera size={16} /> Use Camera
                                </button>
                                <button onClick={() => setIsUploadPromptOpen(false)} className="w-full py-4 text-[10px] font-black uppercase text-slate-400 hover:text-black">Maybe later</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} baseImage={baseImage} jewelryItem={activeAIItem} />
        </div>
    );
}