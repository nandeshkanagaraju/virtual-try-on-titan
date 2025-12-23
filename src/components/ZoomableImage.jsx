import React, { useState } from 'react';

export default function ZoomableImage({ src, alt, onClick, className }) {
    const [zoom, setZoom] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.target.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setPosition({ x, y });
    };

    return (
        <div
            className={`relative overflow-hidden cursor-zoom-in ${className}`}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
            onClick={onClick}
        >
            <img
                src={src}
                alt={alt}
                className={`w-full h-full object-cover transition-transform duration-200 ease-out origin-center pointer-events-none ${zoom ? 'scale-150' : 'scale-100'}`}
                style={zoom ? { transformOrigin: `${position.x}% ${position.y}%` } : {}}
            />
        </div>
    );
}
