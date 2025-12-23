import React from 'react';
import { Link } from 'react-router-dom';

export default function Header() {
    return (
        <header className="w-full bg-[#F0EEFF] px-10 py-5 flex justify-between items-center border-b-[3px] border-black sticky top-0 z-50">
            <Link to="/" className="text-3xl font-black tracking-tighter uppercase hover:text-[#EE5D43] transition-colors">
                AI TRY ON
            </Link>

            <nav className="hidden lg:flex gap-15 text-lg font-bold uppercase tracking-widest ml-170">
                {/* Points to default Jewelry Showcase */}
                <Link to="/showcase" className="hover:text-[#EE5D43] transition-colors">
                    Jewelery Gallery
                </Link>

                {/* NOW POINTS TO THE CORRECT EYEWEAR SHOWCASE */}
                <Link to="/eyewear-showcase" className="hover:text-[#EE5D43] transition-colors">
                    Eyewear Gallery
                </Link>

                
            </nav>

          
        </header>
    );
}