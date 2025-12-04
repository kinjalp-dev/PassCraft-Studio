import React, { useRef, useState, useEffect, useMemo } from 'react';
import { PlaceholderConfig, TextFieldConfig } from '../../types';
import clsx from 'clsx';

interface TemplatePreviewCanvasProps {
  imageUrl: string;
  imagePlaceholder: PlaceholderConfig;
  onImagePlaceholderChange: (newConfig: PlaceholderConfig) => void;
  
  nameField?: TextFieldConfig;
  onNameFieldChange?: (newConfig: TextFieldConfig) => void;

  activeElement: 'image' | 'name';
  onSelectElement: (el: 'image' | 'name') => void;

  mode: 'edit' | 'preview';
  sampleData?: { photoUrl: string; name: string };
}

// Helper to round percentages to 2 decimal places
const round2 = (num: number) => Math.round(num * 100) / 100;

export const TemplatePreviewCanvas: React.FC<TemplatePreviewCanvasProps> = ({
  imageUrl,
  imagePlaceholder,
  onImagePlaceholderChange,
  nameField,
  onNameFieldChange,
  activeElement,
  onSelectElement,
  mode,
  sampleData = { photoUrl: 'https://picsum.photos/id/64/400/400', name: 'John Doe' }
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null); // 'nw', 'ne', 'sw', 'se'
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startConfig, setStartConfig] = useState<any>(null); // Holds either PlaceholderConfig or TextFieldConfig

  // Real-time font scaling logic
  const [canvasWidth, setCanvasWidth] = useState(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (
    e: React.PointerEvent, 
    element: 'image' | 'name', 
    action: 'drag' | 'resize', 
    handle?: string
  ) => {
    if (mode === 'preview') return;
    e.preventDefault();
    e.stopPropagation();
    
    // Select the element we are interacting with
    onSelectElement(element);
    
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    
    setStartPos({ x: e.clientX, y: e.clientY });
    
    // Snapshot the config of the element we are about to move
    if (element === 'image') {
      setStartConfig({ ...imagePlaceholder });
    } else if (element === 'name' && nameField) {
      setStartConfig({ ...nameField });
    }
    
    if (action === 'drag') setIsDragging(true);
    if (action === 'resize' && handle) setIsResizing(handle);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if ((!isDragging && !isResizing) || !startConfig) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - startPos.x) / rect.width) * 100;
    const deltaY = ((e.clientY - startPos.y) / rect.height) * 100;

    let newConfig = { ...startConfig };

    if (isDragging) {
      newConfig.x = round2(Math.max(0, Math.min(100 - newConfig.width, startConfig.x + deltaX)));
      newConfig.y = round2(Math.max(0, Math.min(100 - newConfig.height, startConfig.y + deltaY)));
    } else if (isResizing) {
      if (isResizing.includes('e')) {
        newConfig.width = round2(Math.max(5, Math.min(100 - startConfig.x, startConfig.width + deltaX)));
      }
      if (isResizing.includes('s')) {
        newConfig.height = round2(Math.max(5, Math.min(100 - startConfig.y, startConfig.height + deltaY)));
      }
      if (isResizing.includes('w')) {
        const potentialWidth = startConfig.width - deltaX;
        if (potentialWidth > 5 && startConfig.x + deltaX >= 0) {
            newConfig.width = round2(potentialWidth);
            newConfig.x = round2(startConfig.x + deltaX);
        }
      }
      if (isResizing.includes('n')) {
        const potentialHeight = startConfig.height - deltaY;
        if (potentialHeight > 5 && startConfig.y + deltaY >= 0) {
            newConfig.height = round2(potentialHeight);
            newConfig.y = round2(startConfig.y + deltaY);
        }
      }
    }

    // Dispatch update to the correct handler
    if (activeElement === 'image') {
      onImagePlaceholderChange(newConfig);
    } else if (activeElement === 'name' && onNameFieldChange) {
      onNameFieldChange(newConfig);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    setIsResizing(null);
    setStartConfig(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // Calculate dynamic font size based on current canvas width vs standard width
  const dynamicFontSize = useMemo(() => {
    if (!nameField) return 16;
    const scaleFactor = canvasWidth / 800; // Assuming 800px is "standard" design width
    return Math.round(nameField.fontSize * scaleFactor);
  }, [nameField?.fontSize, canvasWidth]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 p-8 rounded-lg border border-slate-300 overflow-hidden select-none">
      {/* 
         CRITICAL FIX: 
         The outer wrapper holds the shadow/border/rounded styles.
         The inner 'containerRef' div is an inline-flex that tightly wraps the image.
         This ensures getBoundingClientRect() returns ONLY the image dimensions, 
         preventing offset bugs caused by padding or full-width behavior.
      */}
      <div className="relative shadow-2xl bg-white leading-[0]">
        <div 
          ref={containerRef}
          className="relative inline-flex"
          style={{ touchAction: 'none' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <img 
            src={imageUrl} 
            alt="Template Base" 
            className="block max-w-full max-h-[70vh] w-auto h-auto object-contain pointer-events-none select-none"
            draggable={false}
          />

          {/* --- LAYER 1: CONTENT (Image & Text) --- */}
          
          {/* Image Content */}
          <div
            className="absolute overflow-hidden z-10 pointer-events-none"
            style={{
              left: `${imagePlaceholder.x}%`,
              top: `${imagePlaceholder.y}%`,
              width: `${imagePlaceholder.width}%`,
              height: `${imagePlaceholder.height}%`,
              borderRadius: imagePlaceholder.shape === 'circle' ? '50%' : '0',
            }}
          >
             {mode === 'preview' ? (
                <img 
                  src={sampleData.photoUrl} 
                  className="w-full h-full object-cover" 
                  alt="User content"
                />
             ) : (
                <div className="w-full h-full bg-brand-500/10 flex items-center justify-center">
                  <span className="text-brand-700 font-bold text-xs opacity-50">PHOTO</span>
                </div>
             )}
          </div>

          {/* Text Content */}
          {nameField && (
             <div
               className="absolute flex items-center z-10 pointer-events-none"
               style={{
                 left: `${nameField.x}%`,
                 top: `${nameField.y}%`,
                 width: `${nameField.width}%`,
                 height: `${nameField.height}%`,
                 justifyContent: nameField.align === 'center' ? 'center' : nameField.align === 'right' ? 'flex-end' : 'flex-start',
               }}
             >
               <span 
                  style={{ 
                    color: nameField.color, 
                    fontSize: `${dynamicFontSize}px`,
                    fontFamily: nameField.fontFamily,
                    whiteSpace: 'nowrap',
                    lineHeight: 1, // Ensure tight bounding box for text
                  }}
                  className="font-bold px-1"
               >
                  {mode === 'preview' ? sampleData.name : 'NAME HERE'}
               </span>
             </div>
          )}


          {/* --- LAYER 2: INTERACTIVE OVERLAY (Borders & Handles) --- */}
          {/* This layer sits on top and handles interactions, but is visually separate to avoid border-offset bugs */}
          
          {/* Image Zone Controls */}
          <div
            className={clsx(
              "absolute transition-all",
              mode === 'edit' && activeElement === 'image' ? "border-2 border-brand-500 z-30 cursor-move" : "z-20",
              mode === 'edit' && activeElement !== 'image' ? "hover:border-2 hover:border-brand-300 hover:border-dashed hover:bg-brand-500/5 cursor-pointer" : ""
            )}
            style={{
              left: `${imagePlaceholder.x}%`,
              top: `${imagePlaceholder.y}%`,
              width: `${imagePlaceholder.width}%`,
              height: `${imagePlaceholder.height}%`,
              borderRadius: imagePlaceholder.shape === 'circle' ? '50%' : '0'
            }}
            onPointerDown={(e) => handlePointerDown(e, 'image', 'drag')}
          >
             {mode === 'edit' && activeElement === 'image' && (
                <>
                  {['nw', 'ne', 'sw', 'se'].map(handle => (
                    <div 
                      key={handle}
                      className={clsx(
                        "absolute w-3 h-3 bg-white border border-brand-500 z-40",
                        handle === 'nw' && "-top-1.5 -left-1.5 cursor-nw-resize",
                        handle === 'ne' && "-top-1.5 -right-1.5 cursor-ne-resize",
                        handle === 'sw' && "-bottom-1.5 -left-1.5 cursor-sw-resize",
                        handle === 'se' && "-bottom-1.5 -right-1.5 cursor-se-resize"
                      )}
                      onPointerDown={(e) => handlePointerDown(e, 'image', 'resize', handle)}
                    />
                  ))}
                </>
             )}
          </div>

          {/* Name Field Controls */}
          {nameField && (
            <div
               className={clsx(
                 "absolute transition-all",
                 mode === 'edit' && activeElement === 'name' ? "border-2 border-purple-500 z-30 cursor-move" : "z-20",
                 mode === 'edit' && activeElement !== 'name' ? "hover:border-2 hover:border-purple-300 hover:border-dashed hover:bg-purple-500/5 cursor-pointer" : ""
               )}
               style={{
                 left: `${nameField.x}%`,
                 top: `${nameField.y}%`,
                 width: `${nameField.width}%`,
                 height: `${nameField.height}%`,
               }}
               onPointerDown={(e) => handlePointerDown(e, 'name', 'drag')}
             >
               {mode === 'edit' && activeElement === 'name' && (
                 <>
                   {['nw', 'ne', 'sw', 'se'].map(handle => (
                     <div 
                       key={handle}
                       className={clsx(
                         "absolute w-3 h-3 bg-white border border-purple-500 z-40",
                         handle === 'nw' && "-top-1.5 -left-1.5 cursor-nw-resize",
                         handle === 'ne' && "-top-1.5 -right-1.5 cursor-ne-resize",
                         handle === 'sw' && "-bottom-1.5 -left-1.5 cursor-sw-resize",
                         handle === 'se' && "-bottom-1.5 -right-1.5 cursor-se-resize"
                       )}
                       onPointerDown={(e) => handlePointerDown(e, 'name', 'resize', handle)}
                     />
                   ))}
                 </>
               )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};