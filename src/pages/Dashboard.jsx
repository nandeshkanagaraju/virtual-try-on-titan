import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Header from '../components/Header';

const ParallaxCard = ({ item, navigate }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const bgX = useTransform(mouseXSpring, [-0.5, 0.5], ["-10%", "10%"]);
    const bgY = useTransform(mouseYSpring, [-0.5, 0.5], ["-10%", "10%"]);
    const stickerX = useTransform(mouseXSpring, [-0.5, 0.5], [20, -20]);
    const stickerY = useTransform(mouseYSpring, [-0.5, 0.5], [20, -20]);

    return (
        <motion.div
            onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                x.set((e.clientX - rect.left) / rect.width - 0.5);
                y.set((e.clientY - rect.top) / rect.height - 0.5);
            }}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            onClick={() => navigate(item.path)}
            className="relative group bg-white border-[3px] border-black rounded-[40px] p-3 h-[500px] cursor-pointer shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 overflow-hidden"
        >
            <div className="bg-white rounded-[32px] h-full w-full relative overflow-hidden flex flex-col justify-end p-8">
                
                <motion.img 
                    style={{ x: bgX, y: bgY, scale: 1.2 }}
                    src={item.image} 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none"
                />

                <motion.div 
                    style={{ x: stickerX, y: stickerY }}
                    className="absolute top-10 right-6 bg-[#BAED91] border-2 border-black px-4 py-2 rounded-lg rotate-12 shadow-lg z-20"
                >
                    <span className="text-[12px] font-black uppercase tracking-tight italic">
                        {item.brand}
                    </span>
                </motion.div>

                <div className="relative z-10 bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                    <h3 className="text-5xl font-black text-black uppercase leading-[0.85] mb-4 tracking-tighter">
                        {item.title}
                    </h3>
                    <div className="bg-white border-2 border-black p-4 rounded-xl flex justify-between items-center group-hover:bg-[#BAED91] transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-[10px] font-black uppercase tracking-wider">Launch {item.title} Try-On</p>
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black">→</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function Dashboard() {
    const navigate = useNavigate();

    const modules = [
        {
            title: "Jewels",
            brand: "tanishq",
            path: "/jewelry", // REVERTED TO TRY-ON PAGE
            image: "/images/necklace8.png",
            desc: "Virtual Jewelry Experience"
        },
        {
            title: "Eyewear",
            brand: "eye plus",
            path: "/eyewear", // REVERTED TO TRY-ON PAGE
            image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800",
            desc: "Titan Digital Frames"
        },
        {
            title: "Cloths",
            brand: "taniera",
            path: "/apparel", // REVERTED TO TRY-ON PAGE
            image: "/images/sareemodel2.png",
            desc: "Indian Luxe Apparel"
        }
    ];

    return (
        <div className="min-h-screen bg-[#F0EEFF] font-['Archivo_Black',sans-serif] text-black pb-20">
            <Header />

            <section className="pt-16 pb-12 px-6 max-w-7xl mx-auto">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <h1 className="text-8xl md:text-[140px] leading-[0.8] font-black uppercase tracking-tighter mb-8">
                        VIRTUAL <br/>TRY ON 
                    </h1>
                    <p className="text-2xl md:text-3xl font-black text-black">
                        Select a module to begin your digital style experience.
                    </p>
                </motion.div>
            </section>

            <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
                {modules.map((item, index) => (
                    <ParallaxCard key={index} item={item} navigate={navigate} />
                ))}
            </main>
        </div>
    );
}