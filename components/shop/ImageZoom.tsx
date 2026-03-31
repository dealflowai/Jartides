"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface ImageZoomProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export default function ImageZoom({ src, alt, priority }: ImageZoomProps) {
  const [zooming, setZooming] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full overflow-hidden rounded-xl bg-white border border-gray-200 cursor-zoom-in"
      onMouseEnter={() => setZooming(true)}
      onMouseLeave={() => setZooming(false)}
      onMouseMove={handleMouseMove}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-1 transition-transform duration-200"
        style={
          zooming
            ? {
                transform: "scale(1.5)",
                transformOrigin: `${position.x}% ${position.y}%`,
              }
            : undefined
        }
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
      />
    </div>
  );
}
