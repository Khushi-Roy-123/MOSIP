import React, { useState, useRef, useEffect } from 'react';

interface ImageViewerProps {
  src: string;
  alt: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAdjustment = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.5, scale + scaleAdjustment), 4);
    setScale(newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const rotateRight = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden shadow-lg">
      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <button 
          onClick={rotateRight}
          className="p-2 bg-black/60 text-white rounded hover:bg-black/80 transition-colors"
          title="Rotate"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button 
          onClick={resetView}
          className="p-2 bg-black/60 text-white rounded hover:bg-black/80 transition-colors"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      <div 
        ref={containerRef}
        className="flex-grow overflow-hidden relative cursor-move bg-gray-800 flex items-center justify-center"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
          className="origin-center"
        >
          <img 
            src={src} 
            alt={alt} 
            className="max-w-full max-h-none select-none pointer-events-none" 
            draggable={false}
          />
        </div>
      </div>
      
      <div className="bg-gray-800 text-white text-xs py-1 px-4 flex justify-between items-center border-t border-gray-700">
         <span>Scroll to Zoom • Drag to Pan</span>
         <span>{Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
};

export default ImageViewer;
