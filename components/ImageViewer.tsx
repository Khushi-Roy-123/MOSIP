import React, { useState, useRef } from 'react';
import { ExtractedField } from '../types';

interface ImageViewerProps {
  src: string;
  alt: string;
  fields?: { [key: string]: ExtractedField };
  activePageIndex?: number;
}

const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, fields, activePageIndex = 0 }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [showTextOverlay, setShowTextOverlay] = useState(false);
  
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

  // Helper to determine color based on confidence
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return { 
      border: 'border-green-500', 
      bg: 'bg-green-500/20', 
      textBg: 'bg-green-100', 
      text: 'text-green-900',
      fill: 'bg-green-500' 
    };
    if (confidence >= 70) return { 
      border: 'border-yellow-500', 
      bg: 'bg-yellow-500/20', 
      textBg: 'bg-yellow-100', 
      text: 'text-yellow-900',
      fill: 'bg-yellow-500' 
    };
    return { 
      border: 'border-red-500', 
      bg: 'bg-red-500/20', 
      textBg: 'bg-red-100', 
      text: 'text-red-900',
      fill: 'bg-red-500' 
    };
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-xl overflow-hidden shadow-lg relative group/viewer">
      
      {/* Controls Bar */}
      <div className="absolute top-4 right-4 z-20 flex space-x-2">
        <button 
          onClick={() => setShowTextOverlay(!showTextOverlay)}
          className={`p-2 rounded border border-white/10 transition-colors shadow-lg backdrop-blur-sm ${showTextOverlay ? 'bg-mosip-blue text-white' : 'bg-black/60 text-white hover:bg-black/80'}`}
          title={showTextOverlay ? "Hide Text Overlay" : "Show Text Overlay"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>
        <button 
          onClick={rotateRight}
          className="p-2 bg-black/60 text-white rounded border border-white/10 hover:bg-black/80 transition-colors shadow-lg backdrop-blur-sm"
          title="Rotate Image"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button 
          onClick={resetView}
          className="p-2 bg-black/60 text-white rounded border border-white/10 hover:bg-black/80 transition-colors shadow-lg backdrop-blur-sm"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Main Image Area */}
      <div 
        ref={containerRef}
        className="flex-grow overflow-hidden relative cursor-move bg-gray-800 flex items-center justify-center pattern-grid-gray-700/10"
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
          className="origin-center relative shadow-2xl"
        >
          <img 
            src={src} 
            alt={alt} 
            className="max-w-full max-h-none select-none pointer-events-none" 
            draggable={false}
          />
          
          {/* Overlay Bounding Boxes & Text */}
          {fields && Object.entries(fields).map(([key, data]) => {
            const field = data as ExtractedField;
            
            // Only show boxes for the current active page if sourcePageIdx is defined
            if (field.sourcePageIdx !== undefined && field.sourcePageIdx !== activePageIndex) {
              return null;
            }

            if (!field.boundingBox || field.boundingBox.length !== 4) return null;

            const [ymin, xmin, ymax, xmax] = field.boundingBox;
            const colors = getConfidenceColor(field.confidence);

            const style: React.CSSProperties = {
              top: `${ymin / 10}%`,
              left: `${xmin / 10}%`,
              height: `${(ymax - ymin) / 10}%`,
              width: `${(xmax - xmin) / 10}%`,
              position: 'absolute',
              zIndex: 10
            };

            return (
              <div 
                key={key}
                style={style}
                className={`border-2 ${colors.border} ${showTextOverlay ? colors.bg : 'hover:bg-opacity-30 hover:bg-white'} transition-all duration-200 cursor-help flex items-center justify-center`}
                onMouseEnter={() => setHoveredField(key)}
                onMouseLeave={() => setHoveredField(null)}
              >
                {/* Text Overlay Mode */}
                {showTextOverlay ? (
                  <div className={`absolute z-20 px-1.5 py-0.5 rounded shadow-sm border border-black/10 flex flex-col items-center justify-center min-w-min whitespace-nowrap transform scale-[0.8] md:scale-100 origin-center ${colors.textBg} ${colors.text}`}>
                     <span className="text-[10px] md:text-xs font-bold leading-none">{field.value || "(Empty)"}</span>
                     <span className="text-[8px] opacity-70 leading-none mt-0.5">{Math.round(field.confidence)}%</span>
                  </div>
                ) : (
                  // Hover Tooltip Mode
                  hoveredField === key && (
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900/95 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-600 z-50 whitespace-nowrap pointer-events-none backdrop-blur-sm">
                      <div className="flex items-center gap-2 mb-1">
                         <span className="font-bold text-mosip-orange capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                         <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${colors.textBg} ${colors.text}`}>
                           {Math.round(field.confidence)}%
                         </span>
                      </div>
                      <div className="text-gray-200 text-xs font-mono bg-black/30 px-1.5 py-0.5 rounded border border-white/10">
                        {field.value}
                      </div>
                      {/* Arrow */}
                      <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 border-r border-b border-gray-600 rotate-45"></div>
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer Info Bar */}
      <div className="bg-gray-800/90 text-white text-xs py-1.5 px-4 flex justify-between items-center border-t border-gray-700 backdrop-blur-md">
         <div className="flex gap-4">
           <span className="text-gray-400 font-medium">Confidence:</span>
           <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></span> High</span>
           <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-500 shadow-sm shadow-yellow-500/50"></span> Medium</span>
           <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 shadow-sm shadow-red-500/50"></span> Low</span>
         </div>
         <span className="font-mono text-gray-400">{Math.round(scale * 100)}%</span>
      </div>
    </div>
  );
};

export default ImageViewer;