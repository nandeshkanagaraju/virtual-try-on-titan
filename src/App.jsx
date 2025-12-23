import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Showcase from './pages/Showcase';
import EyewearShowcase from './pages/EyewearShowcase';
import Wishlist from './pages/Wishlist';



import VirtualAssistant from './components/VirtualAssistant';

export default function App() {
    return (
        <>
            <VirtualAssistant />
            <Routes>
                {/* The main dashboard/menu */}
                <Route path="/" element={<Dashboard />} />

                {/* We reuse the Home "Engine" for different sections */}
                <Route path="/jewelry" element={<Home mode="jewelry" />} />
                <Route path="/eyewear" element={<Home mode="eyewear" />} />
                <Route path="/apparel" element={<Home mode="apparel" />} />
                <Route path="/wishlist" element={<Wishlist />} />
                {/* Original routes */}
                <Route path="/showcase" element={<Showcase />} />
                <Route path="/eyewear-showcase" element={<EyewearShowcase />} />
            </Routes>
        </>
    );
}